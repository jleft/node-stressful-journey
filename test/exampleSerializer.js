module.exports = {
  context: function(ctx) {
    if (!(ctx && (ctx.foo || ctx.bar))) {
      return ctx;
    }
    var logCtx = {};
    if (ctx.foo) {
      logCtx.foo = ctx.foo;
    }
    if (ctx.bar) {
      logCtx.bar = ctx.bar;
    }
    return logCtx;
  }
};
