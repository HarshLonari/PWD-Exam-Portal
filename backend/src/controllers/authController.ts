import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import nodemailer from 'nodemailer';

const sendAccountEmail = async (to: string, subject: string, text: string) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email delivery is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS.');
  }
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  await transporter.sendMail({ from: EMAIL_FROM || EMAIL_USER, to, subject, text });
};

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'] }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'] }
  );
  return { accessToken, refreshToken };
};

// POST /auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, password, role, adminCode } = req.body;
    const username = String(req.body.username || '').trim().toLowerCase();
    const email = String(req.body.email || '').trim().toLowerCase();

    // Validate required fields
    if (!name || !username || !email || !password) {
      res.status(400).json({ message: 'Name, username, email and password are required' });
      return;
    }

    // Determine role
    let userRole: 'admin' | 'employee' = 'employee';
    if (role === 'admin') {
      if (!process.env.ADMIN_SECRET_CODE || adminCode !== process.env.ADMIN_SECRET_CODE) {
        res.status(403).json({ message: 'Invalid admin code' });
        return;
      }
      userRole = 'admin';
    }

    // Check duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        res.status(409).json({ message: 'Email already registered' });
      } else {
        res.status(409).json({ message: 'Username already taken' });
      }
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phone,
      passwordHash,
      role: userRole,
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password, role } = req.body; // identifier = email or username

    if (!identifier || !password) {
      res.status(400).json({ message: 'Username/email and password are required' });
      return;
    }

    // Find by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (role && user.role !== role) {
      res.status(401).json({ message: `This account is not registered as an ${role}.` });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// POST /auth/refresh
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(401).json({ message: 'Refresh token missing' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// POST /auth/logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// POST /auth/forgot-username
export const forgotUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (user) {
      try {
        await sendAccountEmail(user.email, 'Your CEA Exam Portal username', `Hello ${user.name},\n\nYour username is: ${user.username}\n\nIf you did not request this, you can ignore this email.`);
      } catch (error) {
        console.error('Username recovery email could not be delivered:', error);
      }
    }

    res.json({
      message: 'If this email is registered, you will receive your username shortly.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173').replace(/\/$/, '');
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      try {
        await sendAccountEmail(user.email, 'Reset your CEA Exam Portal password', `Hello ${user.name},\n\nUse this link within 1 hour to set a new password:\n${resetLink}\n\nIf you did not request this, you can ignore this email.`);
      } catch (error) {
        console.error('Password recovery email could not be delivered:', error);
      }
    }

    res.json({
      message: 'If this email is registered, you will receive a password reset link shortly.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findOne({
      resetTokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenHash = undefined;
    user.resetTokenExpiry = undefined;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// GET /auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
