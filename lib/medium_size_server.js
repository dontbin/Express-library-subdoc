const express = require('express')
const bodyParser = require('body-parser')

// for this example, we'll use an in-memory array in place of a database
const books = [
  { title: 'Dictionary', author: 'Webster' },
  { title: 'Encyclopedia', author: 'Encarta' },
  { title: 'Clean Code', author: 'Robert Cecil Martin' }
]

// your code goes here!

// create new Express app object
const app = express()

// ensure that our app can parse JSON request bodies
app.use(bodyParser.json())

// an exmaple middleware, this just logs requests and then passes execution
// off to the next tour or middleware
app.use((req, res, next) => {
  console.log(`Got a ${req.method} request to ${req.originalUrl}`)
  next()
})

// GET /books returns all books
app.get('/books', (req, res) => {
  const response = JSON.stringify({books: books})
  console.log('Response is ', response)
  res.status(200).send(response)
})

// GET books/:id returns one book
app.get('/books/:id', (req, res) => {
  const response = JSON.stringify({ books: books[req.params.id] })
  console.log('Response is ', response)
  res.status(200).send(response)
})

// POST /books creates a new book
app.post('/books', (req, res) => {
  // extract the new book from the request body
  const book = req.body.book
  // push the new book to our books array
  books.push(book)
  // parse the JSON
  const response = JSON.stringify({ book })
  // log the response in book form
  console.log('Response is ', response)
  // send the data to the client
  res.status(201).send(response)
})

app.listen('4741', () => console.log('Books app is listening on localhost port 4741...'))
