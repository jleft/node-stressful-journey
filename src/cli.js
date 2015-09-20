var schedule = require('./schedule'),
  path = require('path');

var stepsPath = path.relative(__dirname, path.resolve(process.argv[2])),
  steps = require(stepsPath),
  count = process.argv[3] || 1,
  delay = process.argv[4] || 0,
  randomisation = process.argv[5] || 0;

function done(error, errorCount) {
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    console.info('Completed (%d) errors)', errorCount);
  }
}

schedule({
  steps: steps,
  count: count,
  delay: delay,
  randomisation: randomisation,
}, done);
