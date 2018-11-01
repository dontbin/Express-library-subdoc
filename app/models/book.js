const mongoose = require('mongoose')

// create a schema using the mongoose Schema constructor
const bookSchema = new mongoose.Schema({
  // each attribute of the model gets a key value pair
  // if that attribute necessitates any validation, the value becomes an object
  // with more key/values for each validation.
  title: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  owner: {
    // this is a special type specifically for reference IDs
    type: mongoose.Schema.Types.ObjectId,
    // tells the ID to search in users to find the correct owner object
    ref: 'User',
    // all examples must have an owner
    required: true
  }
},
  // a time stamp will automatically be created when a new example is posted.
{
  timestamps: true
})

// export this schema as a mongoose model called 'Example'
module.exports = mongoose.model('Book', bookSchema)
