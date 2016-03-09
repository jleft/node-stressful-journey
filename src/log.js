var bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'stressful-journey',
  serializers: {
    err: bunyan.stdSerializers.err,
  }
});
