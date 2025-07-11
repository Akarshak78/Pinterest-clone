const express = require('express');
const multer = require('multer');
const Post = require('../Model/Post');
const User = require('../Model/User');

const router = express.Router();

// ✅ Multer config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


// ✅ GET: Upload page
router.get('/upload', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Please log in to upload.');
    return res.redirect('/login');
  }
  res.render('upload', {
    success: req.flash('success'),
    error: req.flash('error')
  });
});


// ✅ POST: Upload new post
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Please log in.');
    return res.redirect('/login');
  }

  try {
    const post = new Post({
      user: req.user._id, // ✅ Must match schema
      image: req.file.filename,
      caption: req.body.caption
    });

    await post.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id }
    });

    req.flash('success', 'Post uploaded!');
    res.redirect('/profile');

  } catch (err) {
    console.error('Upload error:', err);
    req.flash('error', 'Upload failed.');
    res.redirect('/posts/upload');
  }
});


// ✅ POST: Delete a post
router.post('/delete/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Please log in.');
    return res.redirect('/login');
  }

  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      req.flash('error', 'Post not found.');
      return res.redirect('/profile');
    }

    console.log('Found post:', post);

    // ✅ Must use 'user' field from schema
    if (!post.user.equals(req.user._id)) {
      req.flash('error', 'You are not authorized to delete this post.');
      return res.redirect('/profile');
    }

    await Post.findByIdAndDelete(postId);

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: postId }
    });

    req.flash('success', 'Post deleted.');
    res.redirect('/profile');

  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error', 'Delete failed.');
    res.redirect('/profile');
  }
});


module.exports = router;
