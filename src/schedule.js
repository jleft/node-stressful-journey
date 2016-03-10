var times = require('async').times,
  run = require('./run'),
  log = require('./log');

module.exports = function(options, done, logSerializers) {

  var steps = options.steps || [],
    count = options.count || 1,
    delay = options.delay || 0,
    randomisation = options.randomisation || 0;

  if (arguments.length > 2) {
    log.addSerializers(logSerializers);
  }

  function next(error, results) {
    if (error) {
      throw new Error('Should not be possible.');
    }
    var errors = results.filter(function(r) { return r.error; });
    done(null, errors.length);
  }

  function scheduleRun(index, next) {
    var duration = (1 - Math.random() * randomisation) * delay;
    setTimeout(function() {
      run(steps, index, next, log);
    }, duration);
  }

  times(count, scheduleRun, next);
};
