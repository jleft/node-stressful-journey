var concat = require('concat-stream')
  http = require('http'),
  url = require('url'),
  value = require('./value');


module.exports = function(config, ctx, done) {

  function json(json) {
    var response;
    try {
      response = JSON.parse(json);
    }
    catch (e) {
      return done(new Error('Invalid JSON response:' + e));
    }
    if (config.response) {
      try {
        config.response(ctx, response);
      }
      catch (e) {
        return done(new Error('Error in response:' + e));
      }
    }
    done();
  }

  function response(response) {
    var statusCode = response.statusCode;
    if (statusCode !== 200) {
      return done(new Error('Non-200 response:' + statusCode));
    }
    var contentType = response.headers['content-type'];
    if (contentType !== 'application/json') {
      return done(new Error('Non-JSON content-type:' + contentType));
    }
    response.pipe(concat(json));
  }

  function error(error) {
    done(new Error('Connection error:' + error));
  }

  var options = value(config.options, ctx);

  if (typeof(options) === 'string') {
    options = url.parse(options);
  }

  // Disable connection pooling
  options.agent = false;

  var request = http.request(options)
    .on('response', response)
    .on('error', error);

  if (config.request) {
      try {
        config.request(ctx, request);
      }
      catch (e) {
        return done(new Error('Error in request:' + e));
      }
  } else {
    request.end();
  }
};
