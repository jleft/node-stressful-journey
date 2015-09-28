var url = require('url');

var prefix = 'http://localhost:1234';

module.exports = [
  {
    type: 'request',
    options: prefix + '/hello'
  },
  {
    type: 'wait',
    duration: 500
  },
  {
    type: 'request',
    options: prefix + '/hello',
    response: function(ctx, res) {
      if (res.hello !== 'world') {
        throw new Error('Failed to validate response');
      }
    }
  },
  {
    type: 'wait',
    duration: 500
  },
  {
    type: 'request',
    options: function(ctx) {
      ctx.foo = 'bar';
      return prefix + '/hello';
    },
    request: function(ctx, req) {
      ctx.bar = 'foo';
      req.end();
    },
    response: function(ctx, res) {
      if (ctx.foo !== 'bar' || ctx.bar !== 'foo') {
        throw new Error('Failed to propagate context');
      }
    }
  },
  {
    type: 'wait',
    duration: 500
  },
  {
    type: 'request',
    options: {
      hostname: 'localhost',
      port: 1234,
      path: '/echo',
      method: 'POST'
    },
    request: function(ctx, req) {
      req.setHeader('Content-Type', 'application/json');
      req.end(JSON.stringify({hello:'world'}));
    },
    response: function(ctx, res) {
      if (res.hello !== 'world') {
        throw new Error('Failed to validate response');
      }
    }
  },
  {
    type: 'request',
    options: function(ctx) {
      var options = url.parse(prefix + '/echo');
      options.method = 'POST';
      return options;
    },
    request: function(ctx, req) {
      req.setHeader('Content-Type', 'application/json');
      req.end(JSON.stringify({hello:'world'}));
    },
    response: function(ctx, res) {
      if (res.hello !== 'world') {
        throw new Error('Failed to validate response');
      }
    }
  },
  {
    type: 'custom',
    handler: function(ctx) {
      var runCount = module.exports.runCount || 0;
      module.exports.runCount = runCount + 1;
    }
  },
  {
    type: 'custom',
    handler: function(ctx, done) {
      setTimeout(function() {
        var asyncRunCount = module.exports.asyncRunCount || 0;
        module.exports.asyncRunCount = asyncRunCount + 1;
        done();
      }, 10);
    }
  },
  {
    type: 'custom',
    disabled: true,
    handler: function(ctx, done) {
      throw new Error('Should be disabled');
    }
  }
];
