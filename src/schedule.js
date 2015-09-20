var run = require('./run');

module.exports = function(options, done) {

  var steps = options.steps || [],
    count = options.count || 1,
    delay = options.delay || 0,
    randomisation = options.randomisation || 0;

  var completedCount = 0,
    errorCount = 0;

  function runComplete(error, ctx) {
    if (error) {
      errorCount++;
    }
    if (++completedCount < count) {
      return;
    }
    done(null, errorCount);
  }

  function scheduleRun(index) {
    var duration = (1 - Math.random() * randomisation) * delay;
    setTimeout(function() {
      run(steps, i, runComplete);
    }, duration);
  }

  for (var i = 0; i < count; i++) {
    scheduleRun(i);
  }

};
