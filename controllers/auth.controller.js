import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'Roshan'; // Load once, not multiple times

// === SIGNUP ===
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json('Signup successful');
  } catch (error) {
    next(error);
  }
};

// === SIGNIN ===
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const isPasswordCorrect = bcryptjs.compareSync(password, validUser.password);
    if (!isPasswordCorrect) {
      return next(errorHandler(400, 'Invalid password'));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// === GOOGLE LOGIN ===
export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    const tokenPayload = (user) => ({
      id: user._id,
      isAdmin: user.isAdmin,
    });

    if (existingUser) {
      const token = jwt.sign(tokenPayload(existingUser), JWT_SECRET, { expiresIn: '7d' });
      const { password, ...rest } = existingUser._doc;
      return res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'None',
        })
        .json(rest);
    }

    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    const newUser = new User({
      username: name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 10000),
      email,
      password: hashedPassword,
      profilePicture: googlePhotoUrl,
    });

    await newUser.save();
    const token = jwt.sign(tokenPayload(newUser), JWT_SECRET, { expiresIn: '7d' });

    const { password, ...rest } = newUser._doc;
    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};
