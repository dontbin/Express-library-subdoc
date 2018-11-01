const mongoose = require('mongoose')

// cre
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  token: String
}, {
  timestamps: true,
  // when this method is applied to the resource, it will do the contained code
  toObject: {
    // remove `hashedPassword` field when we call `.toObject`
    // .toObject is called when the resource is sent to client in a response
    transform: (_doc, user) => {
      delete user.hashedPassword
      return user
    }
  }
})

module.exports = mongoose.model('User', userSchema)
