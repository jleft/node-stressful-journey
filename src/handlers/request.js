var concat = require('concat-stream'),
  http = require('http'),
  url = require('url'),
  value = require('../value');


module.exports = function(config, ctx, done) {

  var error = null;

  function abort(e) {
    if (error) {
      return;
    }
    request.abort();
    done(e);
  }

  function errorHandler(e) {
    done(new Error('Connection error:' + e));
  }

  function jsonHandler(json) {
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
        return done(e);
      }
    }
    done();
  }

  function responseHandler(response) {
    var statusCode = response.statusCode;
    if (statusCode !== 200) {
      return abort(new Error('Non-200 response:' + statusCode));
    }
    var contentType = response.headers['content-type'];
    if (contentType.indexOf('application/json') !== 0) {
      return abort(new Error('Non-JSON content-type:' + contentType));
    }
    response.pipe(concat(jsonHandler));
  }

  var options = value(config.options, ctx);

  if (typeof(options) === 'string') {
    options = url.parse(options);
  }

  // Disable connection pooling
  options.agent = false;

  var request = http.request(options)
    .on('response', responseHandler)
    .on('error', errorHandler);

  if (config.request) {
      try {
        config.request(ctx, request);
      }
      catch (e) {
        abort(e);
      }
  } else {
    request.end();
  }
};
