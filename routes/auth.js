const express = require('express');
const passport = require('passport');
const User = require('../Model/User');
const Post = require('../Model/Post');

const router = express.Router();

// ✅ Register form
router.get('/', (req, res) => {
  res.redirect('/register');
});

router.get('/register', (req, res) => {
  res.render('register'); // no need to pass { success, error }
});

// ✅ Register handler
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;
    const user = new User({ username, email, fullName });
    await User.register(user, password);
    req.flash('success', 'Registered successfully! Please log in.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
});

// ✅ Login form
router.get('/login', (req, res) => {
  res.render('login'); // again, no need to pass flash manually
});

// ✅ Login handler
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/profile');
  }
);

// ✅ Logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error(err);
      req.flash('error', 'Logout error.');
      return res.redirect('/profile');
    }
    req.flash('success', 'Logged out.');
    res.redirect('/login');
  });
});

// ✅ Profile
router.get('/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Please log in.');
    return res.redirect('/login');
  }

  const user = await User.findById(req.user._id).populate('posts').exec();
  res.render('profile', {
    user,
    posts: user.posts
  });
});

router.get('/feed', async (req, res) => {
  const posts = await Post.find().populate('author');
  res.render('feed', { user: req.user, posts: posts });
});

module.exports = router;
