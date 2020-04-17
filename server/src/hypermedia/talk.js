const { Link } = require('./hypermedia');

module.exports = {
  delete: (talk) => Link('delete', { name: talk.name }),
}