var express    = require('express');
var path       = require('path');

var api_helpers = require('../db/api_helpers');
var publicDir   = require('../helpers/path_helpers').publicDir;


var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
  res.send('StoryViz JSON API');
});

apiRouter.get('/dummy', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.sendfile(path.join(publicDir, 'dummyJSON.json'));

  // Real world will be something like:
  // var params = req.query
  // // ... operate on query ...
  // db.query(params, function(err, data) {
  //   if(err) { res.send(500,'Internal Server Error'); }
  //   else {
  //    res.send(200, JSON.stringify(data));
  //   }
  // });
})

.post('/', function(req, res) {
  req.pipe(res); // for testing

  // Real world will be something like: 
  // var params = req.body // from bodyparser middleware
  // ... operate on body ...
  // db.addNode(params, function(err, data) {
  //   if(err) { res.send(500,'Internal Server Error'); }
      // else {
           // res.send(201, <ID of created user or whatever info we need>);
      // }
  // });
});

module.exports.apiRouter = apiRouter;
