var concat = require('concat-stream'),
  http = require('http'),
  url = require('url'),
  value = require('../value');

module.exports = function(config, ctx, done) {

  var timings = {
      $last: process.hrtime()
    },
    error;

  function mark(label) {
    var delta = process.hrtime(timings.$last);
    var deltaMs = (delta[0] * 1e9 + delta[1]) / 1e6;
    timings[label] = deltaMs;
    timings.$last = process.hrtime();
  }

  function abort(e) {
    if (!error) {
      request.abort();
    }
    errorHandler(e);
  }

  function errorHandler(e) {
    if (error) {
      // drop subsequent errors
      return;
    }
    error = e;
    done(new Error('Connection error: ' + e.message));
  }

  function timeoutHandler() {
    abort(new Error('Connection timeout'));
  }

  function jsonHandler(json) {
    mark('receive-end');
    var response;
    try {
      mark('json-start');
      response = JSON.parse(json);
      mark('json-end');
    }
    catch (e) {
      return done(new Error('Invalid JSON response: ' + e.message));
    }
    if (config.response) {
      try {
        mark('response-start');
        config.response(ctx, response);
        mark('response-end');
      }
      catch (e) {
        return done(e);
      }
    }
    done(null, timings);
  }

  function responseHandler(response) {
    mark('receive-start');
    var statusCode = response.statusCode;
    if (statusCode !== 200) {
      return abort(new Error('Non-200 response:' + statusCode));
    }
    var contentType = response.headers['content-type'];
    if (!contentType || contentType.indexOf('application/json') !== 0) {
      return abort(new Error('Non-JSON content-type:' + contentType));
    }
    response.pipe(concat(jsonHandler));
  }

  mark('options-start');
  var options = value(config.options, ctx);
  mark('options-end');

  if (typeof(options) === 'string') {
    options = url.parse(options);
  }

  // Disable connection pooling
  options.agent = false;

  var timeout = value(config.timeout, ctx);
  if (timeout === undefined) {
    timeout = 60 * 1e3;
  }

  var request = http.request(options)
    .setTimeout(timeout)
    .on('response', responseHandler)
    .on('error', errorHandler)
    .on('timeout', timeoutHandler);

  if (config.request) {
      try {
        mark('request-start');
        config.request(ctx, request);
        mark('request-end');
      }
      catch (e) {
        return abort(e);
      }
  } else {
    request.end();
  }
};
