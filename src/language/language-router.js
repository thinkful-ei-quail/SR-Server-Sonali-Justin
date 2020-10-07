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
      // let head = await LanguageService.getLanguageHead(
      //   req.app.get('db'),
      //   req.language.head
      //   )
      //   head = head[0];
      //   head.id = head.id; // I added this line that I needed for another api call
      //   res.json(head)

      const [word] = await LanguageService.getWordById(
        req.app.get('db'),
        req.language.head
      );
  
      res.json({
        nextWord: word.original,
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count,
        totalScore: req.language.total_score
      });
        next()
    } catch(error) {
      next(error)
    }
  })


languageRouter
  .post('/guess', jsonParser, async (req, res, next) => {
    // implement me
    const db = req.app.get('db');
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
      // pull out data from table and make LL
      const wordList = new LinkedList();
      
      let [headNode] = await LanguageService.getWordById(db, req.language.head);
      wordList.insertFirst(headNode);

      //populate the rest of the list
      while (headNode.next !== null) {
        const [nextNode] = await LanguageService.getWordById(db, headNode.next);
        wordList.insertLast(nextNode);
        headNode = nextNode;
      }

      //check user answer
      let isCorrect = false; 
      //happy path
      if(guess.toLowerCase() == wordList.head.value.translation.toLowerCase()) {
        isCorrect = true;
        ++wordList.head.value.correct_count;
        wordList.head.value.memory_value *= 2;
        ++req.language.total_score;
      } else {
        //unhappy path
        ++wordList.head.value.incorrect_count; 
        wordList.head.value.memory_value = 1;
      }

      //update word positions according to memory vals
      let previousHead = wordList.head;
      wordList.remove(wordList.head.value);
      wordList.insertAt(previousHead.value.memory_value, previousHead.value);

      let tempNode = wordList.head;
      let langHead = tempNode.value.id;
      // update tables :)
      while (tempNode !== null) {
        await LanguageService.updateWords(
          db,
          tempNode.value,
          tempNode.next !== null ? tempNode.next.value : null
        );
        tempNode = tempNode.next; 
      }

      // move head pointer
      await LanguageService.updateHead(
        db,
        req.language.id,
        req.language.user_id,
        langHead
      );

      //update table total score >:)
      await LanguageService.updateTotalScore(
        db,
        req.language.id,
        req.language.user_id,
        req.language.total_score
      );
      // send response 
      const response = {
        nextWord: wordList.head.value.original,
        wordCorrectCount: wordList.head.value.correct_count,
        wordIncorrectCount: wordList.head.value.incorrect_count,
        totalScore: req.language.total_score,
        answer: previousHead.value.translation,
        isCorrect: isCorrect
      };
      return res.status(200).json(response)

    } catch (error) {
      next(error);
    }
  });

module.exports = languageRouter
