var run = require('./run');

var steps = require(process.argv[2]),
  count = process.argv[3] || 1,
  delay = process.argv[4] || 0,
  randomisation = process.argv[5] || 0;

var errors = [];

function done(error) {
  if (error) {
    console.log(error);
  }
  errors.push(error);
  if (errors.length < count) {
    return;
  }
  console.log('Complete (' + errors.filter(Boolean).length + ' errors)');
}

for (var i = 0; i < count; i++) {
  // console.log('Scheduling runner ' + i);
  (function(i) {
    var duration = (1 - Math.random() * randomisation) * delay;
    setTimeout(function() {
      // console.log('Starting runner ' + i);
      run(steps, i, done);
    }, duration);
  }(i));
}
