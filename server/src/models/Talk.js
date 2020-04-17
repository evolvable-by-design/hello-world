class Talk {
  constructor(name, speaker, startTime) {
    this.name = name;
    this.speaker = speaker;
    this.startTime = startTime;
  }

  talkRepresentation() {
    return {
      name: this.name,
      speaker: this.speaker,
      startTime: this.startTime.toISOString()
    }
  }

};

const validateBusinessConstraints = (name, speaker, startTime) => {
  if (!name || (name.length < 10 || name.length > 80)) {
    return false
  } else if (speaker === undefined || speaker === null) {
    return false
  } else if (!startTime || new Date(startTime).toString() === 'Invalid Date') {
    return false
  } else {
    return true;
  }
};

module.exports = {
  Talk,
  validateBusinessConstraints
}