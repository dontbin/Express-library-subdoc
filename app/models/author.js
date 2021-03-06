const mongoose = require('mongoose')

// create a schema using the mongoose Schema constructor
const authorSchema = new mongoose.Schema({
  // each attribute of the model gets a key value pair
  // if that attribute necessitates any validation, the value becomes an object
  // with more key/values for each validation.
  name: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  },
  dob: {
    type: String,
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

authorSchema.virtual('name.full').get(function () {
  return this.name.firstName + ' ' + this.name.lastName
})

// export this schema as a mongoose model called 'Example'
module.exports = mongoose.model('Author', authorSchema)
