const express = require('express')
const WordService = require('./word-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json();


const wordRouter = express.Router()
const jsonBodyParser = express.json()



wordRouter
  .route('/:id/guess')
  .post(jsonBodyParser, (req, res, next) => {
    const wordId = req.params.id;
    const guess = req.body.guess;
    // TODO: Compare the guess to the word with appropriate id
    res.json({message: 'Correct'})

  
  })

  module.exports = wordRouter
