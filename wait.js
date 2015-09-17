module.exports = function(config, ctx, done) {
  setTimeout(done, config.duration);
};
