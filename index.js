/*!
 * githubbot-connect <https://github.com/doowb/githubbot-connect>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * githubbot plugin that adds a `.middleware` method to githubbot bots that enables creating
 * connect/express middleware functions to handle github webhook event payloads.
 *
 * ```js
 * bot.use(githubbotConnect(options));
 * ```
 *
 * @param  {Object} `options` Options to configure the plugin.
 * @return {Function} plugin function to pass to `.use`
 * @api public
 * @name githubbot-connect
 */

module.exports = function (options) {
  return function plugin(bot) {

    /**
     * Create a middleware function suited to pass to a connect/express route.
     * Middleware function will inspect the request headers to determine which
     * github webhook event should be handled.
     *
     * ```js
     * app.post('/webhooks', bot.middleware(options));
     * ```
     *
     * @param  {Object} `opts` Options to configure how events should be handled.
     * @param  {Boolean} `opts.send` When `true`, the results of handling the payload will automatically be sent using `res.json()`. Defaults to `false`.
     * @return {Function} Middleware function for use in connect/express routes.
     * @api public
     * @name middleware
     */

    bot.define('middleware', function (opts) {
      opts = opts || {};
      return function(req, res, next) {
        var event = req.headers['x-github-event'];
        if (!event || bot.events.indexOf(event) === -1) {
          return next();
        }

        // TODO: payload parsing options
        var payload = req.body;
        bot.handle(event, payload, function(err, results) {
          if (err) return next(err);
          if (opts.send === true) {
            return res.json(results);
          }
          next(null, results);
        });
      };
    });
  };
};
