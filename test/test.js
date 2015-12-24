/*!
 * githubbot-connect <https://github.com/doowb/githubbot-connect>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var assert = require('assert');
var request = require('supertest');
var body = require('body-parser');
var express = require('express');
var GithubBot = require('githubbot');
var middleware = require('../');

describe('githubbot-connect', function() {
  var bot = new GithubBot();
  bot.use(middleware());

  var app = express();
  app.use(body.json());

  app.post('/autosend', bot.middleware({send: true}));
  app.post('/wrapped', function(req, res, next) {
    var fn = bot.middleware();
    fn(req, res, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  });

  var agent = request.agent(app);

  describe('autosend results', function() {
    var handlers = {};
    beforeEach(function() {
      bot.events.forEach(function(event) {
        handlers[event] = function(payload, cb) {
          payload.handled.push('autosend ' + event + ' handled');
          cb(null, payload);
        };
        bot.on(event, handlers[event]);
      });
    });

    afterEach(function() {
      bot.events.forEach(function(event) {
        bot.off(event, handlers[event]);
      });
    });

    bot.events.forEach(function(event) {
      it('should handle a payload from the ' + event + ' event.', function(done) {
        agent.post('/autosend')
          .send({handled: []})
          .set('x-github-event', event)
          .set('Accept', 'application/json')
          .expect({
            handled: ['autosend ' + event + ' handled']
          }, done);
      });
    });
  });

  describe('wrapped results', function() {
    var handlers = {};
    beforeEach(function() {
      bot.events.forEach(function(event) {
        handlers[event] = function(payload, cb) {
          payload.handled.push('wrapped ' + event + ' handled');
          cb(null, payload);
        };
        bot.on(event, handlers[event]);
      });
    });

    afterEach(function() {
      bot.events.forEach(function(event) {
        bot.off(event, handlers[event]);
      });
    });

    bot.events.forEach(function(event) {
      it('should handle a payload from the ' + event + ' event.', function(done) {
        agent.post('/wrapped')
          .send({handled: []})
          .set('x-github-event', event)
          .set('Accept', 'application/json')
          .expect({
            handled: ['wrapped ' + event + ' handled']
          }, done);
      });
    });
  });
});
