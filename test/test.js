var schedule = require('../src/schedule'),
  server = require('./server'),
  example = require('./example'),
  exampleSerializer = require('./exampleSerializer'),
  test = require('tape');

test('example journey', function (t) {
    t.plan(4);

    var testServer = server({port: 1234});

    var count = 300;

    schedule({steps: example, count: count, delay: 500, randomisation: 1}, function(error, errorCount) {
      t.error(error, 'should not error');
      t.equal(errorCount, 0, 'should not have any errors recorded');
      t.equal(example.runCount, count, 'should have run the custom callback count times');
      t.equal(example.asyncRunCount, count, 'should have run the custom async callback count times');

      testServer.close();
    }, exampleSerializer);

});
