import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type AuthProvider = 'local' | 'google';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  emailVerificationCode?: string | undefined;
  emailVerificationExpires?: Date | undefined;
  passwordResetCode?: string | undefined;
  passwordResetExpires?: Date | undefined;
  googleId?: string | undefined;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
      maxlength: [50, 'First name must not exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
      maxlength: [50, 'Last name must not exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username must not exceed 30 characters'],
      match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      // Not required because Google OAuth users have no password
      minlength: [60, 'Invalid password hash'],
      select: false, // Don't include password hash by default in queries
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many docs with null googleId
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Create compound indexes for better query performance
userSchema.index({ createdAt: -1 });

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch {
    throw new Error('Error comparing passwords');
  }
};

// Virtual field for full name
userSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });

// Create and export model
const User = mongoose.model<IUser>('User', userSchema);

export default User;
