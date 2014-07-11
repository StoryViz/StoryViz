var express = require('express');

var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
  res.send('StoryViz JSON API');
})

.post('/', function(req, res) {
  req.pipe(res); // for testing
});

module.exports.apiRouter = apiRouter;