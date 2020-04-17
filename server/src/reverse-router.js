const { Talk } = require('./models/Talk');

module.exports = {

  forTalk: function(talk) {
    return '/talk/' + talk.title
  },

  resolve: function(value) {
    if (value instanceof Talk) {
      return this.forTalk(value);
    }
  }

};