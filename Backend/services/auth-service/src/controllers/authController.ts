import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { 
  RegisterDto, 
  LoginDto, 
  UserProfileDto, 
  UpdateProfileDto, 
  ChangePasswordDto,
  AuthResponseDto,
  CreateStaffDto
} from '@skylink/shared';

const getJwtSecret = () => process.env.JWT_SECRET || 'super_secret_local_development_jwt_key_must_be_at_least_32_bytes_long';

export const register = async (req: Request, res: Response) => {
  const { username, email, password, fullName }: RegisterDto = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or Email is already registered.' });
    }

    const user = new User({ username, email, password, fullName, role: 'Passenger' });
    await user.save();

    const profile: UserProfileDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password }: LoginDto = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    const authResponse: AuthResponseDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token
    };

    return res.status(200).json(authResponse);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    const profile: UserProfileDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { fullName, email }: UpdateProfileDto = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ message: 'FullName and Email are required.' });
  }

  try {
    const existing = await User.findOne({ email, _id: { $ne: req.user.userId } });
    if (existing) {
      return res.status(400).json({ message: 'Failed to update profile. Email might already be taken.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const profile: UserProfileDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { currentPassword, newPassword }: ChangePasswordDto = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required.' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Failed to change password. Please verify your current password.' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const profiles: UserProfileDto[] = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      createdAt: u.createdAt
    }));

    return res.status(200).json(profiles);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  const { username, email, password, fullName }: CreateStaffDto = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'Username or Email is already registered.' });
    }

    const user = new User({ username, email, password, fullName, role: 'Staff' });
    await user.save();

    const profile: UserProfileDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    };

    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserCount = async (req: Request, res: Response) => {
  try {
    const count = await User.countDocuments();
    return res.status(200).json(count);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
