const { raw } = require("express")
const wordRouter = require("../words/word-router")

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },
  getLanguageHead(db, head) {
    return db
      .from('word')
      .select(
        'word.original as nextWord',
        'language.total_score as totalScore',
        'word.correct_count as wordCorrectCount',
        'word.incorrect_count as wordIncorrectCount'
      )
      .join('language', 'language.head', 'word.id')
      .where('language.head', head)
  },
  getCorrectAnswer(db, currentHead) {
    return db
      .from('word')
      .select('word.translation')
      .join('language', currentHead, 'word.id')
  },
  updateHead(db, head) {
    return db
      .from('language')
      .join('word', 'word.id', head)
      .select('word.next')
      .first()
      .then(res => {
        return db
        .from('language')
        .update('head', res.next)
        .returning(['head'])
      })
      
  },
  increaseIncorrectCount(db, head) {
    return db
    .from('word')
  },
  increaseCorrectCount(db, head) {
    return db
    .from('word')
    .where('id', '=', head)
    .increment('correct_count', 1)
  },
  increaseMemoryValue(db, head) {
    return db
    .from('word')
    .select('word.memory_value')
    .where('id', '=', head)
    .first()
    .then(res => {
      let newMemoryValue = res['memory_value'] * 2
      return db
      .from('word')
      .where('id', head)
      .update('memory_value', newMemoryValue)
    })
  },
  increaseTotalCount(db) {
    return db
      .from('language')
      .where('id', '=', 1)
      .increment('total_score', 1)
  },
  updateNextValue(db, head, previousWord) {
    return db 
    .from('word')
    .where('word.id', head)
    .update('next', previousWord)
  }
}

module.exports = LanguageService
