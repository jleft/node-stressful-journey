module.exports = function(config, ctx, done) {
  var handler = config.handler;
  if (handler.length <= 1) {
    try {
      handler(ctx);
      done();
    }
    catch(e) {
      done(e);
    }
  } else {
    handler(ctx, done);
  }
};
