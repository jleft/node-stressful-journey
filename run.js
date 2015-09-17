var value = require('./value'),
  bunyan = require('bunyan');

var stepHandlers = {
  'request': require('./request'),
  'wait': require('./wait')
};

var rootLog = bunyan.createLogger({name: 'run'});

module.exports = function(steps, index, done) {

  var ctx = {
      index: index
    },
    stepIndex = -1;

  var log = rootLog.child({index: index});

  function next(error) {
    if (error) {
      log.info(error, "Error during run");
      return done(new Error('Error in step ' + stepIndex + ':' + error));
    }

    if (++stepIndex >= steps.length) {
      log.info("Finished run");
      return done();
    }

    var step = steps[stepIndex],
      handler = stepHandlers[step.type];

    ctx.step = step;
    ctx.stepIndex = stepIndex;

    log.info({step: stepIndex}, "Starting step");
    var start = process.hrtime();

    handler(step, ctx, function(error) {

      var delta = process.hrtime(start);
      log.info({step: stepIndex, delta: delta[1]}, "Finished step");

      next(error);
    });
  }

  log.info("Starting run");
  next();
};


