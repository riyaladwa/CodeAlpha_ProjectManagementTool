import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { env } from '../config/env.js';
import { demoDataService } from '../services/demoDataService.js';

// Helper to generate JWT token and cookie
const sendAuthResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      title: user.title,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, title } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      title: title || 'Product Lead',
    });

    // Automatically seed an initial workspace for seamless instant onboarding
    try {
      await demoDataService.seedDemoWorkspace(user);
    } catch (seedErr) {
      console.warn('[Register] Non-fatal seed error:', seedErr.message);
      // Create minimal empty workspace if seed fails
      await Workspace.create({
        name: `${user.name}'s Workspace`,
        ownerId: user._id,
        members: [{ user: user._id, role: 'owner' }],
      });
    }

    return sendAuthResponse(user, 201, res, 'Registration successful! Welcome to TaskFlow AI.');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user with password selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    return sendAuthResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, title, avatar, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (title !== undefined) user.title = title;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'The current password you entered is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Preferences updated.',
      preferences: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete workspaces owned by user
    await Workspace.deleteMany({ ownerId: userId });
    // Remove user from memberships
    await Workspace.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );
    // Delete user
    await User.findByIdAndDelete(userId);

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Account and associated data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const exploreDemo = async (req, res, next) => {
  try {
    const demoEmail = 'demo.lead@taskflow.dev';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Jordan Hayes (Demo)',
        email: demoEmail,
        password: 'DemoUserPassword2026!',
        title: 'Lead Product Manager',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      });
    }

    // Check if demo user has workspace, if not seed it
    const existingWs = await Workspace.findOne({ ownerId: demoUser._id });
    if (!existingWs) {
      await demoDataService.seedDemoWorkspace(demoUser);
    }

    return sendAuthResponse(demoUser, 200, res, 'Welcome to TaskFlow AI Demo Mode!');
  } catch (error) {
    next(error);
  }
};
