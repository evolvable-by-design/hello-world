const { Link } = require('./hypermedia');

module.exports = {
  delete: (talk) => Link('delete', { title: talk.title }),
  attend: (talk) => Link('attend', { title: talk.title })
}