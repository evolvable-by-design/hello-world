const { Talk } = require('../models/Talk');
const Errors = require('../utils/errors');

class TalkService {

  constructor() {
    this.talks = [];

    this.createTalk({ name: 'First talk', speaker: 'Foo Bar', startTime: Date.now() });
  }
 
  findByName(name) {
    return this.talks.find(talk => talk.name === name);
  }

  findByNameOrFail(name) {
    const talk = this.findByName(name)
    if (talk) {
      return talk;
    } else {
      throw new Errors.NotFound();
    }
  }

  delete(taskName) {
    const talk = this.findByNameOrFail(taskName);
    if (talk) {
      this.talks.splice(this.talks.indexOf(talk), 1);
    } else {
      throw new Errors.BusinessRuleEnforced();
    }
  }

  createTalk({ name, speaker, startTime }) {
    try {
      this.findByNameOrFail(name)
      throw new Errors.BusinessRuleEnforced();
    } catch (error) {
      if (error instanceof Errors.NotFound) {
        const createdTalk = new Talk(name, speaker, new Date(startTime));
        this.talks.push(createdTalk);
        return createdTalk;
      } else {
        throw error
      }
    }
    
  }

}

module.exports = new TalkService();
