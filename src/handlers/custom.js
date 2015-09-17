module.exports = function(config, ctx, done) {
  if (config.length <= 1) {
    try {
      config(ctx);
      done();
    }
    catch(e) {
      done(e);
    }
  } else {
    config(ctx, done);
  }
};
