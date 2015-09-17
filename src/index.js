var log = require('./log'),
  path = require('path'),
  run = require('./run');

var stepsPath = path.relative(__dirname, path.resolve(process.argv[2])),
  count = process.argv[3] || 1,
  delay = process.argv[4] || 0,
  randomisation = process.argv[5] || 0;

var steps = require(stepsPath);

var completedCount = 0,
  errorCount = 0;

function done(error, ctx) {
  if (error) {
    errorCount++;
  }
  if (++completedCount < count) {
    return;
  }
  log.info('Completed (%d) errors)', errorCount);
}

for (var i = 0; i < count; i++) {
  (function(i) {
    var duration = (1 - Math.random() * randomisation) * delay;
    setTimeout(function() {
      run(steps, i, done);
    }, duration);
  }(i));
}
