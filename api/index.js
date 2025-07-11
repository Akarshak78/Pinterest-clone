const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');

// ✅ Create app
const app = express();

// ✅ Views, static, bodyParser, session, etc.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(flash());

// ✅ Passport config if any...

// ✅ Routes
app.use('/posts', require('../routes/posts'));


// ✅ Home route
app.get('/register', (req, res) => {
 res.render('register');
});

// ✅ Export serverless handler
module.exports = app;
module.exports.handler = serverless(app);
