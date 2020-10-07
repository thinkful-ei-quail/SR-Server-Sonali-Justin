const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json();
const LinkedList = require('./linkedList');

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
    const { guess } = req.body;
    const userGuess = guess
    let currentHead = req.language.head;
    let previousWord = currentHead
    if (!userGuess) {
      return res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }

    try {
      let translation = await LanguageService.getCorrectAnswer(
        req.app.get('db'),
        currentHead
      )

      const response = {};
      if(translation[0].translation !== userGuess) {
        // unhappy path
        // update incorrect count at head
        await LanguageService.increaseIncorrectCount(
          req.app.get('db'),
          currentHead
        )
        console.log('current', currentHead)
        //update head to point to current word's next value if current is == 1
        if (currentHead === 1) {
          await LanguageService.updateHead(
            req.app.get('db'),
            currentHead
          )
          let newWord = await LanguageService.getLanguageHead(
            req.app.get('db'),
            currentHead
            )
            console.log(newWord)
          // console.log(test)
        }
        else {

          // get new word incorrect count should not update for this word 
          let newWord = await LanguageService.getLanguageHead(
            req.app.get('db'),
            currentHead
            )

            await LanguageService.updateNextValue(
              req.app.get('db'),
              currentHead,
              previousWord
            )
            console.log(newWord)
            console.log('previous', previousWord)
          }
        // const {nextWord, totalScore, wordCorrectCount, wordIncorrectCount} = newWord[0];
        
        // let response = {
        //   nextWord: nextWord,
        //   totalScore: totalScore,
        //   wordCorrectCount: wordCorrectCount,
        //   wordIncorrectCount: wordIncorrectCount,
        //   answer: translation[0].translation,
        //   isCorrect: false
        // }
        // console.log(response)
        return res.status(200).json({})
      }
      
      if(translation[0].translation == userGuess) {
        // happy path
        await LanguageService.increaseTotalCount(
          req.app.get('db')
        )
        await LanguageService.increaseCorrectCount(
          req.app.get('db'),
          currentHead
        )

        await LanguageService.increaseMemoryValue(
          req.app.get('db'),
          currentHead
        )
        await LanguageService.updateHead(
          req.app.get('db'),
          currentHead
        )
        let newWord = await LanguageService.getLanguageHead(
          req.app.get('db'),
          currentHead
          )
          console.log(newWord)
        let response = {
        //   nextWord: testLanguagesWords[1].original,
        //   totalScore: 0,
        //   wordCorrectCount: 0,
        //   wordIncorrectCount: 0,
        answer: translation[0].translation,
        isCorrect: true
        }
        return res.status(200).json(response)
      }
      
      next()
    } catch(error) {
      next(error)
    }
    //call service to check answer
    // increment word
    // update to next word 
    // if at the end go to summary 

    let isCorrect = false; 





    return res.status(200).send('implement me!')
  })

module.exports = languageRouter
