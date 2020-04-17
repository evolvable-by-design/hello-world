class Talk {
  constructor(title, speaker, startTime, category) {
    this.title = title;
    this.speaker = speaker;
    this.startTime = startTime;
    this.category = category;
  }

  talkRepresentation() {
    return {
      title: this.title,
      speaker: this.speaker,
      startTime: this.startTime.toISOString(),
      category: this.category
    }
  }

};

const TaskCategoryEnum = [ 'API Design', 'API Maintenance', 'API Management' ]

const validateBusinessConstraints = (title, speaker, startTime, category) => {
  console.log('Title: ' + title)
  console.log('Speaker: ' + speaker)
  console.log('startTime: ' + startTime)
  console.log('category: ' + category)
  if (!title || (title.length < 10 || title.length > 40)) {
    return false
  } else if (speaker === undefined || speaker === null) {
    return false
  } else if (!startTime || new Date(startTime).toString() === 'Invalid Date') {
    return false
  } else if (!category || !TaskCategoryEnum.includes(category)) {
    return false
  } else {
    return true;
  }
};

module.exports = {
  Talk,
  validateBusinessConstraints
}