import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/Users';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendEmail } from '../helper/sendEmail';
import { resetPasswordTemplate } from '../emailTemplates';

const FRONTEND_URL = process.env.FRONTEND_URL ||  'http://localhost:5173';

/* REGISTER */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: 'superadmin' | 'cashier';
    };

    if (!name || !email || !password) {
      return res.sendMessage(400, 'All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.sendMessage(400, 'User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'superadmin',
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    return res.sendMessage(201, 'User registered successfully', {
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.sendMessage(500, 'Registration error');
  }
};

/* LOGIN */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.sendMessage(400, 'User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.sendMessage(400, 'Wrong password');

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    return res.sendMessage(200, 'Login Successful', {
      token,
      role: user.role,
      user,
    });
  } catch (error) {
    return res.sendMessage(500, 'Login error');
  }
};

/* CREATE MULTIPLE CASHIERS - SUPERADMIN ONLY */
export const createMultipleCashiers = async (req: AuthRequest, res: Response) => {
  try {
    const { cashiers } = req.body as {
      cashiers: { name: string; email: string; password: string }[];
    };

    if (!cashiers || cashiers.length === 0) {
      return res.sendMessage(400, 'No cashiers provided');
    }

    const usersToInsert: IUser[] = [];
    const failedEmails: string[] = [];

    for (const cashier of cashiers) {
      const existing = await User.findOne({ email: cashier.email });
      if (existing) {
        failedEmails.push(cashier.email);
        continue;
      }

      const hashedPassword = await bcrypt.hash(cashier.password, 10);
      usersToInsert.push(new User({ ...cashier, password: hashedPassword, role: 'cashier' }));
    }

    await User.insertMany(usersToInsert);

    return res.sendMessage(201, `${usersToInsert.length} cashiers created successfully`, {
      failedEmails,
    });
  } catch (error) {
    return res.sendMessage(500, 'Error creating cashiers');
  }
};

/* CHANGE PASSWORD (LOGGED-IN USER) */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };

    if (!oldPassword || !newPassword) {
      return res.sendMessage(400, 'Old & new password required');
    }

    if (!req.user?.id) return res.sendMessage(401, 'Unauthorized');

    const user = await User.findById(req.user.id);
    if (!user) return res.sendMessage(404, 'User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.sendMessage(400, 'Old password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.sendMessage(200, 'Password updated successfully');
  } catch (error) {
    return res.sendMessage(500, 'Error changing password');
  }
};

/* FORGOT PASSWORD */
export const forgotPassword = async (req: Request, res: Response) => {
  // console.log('req.body', req.body.email);
  try {
    const { email } = req.body as { email: string };

    if (!email) return res.sendMessage(400, 'Email is required');

    const user = await User.findOne({ email });
    if (!user) return res.sendMessage(405, 'User not found');

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '40m' });

    const resetLink = `${FRONTEND_URL}/auth/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: resetPasswordTemplate({ name: user.name, resetLink }),
    });

    return res.sendMessage(200, 'Password reset link sent to email');
  } catch (error) {
    console.error(error);
    return res.sendMessage(500, 'Forgot password error');
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body as { newPassword: string };

    if (!newPassword) return res.sendMessage(400, 'New password required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await User.findById(decoded.id);
    // console.log('user', user);
    if (!user) return res.sendMessage(404, 'User not found');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.sendMessage(200, 'Password reset successfully');
  } catch (error) {
    return res.sendMessage(400, 'Invalid or expired token');
  }
};

export const checkRole = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };

    if (!email) return res.sendMessage(400, 'Email is requireds');

    const user = await User.findOne({ email });
    if (!user) return res.sendMessage(404, 'User not found');

    return res.sendMessage(200, 'Role fetched successfully', { role: user.role });
  } catch (error) {
    8;
    console.error(error);
    return res.sendMessage(500, 'Error checking role');
  }
};

export const getAllCashiers = async (_req: AuthRequest, res: Response) => {
  try {
    const cashiers = await User.find({ role: 'cashier' }).select('-password');
    return res.sendMessage(200, 'Cashiers fetched', cashiers);
  } catch {
    return res.sendMessage(500, 'Error fetching cashiers');
  }
};

export const getCashierById = async (req: Request, res: Response) => {
  console.log('req.params.id', req.params.id);
  try {
       const cashier = await User.findById(req.params.id); // include password
    if (!cashier) return res.status(404).json({ success: false, message: 'Cashier not found' });
    return res.status(200).json({
      success: true,
      message: 'Cashier updated',
      data: cashier, 
    });
  } catch {
    return res.sendMessage(500, 'Error fetching cashier');
  }
};
export const updateCashier = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const updateData: any = { name, email };
    
    if (password) {
      // hash the new password before saving
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ success: false, message: 'Cashier not found' });

    return res.status(200).json({
      success: true,
      message: 'Cashier updated',
      data: updated, // includes hashed password
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error updating cashier' });
  }
};

export const deleteCashier = async (req: Request, res: Response) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.sendMessage(404, 'Cashier not found');

    return res.sendMessage(200, 'Cashier deleted');
  } catch {
    return res.sendMessage(500, 'Error deleting cashier');
  }
};
