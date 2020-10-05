const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json();


const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
        )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    // implement me
    try {
      console.log('req.language', req.language);
      let head = await LanguageService.getLanguageHead(
        req.app.get('db'),
        req.language.head
        )
        head = head[0];
        head.id = head.id; // I added this line that I needed for another api call
        res.json(head)
        next()
    } catch(error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', jsonParser, async (req, res, next) => {
    // implement me
    const { guess } = req.body
    const guessObj = { guess }
    if (!guessObj[guess]) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }
    //call service to check answer

    // increment word
    // update to next word 
    // if at the end go to summary 
    
    return res.status(200).send('implement me!')
  })

module.exports = languageRouter
