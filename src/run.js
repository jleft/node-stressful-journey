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

    var step = steps[stepIndex],
      handler = stepHandlers[step.type];

    ctx.step = step;
    ctx.stepIndex = stepIndex;

    runLog.info({step: stepIndex}, "Starting step");
    var start = process.hrtime();

    handler(step, ctx, function(error) {

      var delta = process.hrtime(start);
      ctx.deltas.push(delta);

      runLog.info({step: stepIndex, delta: delta[1] / 1000000}, "Finished step");

      next(error);
    });
  }

  runLog.info("Starting run");
  next();
};
