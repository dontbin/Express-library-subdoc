// require npm packages
const express = require('express')
const passport = require('passport')

// require example model/schema
const Example = require('../models/example')

// require various error handling files
const handle = require('../../lib/error_handler')
const customErrors = require('../../lib/custom_errors')

// save certain errors to new variables
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

// import the token authentication protocol
const requireToken = passport.authenticate('bearer', { session: false })

// create a new router
const router = express.Router()

// define GET request
// requireToken means the user only has access to things they own
router.get('/examples', requireToken, (req, res) => {
  // retrieve all examples from db
  Example.find()
    .then(examples => {
      // turn response into objects
      return examples.map(example => example.toObject())
    })
    // return a success message and the object Response
    .then(examples => res.status(200).json({ examples: examples }))
    // handle error
    .catch(err => handle(err, res))
})

// define get for a specific item by id
router.get('/examples/:id', requireToken, (req, res) => {
  // req.params.id digs through the request and finds the id
  Example.findById(req.params.id)
    // if the id doesn't exist, send back 404 error code
    .then(handle404)
    // return success message and the object response
    .then(example => res.status(200).json({ example: example.toObject() }))
    .catch(err => handle(err, res))
})

// define create route
router.post('/examples', requireToken, (req, res) => {
  // set the owner attribute to be the user that is creating the object
  req.body.example.owner = req.user.id
  // grab the new object from the request and create a new Example with it
  Example.create(req.body.example)
    .then(example => {
      // return success message and the object response
      res.status(201).json({ example: example.toObject() })
    })
    // handle errors
    .catch(err => handle(err, res))
})

// define update route
router.patch('/examples/:id', requireToken, (req, res) => {
  // delete the owner key to prevent the patch from overwriting that object's owner.
  delete req.body.example.owner
  // find object by id
  Example.findById(req.params.id)
    .then(handle404)
    .then(example => {
      // require ownership before the update can take place
      requireOwnership(req, example)
      // only patch the keys for which values were provided by the client
      Object.keys(req.body.example).forEach(key => {
        if (req.body.example[key] === '') {
          delete req.body.example[key]
        }
      })

      return example.update(req.body.example)
    })
    // return update success message
    .then(() => res.sendStatus(204))
    // handle errors
    .catch(err => handle(err, res))
})

// define delete route
router.delete('/examples/:id', requireToken, (req, res) => {
  // find item by import {} from 'module'
  Example.findById(req.params.id)
    .then(handle404)
    .then(example => {
      // require ownership to destroy
      requireOwnership(req, example)
      example.remove()
    })
    // return delete success message
    .then(() => res.sendStatus(204))
    // handle errors
    .catch(err => handle(err, res))
})

// export the whole kit and kaboodle
module.exports = router
