var express = require('express');
var path    = require('path');

var publicDir = require('../server').publicDir;

var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
  res.send('StoryViz JSON API');
});

apiRouter.get('/dummy', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.sendfile(path.join(publicDir, 'dummyJSON.json'));
})

.post('/', function(req, res) {
  req.pipe(res); // for testing
});

module.exports.apiRouter = apiRouter;