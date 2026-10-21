const User = require('../models/user');
const passport = require('../config/passportConfig');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase()
    });

    user.setPassword(password);
    await user.save();

    return res.status(201).json({ token: user.generateJWT() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'That email is already registered.' });
    }
    return res.status(500).json({ message: 'Unable to register user.' });
  }
};

const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    return res.status(200).json({ token: user.generateJWT() });
  })(req, res, next);
};

module.exports = { register, login };