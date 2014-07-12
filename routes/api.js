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
})

.get('/names/all', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.set('charset', 'utf-8');

  var result = {nodes: [], links: []};

  q.ninvoke(apiHelpers, 'retrieveData', {})
    .then(function(data) {
      data.forEach(function(d) {
        result.nodes.push({id: d.id, name: d.name});
      });
      
      var outgoingDef = q.defer();
      
      var count = 0;
      var total = result.nodes.length;

      for(var i = 0, len = data.length; i < len; i++) {
        var d = data[i];

        // get all the node's outgoing relations
        d._node.outgoing('knows', function(err, rel) {
          if(err) { return outgoingDef.reject(err); }

          if(rel.length === 0) { return outgoingDef.resolve(data); }

          for(var i = 0, len = rel.length; i < len; i++) {
            result.links.push({from: rel[i].start.id, to: rel[i].end.id});  
          }
          
          if(++count >= total) {
            outgoingDef.resolve(data);
          }
        });
      }

      return outgoingDef.promise;
    })

    .then(function(data) {
      res.send(JSON.stringify(result));
    }).done();
})

.post('/', function(req, res) {
  req.pipe(res); // for testing
});

module.exports.apiRouter = apiRouter;
