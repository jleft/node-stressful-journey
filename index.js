var run = require('./run'),
  log = require('./log');

var steps = require(process.argv[2]),
  count = process.argv[3] || 1,
  delay = process.argv[4] || 0,
  randomisation = process.argv[5] || 0;

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
