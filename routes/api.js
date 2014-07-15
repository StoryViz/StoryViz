// The server sends any requests starting with /api to this router.

var express = require('express');
var path    = require('path');
var q       = require('q');

var apiHelpers = require('../helpers/api_helpers');
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

// Returns all names and relationships in the DB, in the form:
// {nodes: [{id: 5, name: 'mitch'}], links: [{source: 11, target: 24, type: 'knows'}]}
// where node ID and link source/target are the IDs of the actual nodes in the 
// database.
.get('/names/all', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.set('charset', 'utf-8');

  var result = {nodes: [], links: []};

  // Retrieve info on the full DB
  q.ninvoke(apiHelpers, 'retrieveData', {})
    .then(function(data) {
      data.forEach(function(d) {
        // push character names and IDs into the result
        result.nodes.push({id: d.id, name: d.name});
      });
      
      var outgoingDef = q.defer();
      
      var count = 0;
      var total = result.nodes.length;

      for(var i = 0, len = data.length; i < len; i++) {
        var d = data[i];

        // get all the character's outgoing relations...
        d._node.outgoing('knows', function(err, rel) {
          if(err) { return outgoingDef.reject(err); }
          // ...if there are none, resolve immediately...
          if(rel.length === 0) { return outgoingDef.resolve(data); }

          // ...otherwise push them all into the result.
          for(var i = 0, len = rel.length; i < len; i++) {
            result.links.push({source: rel[i].start.id, target: rel[i].end.id, type: 'knows'});  
          }
          
          // if all the callbacks have returned, we can resolve the promise.
          if(++count >= total) {
            outgoingDef.resolve(data);
          }
        });
      }

      return outgoingDef.promise;
    })

    .then(function(data) {
      res.send(JSON.stringify(result));
    })

    .catch(function(err) {
      console.log('error', err);
      res.send(500);
    }).done();
})

// Todo: handle POST requests to server for creating/updating nodes and links.
// see apiHelpers.saveNewCharacter and saveRelationship.
/*.post('/', function(req, res) {
  req.pipe(res); // for testing
})*/

.post('/names', function(req, res) {
  // save new character to db
  q.ninvoke(apiHelpers, 'saveNewCharacter', req.body)
    .then(function(data) {
      res.send(200);
    })
    .catch(function(err) {
      console.log('error', err);
      res.send(500);
    }).done();

});

module.exports.apiRouter = apiRouter;
