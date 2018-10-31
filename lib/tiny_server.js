const express = require('express')

const app = express()

app.get('/', (req, res) => {
  console.log(req)
  res.send(`You're on the Express train! Choo Choo!`)
})

app.listen(4444, () => console.log('Example app listening on port 4444!'))
