var schedule = require('../src/schedule'),
  server = require('./server'),
  example = require('./example'),
  test = require('tape');

test('example journey', function (t) {
    t.plan(4);

    // n.b. runs on port 80
    var testServer = server(0, 0);

    var count = 500;

    schedule(example, count, 500, 1, function(error, errorCount) {
      t.error(error, 'should not error');
      t.equal(errorCount, 0, 'should not have any errors recorded');
      t.equal(example.runCount, count, 'should have run the custom callback count times');
      t.equal(example.asyncRunCount, count, 'should have run the custom async callback count times');

      testServer.close();
    });

});
