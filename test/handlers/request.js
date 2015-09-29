var net = require('net'),
  http = require('http'),
  request = require('../../src/handlers/request'),
  test = require('tape');

test('request - connection error', function(t) {
  t.plan(2);

  var server = net.createServer()
    .on('connection', function(socket) {
      socket.destroy();
    })
    .listen(function() {
      var url = 'http://localhost:' + server.address().port;
      var r = request({options: url}, {}, function(e) {
        t.ok(e, 'should return error');
        t.equals(e.message, 'Connection error: socket hang up');
        server.close();
      });
    });
});

test('request - connection timeout', function(t) {
  t.plan(2);

  var server = net.createServer()
    .on('connection', function(socket) {
      // do nothing
    })
    .listen(function() {
      var url = 'http://localhost:' + server.address().port;
      var r = request({options: url, timeout: 10}, {}, function(e) {
        t.ok(e, 'should return error');
        t.equals(e.message, 'Connection error: Connection timeout');
        server.close();
      });
    });
});

test('request - non-200 status code', function(t) {
  t.plan(2);

  var server = http.createServer()
    .on('request', function(req, res) {
      res.writeHead(404);
      res.end();
    })
    .listen(function() {
      var url = 'http://localhost:' + server.address().port;
      var r = request({options: url}, {}, function(e) {
        t.ok(e, 'should return error');
        t.equals(e.message, 'Connection error: Non-200 response:404');
        server.close();
      });
    });
});

test('request - non-JSON content-type', function(t) {
  t.plan(2);

  var server = http.createServer()
    .on('request', function(req, res) {
      res.write('Helllo world');
      res.end();
    })
    .listen(function() {
      var url = 'http://localhost:' + server.address().port;
      var r = request({options: url}, {}, function(e) {
        t.ok(e, 'should return error');
        t.equals(e.message, 'Connection error: Non-JSON content-type:undefined');
        server.close();
      });
    });
});


test('request - non-JSON response', function(t) {
  t.plan(2);

  var server = http.createServer()
    .on('request', function(req, res) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write('Helllo world');
      res.end();
    })
    .listen(function() {
      var url = 'http://localhost:' + server.address().port;
      var r = request({options: url}, {}, function(e) {
        t.ok(e, 'should return error');
        t.equals(e.message, 'Invalid JSON response: Unexpected token H');
        server.close();
      });
    });
});
