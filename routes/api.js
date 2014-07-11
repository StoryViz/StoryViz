var express = require('express');

var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
  res.send('StoryViz JSON API');
});

module.exports.apiRouter = apiRouter;