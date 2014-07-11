var express = require('express');

var indexRouter = express.Router();

indexRouter.get('/', function(req, res) {
  res.send('StoryViz');
});

module.exports.indexRouter = indexRouter;