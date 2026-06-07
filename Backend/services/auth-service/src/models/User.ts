import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '@skylink/shared';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: Role;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['Passenger', 'Staff', 'Administrator'], default: 'Passenger' },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save password hashing hook
UserSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (!user.isModified('password') || !user.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (err: any) {
    next(err);
  }
});

// Helper method to compare password
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', UserSchema);
