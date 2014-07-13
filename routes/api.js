var express = require('express');
var path    = require('path');
var q       = require('q');

var apiHelpers = require('../db/api_helpers');
var publicDir   = require('../helpers/path_helpers').publicDir;


var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
  res.send('StoryViz JSON API');
})

.get('/dummy', function(req, res) {
  res.set('Content-Type', 'application/json');
  // res.charset = 'utf-8';
  
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
  // res.set('charset', 'utf-8');

  var result = {nodes: [], links: []};

  q.ninvoke(apiHelpers, 'retrieveData', {})
    .then(function(data) {
      data.forEach(function(d) {
        result.nodes.push({id: d.id, name: d.name});
      });
      
      var outgoingDef = q.defer();
      
      var count = 0;
      var total = result.nodes.length;

      data.forEach(function(d) {
        d._node.outgoing('knows', function(err, rel) {
          // todo: handle error
          if(err) { console.log('error in outgoing call:', err);}

          result.links.push({from: rel[0].start.id, to: rel[0].end.id});
          if(++count >= total) {
            outgoingDef.resolve(data);
          }
        });
      });

      return outgoingDef.promise;
    })

    .then(function(data) {
      res.send(JSON.stringify(result));
    }).done();
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
