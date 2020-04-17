const { Talk } = require('../models/Talk');
const Errors = require('../utils/errors');

class TalkService {

  constructor() {
    this.talks = [];
    this.attendees = [];

    this.createTalk({ title: 'First talk', speaker: 'Foo Bar', startTime: Date.now(), category: 'API Design' });
  }
 
  findByTitle(title) {
    return this.talks.find(talk => talk.title === title);
  }

  findByTitleOrFail(title) {
    const talk = this.findByTitle(title)
    if (talk) {
      return talk;
    } else {
      throw new Errors.NotFound();
    }
  }

  delete(talkTitle) {
    const talk = this.findByTitleOrFail(talkTitle);
    if (talk) {
      this.talks.splice(this.talks.indexOf(talk), 1);
    } else {
      throw new Errors.BusinessRuleEnforced();
    }
  }

  createTalk({ title, speaker, startTime }) {
    try {
      this.findByTitleOrFail(title);
      throw new Errors.BusinessRuleEnforced();
    } catch (error) {
      if (error instanceof Errors.NotFound) {
        const createdTalk = new Talk(title, speaker, new Date(startTime));
        this.talks.push(createdTalk);
        return createdTalk;
      } else {
        throw error
      }
    }
  }

  addAttendee(title, email) {
    this.findByTitleOrFail(title);
    this.attendees.push({title, email});
  }

}

module.exports = new TalkService();
