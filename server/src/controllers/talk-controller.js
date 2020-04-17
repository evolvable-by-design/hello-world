const express = require('express');

const { validateBusinessConstraints } = require('../models/Talk');
const { HypermediaRepresentationBuilder } = require('../hypermedia/hypermedia');
const HypermediaControls = require('../hypermedia/talk');
const utils = require('./utils');
const Errors = require('../utils/errors');
const Responses = require('../utils/responses');

function talkWithHypermediaControls(talk, userRole) {
  return HypermediaRepresentationBuilder
    .of(talk)
    .representation(t => t.talkRepresentation())
    //.link(HypermediaControls.delete(talk))
    .link(HypermediaControls.delete(talk), userRole ? userRole === Roles.ADMIN : false)
    .link(HypermediaControls.attend(talk))
    .build();
}

const Roles = {
  ADMIN: 'admin',
  USER: 'user'
}

const talkController = function(talkService) {
  const router = express.Router();

  router.get('/talks', (req, res) => res.status(200).json({ talks: talkService.talks }))

  router.post('/talks', (req, res) =>
    Errors.handleErrorsGlobally(() => {
      const userRole = req.query.role
      const { title, speaker, startTime, category } = req.body;
      console.log(utils.isAnyEmpty([title, speaker, startTime, category]))
      if (utils.isAnyEmpty([title, speaker, startTime, category])
        || !validateBusinessConstraints(title, speaker, startTime, category)
      ) {
        Responses.badRequest(res);
      } else {
        const createdTalk = talkService.createTalk(req.body);
        Responses.created(res, talkWithHypermediaControls(createdTalk, userRole))
        // Responses.created(res, talkWithHypermediaControls(createdTalk));
      }
    }, res)
  )

  router.delete('/talks/:title', (req, res) =>
    Errors.handleErrorsGlobally(() => {
      const title = req.params.title;

      try {
        talkService.delete(title)
        Responses.noContent(res)
      } catch (error) {
        if (error instanceof Errors.NotFound) {
          Responses.notFound(res)
        } else {
          res.sendStatus(500)
        }
      }
    }, res))

  router.post('/talks/:title/attend', (req, res) => 
    Errors.handleErrorsGlobally(() => {
      const title = req.params.title;
      const { email } = req.body;
      if (utils.isAnyEmpty([email])) {
        Responses.badRequest(res);
      } else {
        talkService.addAttendee(title, email);
        Responses.noContent(res);
      }
    }, res)
  )

  return router

}

module.exports = talkController;
