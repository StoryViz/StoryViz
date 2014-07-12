var express    = require('express');
var path       = require('path');

var apiHelpers = require('../db/api_helpers');
var publicDir   = require('../helpers/path_helpers').publicDir;


var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
  res.send('StoryViz JSON API');
})

.get('/dummy', function(req, res) {
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

.get('/names/all', function(req, res) {
  res.set('Content-Type', 'application/json');

  apiHelpers.retrieveData({}, function(err, data) {
    if(err) { console.log(err); res.send(500); }

    else {
      var names = data.map(function(d) {
        return {id: d.id, name: d.name};
      });

      var relationships = [];
      var count = names.length;
      data.forEach(function(d) {
        d._node.outgoing('knows', function(err, r) {
          relationships.push({from: r[0].start.id, to: r[0].end.id});
          if(--count <= 0) {
            var result = {nodes: names, links: relationships};
            res.send(JSON.stringify(result));
          }
        });
      });
      
      // TODO: ALSO RETURN RELATIONSHIPS AS LINKS ARRAY

    }
  });
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
