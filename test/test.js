var schedule = require('../src/schedule'),
  server = require('./server'),
  example = require('./example'),
  test = require('tape');

test('example journey', function (t) {
    t.plan(2);

    // n.b. runs on port 80
    var testServer = server(0, 0);

    schedule(example, 500, 500, 1, function(error, errorCount) {
      t.error(error, 'should not error');
      t.equal(errorCount, 0, 'should not have any errored runs');

      testServer.close();
    });

});
