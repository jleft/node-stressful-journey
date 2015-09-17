var url = require('url'),
  value = require('./value');

function template(_url) {
  return function(ctx) {
    var url = value(_url, ctx);
    return url.replace(/\$\{([^}]+)\}/g, function(_, token) {
      return ctx[token];
    });
  }
}

function addAuthToken(_url) {
  return function(ctx) {
    var options = url.parse(value(_url, ctx));
    options.headers.token = ctx.token;
    return options;
  }
}

var prefix = 'http://localhost';

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
      ctx.bob = 'bob';
      req.end();
    },
    response: function(ctx, res) {
      if (ctx.foo !== 'bar' || ctx.bob !== 'bob') {
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
      var options = url.parse('http://localhost/echo');
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
  }
];
