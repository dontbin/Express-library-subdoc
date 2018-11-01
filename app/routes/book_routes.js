// require npm packages
const express = require('express')
const passport = require('passport')

// require book model/schema
const Book = require('../models/book')

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
router.get('/books', requireToken, (req, res) => {
  // retrieve all books from db
  Book.find()
    .then(books => {
      // turn response into objects
      return books.map(book => book.toObject())
    })
    // return a success message and the object Response
    .then(books => res.status(200).json({ books: books }))
    // handle error
    .catch(err => handle(err, res))
})

// define get for a specific item by id
router.get('/books/:id', requireToken, (req, res) => {
  // req.params.id digs through the request and finds the id
  Book.findById(req.params.id)
    // if the id doesn't exist, send back 404 error code
    .then(handle404)
    // return success message and the object response
    .then(book => res.status(200).json({ book: book.toObject() }))
    .catch(err => handle(err, res))
})

// define create route
router.post('/books', requireToken, (req, res) => {
  // set the owner attribute to be the user that is creating the object
  req.body.book.owner = req.user.id
  // grab the new object from the request and create a new Book with it
  Book.create(req.body.book)
    .then(book => {
      // return success message and the object response
      res.status(201).json({ book: book.toObject() })
    })
    // handle errors
    .catch(err => handle(err, res))
})

// define update route
router.patch('/books/:id', requireToken, (req, res) => {
  // delete the owner key to prevent the patch from overwriting that object's owner.
  delete req.body.book.owner
  const book = req.body.book
  const response = JSON.stringify({ book })
  // find object by id
  Book.findById(req.params.id)
    .then(handle404)
    .then(book => {
      // require ownership before the update can take place
      requireOwnership(req, book)
      // only patch the keys for which values were provided by the client
      Object.keys(req.body.book).forEach(key => {
        if (req.body.book[key] === '') {
          delete req.body.book[key]
        }
      })
      // update that book with the provided params minus owner and any empty values
      return book.update(req.body.book)
    })
    // return update success message
    .then(() => res.send(response))
    // handle errors
    .catch(err => handle(err, res))
})

// define delete route
router.delete('/books/:id', requireToken, (req, res) => {
  // find item by import {} from 'module'
  Book.findById(req.params.id)
    .then(handle404)
    .then(book => {
      // require ownership to destroy
      requireOwnership(req, book)
      book.remove()
    })
    // return delete success message
    .then(() => res.sendStatus(204))
    // handle errors
    .catch(err => handle(err, res))
})

// export the whole kit and kaboodle
module.exports = router
