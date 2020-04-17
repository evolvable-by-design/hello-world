const { Talk } = require('./models/Talk');

module.exports = {

  forTalk: function(talk) {
    return '/talk/' + talk.name
  },

  resolve: function(value) {
    if (value instanceof Talk) {
      return this.forTalk(value);
    }
  }

};