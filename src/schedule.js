var run = require('./run');

module.exports = function(steps, count, delay, randomisation, done) {

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
