import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { config } from '../config/config.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { generateOtpCode, hashOtpCode, verifyOtpCode, OTP_TTL_MS } from '../services/otpService.js';
import { sendOtpEmail, sendNewUserEmail, type SendOtpResult } from '../services/emailService.js';
import { touchStreak } from '../services/progressService.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers (shared across register / change-password / reset-password)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Password rule (per product spec):
 *   - at least 6 characters long
 *   - contains at least one letter  [a-zA-Z]
 *   - contains at least one digit   [0-9]
 *
 * Examples:
 *   "044044044"   → NO  (no letter)
 *   "044044a044"  → accepted (weak but valid: has letter + digit)
 */
const validatePassword = (password: string): boolean => {
  if (typeof password !== 'string') return false;
  if (password.length < 6) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

const PASSWORD_RULE_MESSAGE =
  'Password must be at least 6 characters and include both letters and numbers';

const validateName = (name: string): boolean => {
  if (!name) return false;
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s-']*$/.test(name);
};

const validateUsername = (username: string): boolean => {
  if (!username) return false;
  return (
    username.length >= 3 &&
    username.length <= 30 &&
    /^[a-z0-9_-]+$/.test(username.toLowerCase())
  );
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isEmailish = (value: string): boolean => value.includes('@');

/** Issues a full (24h) login JWT for an existing verified user. */
const issueLoginToken = (user: { _id: import('mongoose').Types.ObjectId | string; username: string; email: string }) =>
  jwt.sign(
    { userId: String(user._id), username: user.username, email: user.email },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

/** Issues a short-lived (10 min) "pending" JWT used during registration / reset. */
const issuePendingToken = (
  userId: string,
  purpose: 'verify' | 'reset',
  extra: Record<string, unknown> = {}
) =>
  jwt.sign({ userId, purpose, ...extra }, config.jwtSecret, {
    expiresIn: `${OTP_TTL_MS / 1000}s`,
  });

const publicUser = (user: {
  _id: import('mongoose').Types.ObjectId | string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}) => ({
  id: String(user._id),
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
});

// ─────────────────────────────────────────────────────────────────────────────
// Registration — Step 1: validate name (kept for compatibility)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register/step1', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;

    if (!validateName(firstName)) {
      res.status(400).json({
        success: false,
        error: 'First name must be 2-50 characters with valid characters only',
      });
      return;
    }

    if (!validateName(lastName)) {
      res.status(400).json({
        success: false,
        error: 'Last name must be 2-50 characters with valid characters only',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Step 1 validated successfully',
      data: { firstName: firstName.trim(), lastName: lastName.trim() },
    });
  } catch (error) {
    console.error('Registration step 1 error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration step 1' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Registration — Initiate (replaces old step2)
//   Validates input, creates User (unverified), sends OTP, returns pendingToken.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register/initiate', async (req: Request, res: Response): Promise<void> => {
  try {
    const firstName = typeof req.body.firstName === 'string' ? req.body.firstName.trim() : '';
    const lastName = typeof req.body.lastName === 'string' ? req.body.lastName.trim() : '';
    const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password, confirmPassword } = req.body;

    if (!validateName(firstName)) {
      res.status(400).json({ success: false, error: 'Invalid first name' });
      return;
    }
    if (!validateName(lastName)) {
      res.status(400).json({ success: false, error: 'Invalid last name' });
      return;
    }
    if (!validateUsername(username)) {
      res
        .status(400)
        .json({ success: false, error: 'Username must be 3-30 characters, lowercase alphanumeric with _ or -' });
      return;
    }
    if (!validateEmail(email)) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address' });
      return;
    }
    if (!validatePassword(password)) {
      res.status(400).json({ success: false, error: PASSWORD_RULE_MESSAGE });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ success: false, error: 'Passwords do not match' });
      return;
    }

    // Reject if username/email already exists AND is verified.
    // If an unverified record exists with the same credentials, we simply reuse it
    // (lets the user retry OTP without re-entering everything).
    let user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (user && user.isVerified) {
      res.status(409).json({
        success: false,
        error: user.username === username ? 'Username already exists' : 'Email already exists',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (user && !user.isVerified) {
      // Reuse the existing unverified doc and refresh its fields.
      user.firstName = firstName;
      user.lastName = lastName;
      user.username = username;
      user.email = email;
      user.passwordHash = passwordHash;
      user.authProvider = 'local';
    } else {
      user = new User({
        firstName,
        lastName,
        username,
        email,
        passwordHash,
        isVerified: false,
        authProvider: 'local',
      });
    }

    // Generate + store OTP
    const code = generateOtpCode();
    user.emailVerificationCode = await hashOtpCode(code);
    user.emailVerificationExpires = new Date(Date.now() + OTP_TTL_MS);

    await user.save();

    // Send the OTP email in the BACKGROUND — never block the response on SMTP.
    // Gmail can take 1-2 minutes (or stall), which makes "Send code" appear
    // frozen. The pending token is returned instantly; the email keeps going.
    // Dev mode awaits because it only logs to the console (instant) and the
    // devCode must be included in the response.
    const emailPromise = sendOtpEmail(user.email, code, 'verify');
    let emailResult: SendOtpResult | undefined;
    if (config.isEmailReal) {
      emailPromise.catch((e) => console.error('OTP email background send failed:', e));
    } else {
      emailResult = await emailPromise;
    }

    const pendingToken = issuePendingToken(user._id.toString(), 'verify');

    res.status(200).json({
      success: true,
      message: 'Verification code sent. Check your email.',
      pendingToken,
      // devCode is only populated in dev mode (no SMTP configured)
      ...(emailResult?.devCode ? { devCode: emailResult.devCode, devMode: true } : {}),
      email: user.email,
    });
  } catch (error) {
    console.error('Registration initiate error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Registration — Verify OTP (completes registration)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pendingToken, otp } = req.body;

    if (!pendingToken || !otp) {
      res.status(400).json({ success: false, error: 'Verification code is required' });
      return;
    }

    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(pendingToken, config.jwtSecret) as typeof payload;
    } catch {
      res.status(400).json({ success: false, error: 'Your session has expired. Please register again.' });
      return;
    }

    if (payload.purpose !== 'verify') {
      res.status(400).json({ success: false, error: 'Invalid verification request' });
      return;
    }

    const user = await User.findById(payload.userId).select('+emailVerificationCode +emailVerificationExpires');
    if (!user) {
      res.status(400).json({ success: false, error: 'Account not found. Please register again.' });
      return;
    }

    if (user.isVerified) {
      // Already verified — just log them in.
      const token = issueLoginToken(user as unknown as { _id: string; username: string; email: string });
      res.json({ success: true, message: 'Email already verified', token, user: publicUser(user) });
      return;
    }

    const expired =
      !user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now();

    const codeOk = await verifyOtpCode(String(otp), user.emailVerificationCode);

    if (!codeOk || expired) {
      res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
      return;
    }

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Fire-and-forget: notify the new account (never blocks registration).
    sendNewUserEmail(user.email).catch((e) => console.error('Welcome email failed:', e));

    // Create the progress record now that registration is fully complete.
    const existingProgress = await UserProgress.findOne({ userId: user._id });
    if (!existingProgress) {
      const userProgress = new UserProgress({
        userId: user._id,
        currentLevel: 1,
        currentCourse: 1,
        currentLesson: 1,
        completedLessons: [],
        completedCourses: [],
        completedLevels: [],
        totalScore: 0,
      });
      await userProgress.save();
    }

    const token = issueLoginToken(user as unknown as { _id: string; username: string; email: string });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, error: 'Server error during verification' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Registration — Resend OTP
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register/resend-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pendingToken } = req.body;
    if (!pendingToken) {
      res.status(400).json({ success: false, error: 'Session expired. Please register again.' });
      return;
    }

    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(pendingToken, config.jwtSecret) as typeof payload;
    } catch {
      res.status(400).json({ success: false, error: 'Session expired. Please register again.' });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(400).json({ success: false, error: 'Account not found' });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ success: false, error: 'Email is already verified' });
      return;
    }

    const code = generateOtpCode();
    user.emailVerificationCode = await hashOtpCode(code);
    user.emailVerificationExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    // Send in the background — don't block the response on SMTP (see /register/initiate).
    const emailPromise = sendOtpEmail(user.email, code, 'verify');
    let emailResult: SendOtpResult | undefined;
    if (config.isEmailReal) {
      emailPromise.catch((e) => console.error('OTP email background send failed:', e));
    } else {
      emailResult = await emailPromise;
    }

    // Refresh the pending token so the new 10-min window starts now.
    const newPendingToken = issuePendingToken(user._id.toString(), 'verify');

    res.json({
      success: true,
      message: 'A new verification code has been sent.',
      pendingToken: newPendingToken,
      ...(emailResult?.devCode ? { devCode: emailResult.devCode, devMode: true } : {}),
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Backward-compatible alias for old clients / tests hitting /register/step2
//   Old contract: create user + UserProgress + return login token immediately.
//   This route still does that (marks user verified) so legacy callers keep working.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register/step2', async (req: Request, res: Response): Promise<void> => {
  try {
    const firstName = typeof req.body.firstName === 'string' ? req.body.firstName.trim() : '';
    const lastName = typeof req.body.lastName === 'string' ? req.body.lastName.trim() : '';
    const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password, confirmPassword } = req.body;

    if (!validateName(firstName)) {
      res.status(400).json({ success: false, error: 'Invalid first name' });
      return;
    }
    if (!validateName(lastName)) {
      res.status(400).json({ success: false, error: 'Invalid last name' });
      return;
    }
    if (!validateUsername(username)) {
      res.status(400).json({
        success: false,
        error: 'Username must be 3-30 characters, lowercase alphanumeric with underscores/hyphens',
      });
      return;
    }
    if (!validateEmail(email)) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address' });
      return;
    }
    if (!validatePassword(password)) {
      res.status(400).json({ success: false, error: PASSWORD_RULE_MESSAGE });
      return;
    }
    if (password !== confirmPassword) {
      res.status(400).json({ success: false, error: 'Passwords do not match' });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error:
          existingUser.username === username ? 'Username already exists' : 'Email already exists',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      isVerified: true,
      authProvider: 'local',
    });
    await user.save();

    // Fire-and-forget: notify the new account (legacy register/step2 path).
    sendNewUserEmail(user.email).catch((e) => console.error('Welcome email failed:', e));

    const userProgress = new UserProgress({
      userId: user._id,
      currentLevel: 1,
      currentCourse: 1,
      currentLesson: 1,
      completedLessons: [],
      completedCourses: [],
      completedLevels: [],
      totalScore: 0,
    });
    await userProgress.save();

    const token = issueLoginToken(user as unknown as { _id: string; username: string; email: string });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Registration step 2 error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Login
//   Accepts username OR email. Trims + lowercases input. Logs why it failed.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawIdentifier = typeof req.body.username === 'string' ? req.body.username : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const identifier = rawIdentifier.trim();
    const identifierLower = identifier.toLowerCase();

    if (!identifier || !password) {
      res.status(400).json({ success: false, error: 'Username and password are required' });
      return;
    }

    const query = isEmailish(identifierLower)
      ? { email: identifierLower }
      : { username: identifierLower };

    const user = await User.findOne(query).select('+passwordHash +isVerified');

    if (!user) {
      console.log(`[login] failed (user not found) for "${identifierLower}"`);
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    // Google-only accounts (no password) cannot log in via this form.
    if (!user.passwordHash) {
      console.log(`[login] failed (no password — OAuth account) for "${identifierLower}"`);
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`[login] failed (wrong password) for "${identifierLower}"`);
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    // Treat absence of the field as verified (legacy users created before this change).
    if (user.isVerified === false) {
      console.log(`[login] blocked (unverified) for "${identifierLower}"`);
      res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in.',
        needVerification: true,
        email: user.email,
      });
      return;
    }

    const token = issueLoginToken(user as unknown as { _id: string; username: string; email: string });

    // Refresh the daily streak on login (non-blocking — never fail login over this).
    touchStreak(user._id as unknown as import('mongoose').Types.ObjectId).catch((e) =>
      console.error('Streak touch failed on login:', e)
    );

    console.log(`[login] success for "${identifierLower}"`);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Change password (authenticated) — Profile → Change Password
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/change-password',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        res
          .status(400)
          .json({ success: false, error: 'Current password, new password, and confirmation are required' });
        return;
      }

      if (!validatePassword(newPassword)) {
        res.status(400).json({ success: false, error: PASSWORD_RULE_MESSAGE });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        res.status(400).json({ success: false, error: 'New passwords do not match' });
        return;
      }

      const user = await User.findById(userId).select('+passwordHash');
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // OAuth users without a password can't use this flow.
      if (!user.passwordHash) {
        res
          .status(400)
          .json({ success: false, error: 'Your account uses Google sign-in. No password is set.' });
        return;
      }

      const currentOk = await user.comparePassword(currentPassword);
      if (!currentOk) {
        res.status(401).json({ success: false, error: 'Current password is incorrect' });
        return;
      }

      const isSame = await user.comparePassword(newPassword);
      if (isSame) {
        res
          .status(400)
          .json({ success: false, error: 'New password must be different from your current password' });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, error: 'Server error while changing password' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Forgot password — Step 1: send OTP (always returns generic success)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!validateEmail(email)) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address' });
      return;
    }

    const user = await User.findOne({ email });

    // Generic response to avoid leaking which emails are registered.
    const genericSuccess = {
      success: true,
      message: 'If an account with that email exists, a verification code has been sent.',
    };

    if (!user || user.authProvider === 'google' || !user.passwordHash) {
      res.json(genericSuccess);
      return;
    }

    const code = generateOtpCode();
    user.passwordResetCode = await hashOtpCode(code);
    user.passwordResetExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    // Send in the background — don't block the response on SMTP (see /register/initiate).
    const emailPromise = sendOtpEmail(user.email, code, 'reset');
    let emailResult: SendOtpResult | undefined;
    if (config.isEmailReal) {
      emailPromise.catch((e) => console.error('OTP email background send failed:', e));
    } else {
      emailResult = await emailPromise;
    }

    res.json({
      ...genericSuccess,
      ...(emailResult?.devCode ? { devCode: emailResult.devCode, devMode: true } : {}),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Forgot password — Step 2: verify OTP, return a short-lived reset token
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify-reset-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const otp = req.body.otp;

    if (!validateEmail(email) || !otp) {
      res.status(400).json({ success: false, error: 'Email and verification code are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+passwordResetCode +passwordResetExpires');
    if (!user || !user.passwordResetCode || !user.passwordResetExpires) {
      res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
      return;
    }

    const expired = user.passwordResetExpires.getTime() < Date.now();
    const codeOk = await verifyOtpCode(String(otp), user.passwordResetCode);

    if (!codeOk || expired) {
      res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
      return;
    }

    // OTP is good — clear it and hand back a reset token valid for the same 10-min window.
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const resetToken = issuePendingToken(user._id.toString(), 'reset');

    res.json({
      success: true,
      message: 'Verification successful. You can now set a new password.',
      resetToken,
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Forgot password — Step 3: set new password using reset token
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword, confirmNewPassword } = req.body;

    if (!resetToken || !newPassword || !confirmNewPassword) {
      res
        .status(400)
        .json({ success: false, error: 'Reset token, new password, and confirmation are required' });
      return;
    }

    if (!validatePassword(newPassword)) {
      res.status(400).json({ success: false, error: PASSWORD_RULE_MESSAGE });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ success: false, error: 'Passwords do not match' });
      return;
    }

    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(resetToken, config.jwtSecret) as typeof payload;
    } catch {
      res.status(400).json({ success: false, error: 'Reset link has expired. Please try again.' });
      return;
    }

    if (payload.purpose !== 'reset') {
      res.status(400).json({ success: false, error: 'Invalid reset request' });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(400).json({ success: false, error: 'Account not found' });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logout successful' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Get current user (used after Google OAuth redirect to fetch full profile)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Google OAuth (mounted only if credentials are configured)
// ─────────────────────────────────────────────────────────────────────────────
if (config.isGoogleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
      },
      async (accessToken: string, refreshToken: string, profile, done) => {
        try {
          const emails = profile.emails || [];
          const email = emails[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error('No email returned from Google'), undefined);
          }

          // Find-or-create by googleId, also claim the email if it's free.
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (!user) {
            const baseUsername = (profile.displayName || email.split('@')[0] || 'user')
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '')
              .slice(0, 20);

            // ensure username uniqueness
            let username = baseUsername || 'user';
            let suffix = 0;
            while (await User.exists({ username })) {
              suffix += 1;
              username = `${baseUsername}${suffix}`.slice(0, 30);
            }

            user = new User({
              firstName: profile.name?.givenName || baseUsername,
              lastName: profile.name?.familyName || 'User',
              username,
              email,
              isVerified: true, // Google has already verified the email
              authProvider: 'google',
              googleId: profile.id,
            });
            await user.save();

            // Fire-and-forget: notify the new Google account.
            sendNewUserEmail(user.email).catch((e) => console.error('Welcome email failed:', e));

            const userProgress = new UserProgress({
              userId: user._id,
              currentLevel: 1,
              currentCourse: 1,
              currentLesson: 1,
              completedLessons: [],
              completedCourses: [],
              completedLevels: [],
              totalScore: 0,
            });
            await userProgress.save();
          } else if (!user.googleId) {
            // Local account with the same email — link it to Google.
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isVerified = true;
            await user.save();
          }

          return done(null, user as unknown as Express.User);
        } catch (err) {
          return done(err instanceof Error ? err : new Error(String(err)), undefined);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => {
    const u = user as unknown as { _id?: { toString(): string }; id?: string };
    done(null, u._id?.toString() || u.id);
  });
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        done(null, false);
        return;
      }
      done(null, {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
      });
    } catch (err) {
      done(err, null);
    }
  });

  router.use(passport.initialize());

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?oauth_error=1' }),
    (req: Request, res: Response) => {
      const user = req.user as unknown as {
        _id: string;
        username: string;
        email: string;
      };
      const token = issueLoginToken(user);
      // Hand the token to the SPA via query string.
      res.redirect(`${config.frontendUrl}/?token=${encodeURIComponent(token)}&provider=google`);
    }
  );
}

export { router as authRoutes };
export default router;
