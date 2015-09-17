var bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'stressful-journey',
  streams: [{
    type: 'file',
    path: 'foo.log'
  }]
});
