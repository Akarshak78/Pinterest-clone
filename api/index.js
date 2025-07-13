const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const authRouter = require('../routes/auth');
const postsRouter = require('../routes/posts');
const User = require('../Model/User');

const app = express();

// ✅ Cached MongoDB connection for Vercel serverless
let conn = null;
const connectDB = async () => {
  if (conn == null) {
    conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ New MongoDB connection created");
  } else {
    console.log("🔄 Using existing MongoDB connection");
  }
};
connectDB().catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Debug env vars
console.log("✅ ENV:", process.env.MONGO_URI ? "MONGO_URI set" : "❌ MONGO_URI missing");

// ✅ View engine
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// ✅ Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
}));

// ✅ Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// ✅ Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Routes
app.use('/', authRouter);
app.use('/posts', postsRouter);

// ✅ Test route
app.get('/api/health', (req, res) => {
  res.send('✅ Serverless function is working!');
});

// ✅ 404 fallback
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// ✅ Export handler for Vercel
module.exports = app;
module.exports.handler = serverless(app);
