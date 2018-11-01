// require npm packages
const express = require('express')
const passport = require('passport')

// require author model/schema
const Author = require('../models/author')

// require various error handling files
const handle = require('../../lib/error_handler')
const customErrors = require('../../lib/custom_errors')

// save certain errors to new variables
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// import the token authentication protocol
const requireToken = passport.authenticate('bearer', { session: false })

// create a new router
const router = express.Router()

// define GET request
// requireToken means the user only has access to things they own
router.get('/authors', requireToken, (req, res) => {
  // retrieve all authors from db
  Author.find()
    .then(authors => {
      // turn response into objects
      return authors.map(author => author.toObject())
    })
    // return a success message and the object Response
    .then(authors => res.status(200).json({ authors: authors }))
    // handle error
    .catch(err => handle(err, res))
})

// define get for a specific item by id
router.get('/authors/:id', requireToken, (req, res) => {
  // req.params.id digs through the request and finds the id
  Author.findById(req.params.id)
    // if the id doesn't exist, send back 404 error code
    .then(handle404)
    // return success message and the object response
    .then(author => res.status(200).json({ author: author.toObject() }))
    .catch(err => handle(err, res))
})

// define create route
router.post('/authors', requireToken, (req, res) => {
  // set the owner attribute to be the user that is creating the object
  req.body.author.owner = req.user.id
  // grab the new object from the request and create a new Author with it
  Author.create(req.body.author)
    .then(author => {
      // return success message and the object response
      res.status(201).json({ author: author.toObject() })
    })
    // handle errors
    .catch(err => handle(err, res))
})

// define update route
router.patch('/authors/:id', requireToken, (req, res) => {
  // delete the owner key to prevent the patch from overwriting that object's owner.
  delete req.body.author.owner
  // const author = req.body.author
  // const response = JSON.stringify({ author })
  // find object by id
  Author.findById(req.params.id)
    .then(handle404)
    .then(author => {
      // require ownership before the update can take place
      requireOwnership(req, author)
      // only patch the keys for which values were provided by the client
      Object.keys(req.body.author).forEach(key => {
        if (req.body.author[key] === '') {
          delete req.body.author[key]
        }
      })
      // update that author with the provided params minus owner and any empty values
      return author.update(req.body.author)
    })
    // return update success message
    .then(() => res.sendStatus(204))
    // handle errors
    .catch(err => handle(err, res))
})

// define delete route
router.delete('/authors/:id', requireToken, (req, res) => {
  // find item by import {} from 'module'
  Author.findById(req.params.id)
    .then(handle404)
    .then(author => {
      // require ownership to destroy
      requireOwnership(req, author)
      author.remove()
    })
    // return delete success message
    .then(() => res.sendStatus(204))
    // handle errors
    .catch(err => handle(err, res))
})

// export the whole kit and kaboodle
module.exports = router
