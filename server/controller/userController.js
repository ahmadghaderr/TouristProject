const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET;

const isProduction = process.env.NODE_ENV === 'production';
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};
const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ msg: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    const verifyLink = `${process.env.API_BASE_URL}/api/user/verify/${verificationToken}`;
    try {
      await sendVerificationEmail(email, name, verifyLink);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
    }

    res.status(201).json({ msg: 'Account created. Check your email to verify before logging in.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.status(400).send('<h2>Invalid or already-used verification link.</h2>');
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return res.status(400).send('<h2>This verification link has expired. Please contact the admin.</h2>');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.send('<h2>Email verified. You can close this tab and log in.</h2>');
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).send('<h2>Server error verifying email.</h2>');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in. Check your inbox.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.cookie('token', token, { ...authCookieOptions, maxAge: AUTH_COOKIE_MAX_AGE });
    // TEMP-AUTH-DEBUG: remove once cookie auth is confirmed working in production
    console.log(`[TEMP-AUTH-DEBUG] login cookie set for user ${user.id}:`, {
      sameSite: authCookieOptions.sameSite,
      secure: authCookieOptions.secure,
      httpOnly: authCookieOptions.httpOnly,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', authCookieOptions);
  res.status(200).json({ msg: 'Logged out' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user._id);
    if (!user) {
      res.clearCookie('token', authCookieOptions);
      return res.status(401).json({ msg: 'User no longer exists' });
    }
    res.json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getUserByID = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && String(req.user._id) !== String(req.params.id)) {
      return res.status(403).json({ msg: "Not authorized to view this user" });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ msg: "User Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.editUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    if (req.user.role !== 'admin' && String(req.user._id) !== String(id)) {
      return res.status(403).json({ msg: "Not authorized to edit this user" });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "User Not found" });

    user.name = name;
    user.email = email;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error('Edit user error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== 'admin' && String(req.user._id) !== String(id)) {
      return res.status(403).json({ msg: "Not authorized to delete this user" });
    }
    await User.destroy({ where: { id } });
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ msg: "Server error" });
  }
};