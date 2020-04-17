var express = require('express');

var router = express.Router();

const talkService = require('./services/talk-service')

router.use(require('./controllers/documentation'))
router.use(require('./controllers/talk-controller')(talkService))

module.exports = router;
