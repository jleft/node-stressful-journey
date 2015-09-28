var value = require('./value'),
  log = require('./log');

var stepHandlers = {
  'custom': require('./handlers/custom'),
  'request': require('./handlers/request'),
  'wait': require('./handlers/wait')
};

module.exports = function(steps, index, done) {

  var ctx = {
      steps: steps,
      index: index,
      deltas: []
    },
    stepIndex = -1;

  var runLog = log.child({index: index});

  function next(error) {
    if (error) {
      runLog.info(error, "Error during run");
      return done(null, {
        error: new Error('Error in step ' + stepIndex + ':' + error),
        context: ctx
      });
    }

    if (++stepIndex >= steps.length) {
      runLog.info("Finished run");
      return done(null, {
        context: ctx
      });
    }

    var step = steps[stepIndex];

    ctx.step = step;
    ctx.stepIndex = stepIndex;

    if (step.disabled !== undefined) {
      try {
        if (value(step.disabled, ctx)) {
          runLog.info({step: stepIndex}, "Skipping disabled step");
          return next();
        }
      }
      catch (e) {
        return next(e);
      }
    }

    var handler = stepHandlers[step.type];
    if (!handler) {
      return next(new Error('Unknown handler:' + step.type));
    }

    runLog.info({step: stepIndex}, "Starting step");
    var start = process.hrtime();

    handler(step, ctx, function(error, result) {

      var delta = process.hrtime(start);
      ctx.deltas.push(delta);

      var deltaMs = (delta[0] * 1e9 + delta[1]) / 1e6;
      runLog.info({step: stepIndex, delta: deltaMs, result: result}, "Finished step");

      next(error);
    });
  }

  runLog.info("Starting run");
  next();
};
