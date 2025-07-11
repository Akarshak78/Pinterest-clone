const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
   posts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post' 
  }]
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

module.exports = mongoose.model('User', UserSchema);
