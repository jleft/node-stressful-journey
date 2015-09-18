var http = require('http'),
  process = require('process'),
  url = require('url');

var delay = process.argv[2] || 0,
  randomisation = process.argv[3] || 0;

module.exports = function(delay, randomisation) {

  function request(request, response) {
    var path = url.parse(request.url).path || '',
        matches;
      setTimeout(function() {
        switch (true) {
          case Boolean(matches = path.match(/\/hello/)):
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({hello: 'world'}));
            break;
          case Boolean(matches = path.match(/\/echo/)):
            response.writeHead(200, { 'Content-Type': request.headers['content-type'] });
            request.pipe(response);
            break;
          case Boolean(matches = path.match(/\/error\/([0-9]+)/)):
            response.writeHead(matches[1]);
            response.end();
            break;
          default:
            response.writeHead(404);
            response.end();
            break;
        }
      }, (1 - Math.random() * randomisation) * delay);
  }

  return http.createServer()
    .on('request', request)
    .listen(80);
};
