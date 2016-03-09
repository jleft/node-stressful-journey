var value = require('./value'),
  log = require('./log'),
  extend = require('extend'),
  generateUuid = require('node-uuid').v4;

var stepHandlers = {
  'custom': require('./handlers/custom'),
  'request': require('./handlers/request'),
  'wait': require('./handlers/wait')
};

module.exports = function(steps, index, done) {

  var uuid = generateUuid(),
    ctx = {
      uuid: uuid,
      index: index,
      deltas: []
    },
    stepIndex = -1,
    handler,
    step;

  var runLog = log.child({uuid: uuid, index: index});

  function getStepLogContext() {
    var logContext = extend(true, {}, ctx);
    delete logContext.deltas;
    delete logContext.stepIndex;
    delete logContext.index;
    delete logContext.uuid;

    if (handler && handler.logContext && (handler.logContext instanceof Function)) {
      handler.logContext(step, ctx, logContext);
    }

    if (step && step.logContext && (step.logContext instanceof Function)) {
      step.logContext(step, ctx, logContext);
    }

    return logContext;
  }

  function next(error) {
    if (error) {
      runLog.info({ err: error, context: getStepLogContext() }, "Error in step " + stepIndex);
      return done(null, {
        error: new Error("Error in step " + stepIndex + ':' + error),
        context: ctx
      });
    }

    if (++stepIndex >= steps.length) {
      runLog.info("Finished run");
      return done(null, {
        context: ctx
      });
    }

    step = steps[stepIndex];

    ctx.step = step;
    ctx.stepIndex = stepIndex;

    if (step.disabled !== undefined) {
      try {
        if (value(step.disabled, ctx)) {
          runLog.info({step: stepIndex, context: getStepLogContext()}, "Skipping disabled step");
          return next();
        }
      }
      catch (e) {
        return next(e);
      }
    }

    handler = stepHandlers[step.type];
    if (!handler) {
      return next(new Error('Unknown handler:' + step.type));
    }

    runLog.info({step: stepIndex, context: getStepLogContext()}, "Starting step");
    var start = process.hrtime();

    handler(step, ctx, function(error, result) {

      var delta = process.hrtime(start),
        deltaMs = (delta[0] * 1e9 + delta[1]) / 1e6;

      ctx.deltas.push(deltaMs);

      runLog.info({step: stepIndex, context: getStepLogContext(), delta: deltaMs, result: result}, "Finished step");

      next(error);
    });
  }

  runLog.info("Starting run");
  next();
};
