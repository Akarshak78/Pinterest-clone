const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  image: String,
  caption: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: { // ✅ make sure this is 'user'
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Post', postSchema);
