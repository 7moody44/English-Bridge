import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpire: string;
  frontendUrl: string;
  // Email / OTP
  emailUser: string;
  emailAppPassword: string;
  emailFrom: string;
  isEmailReal: boolean; // true when a real SMTP password is configured
  // Google OAuth
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  isGoogleEnabled: boolean;
  // Google Gemini (free-tier AI for the speaking coach)
  geminiApiKey: string;
  isGeminiEnabled: boolean;
  // Groq (free-tier Whisper speech-to-text for the speaking coach)
  groqApiKey: string;
  isGroqEnabled: boolean;
}

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

export const config: Config = {
  port: parseInt(getEnvVar('PORT', '5000')),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  mongodbUri: getEnvVar('MONGODB_URI'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpire: getEnvVar('JWT_EXPIRE', '7d'),
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  // Email / OTP — app password stays optional for dev mode
  emailUser: process.env.EMAIL_USER || 'k4linx@gmail.com',
  emailAppPassword: process.env.EMAIL_APP_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'k4linx@gmail.com',
  isEmailReal: Boolean(process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_APP_PASSWORD.length > 0),
  // Google OAuth — optional until you add credentials
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  isGoogleEnabled: Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ),
  // Google Gemini — free tier (1,500 req/day), no card. Speaking coach works
  // without a key via a deterministic fallback, but grammar feedback is richer
  // when one is present. Get one at https://aistudio.google.com/apikey
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  isGeminiEnabled: Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0
  ),
  // Groq — free Whisper speech-to-text (~2,000 req/day, no card).
  // Get a key at https://console.groq.com/keys
  groqApiKey: process.env.GROQ_API_KEY || '',
  isGroqEnabled: Boolean(
    process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0
  ),
};

// Validate required configuration
const validateConfig = () => {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  if (config.nodeEnv === 'production' && config.jwtSecret.includes('development')) {
    throw new Error('JWT_SECRET must be changed for production');
  }
};

validateConfig();