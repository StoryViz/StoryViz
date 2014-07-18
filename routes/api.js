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

// Returns all names and relationships in the DB, in the form:
// {nodes: [{id: 5, name: 'mitch'}], 
// links: [{source: 11, target: 24, type: 'knows'}]}
// where node ID and link source/target are the IDs of the actual nodes in the 
// database.
.param('chapter', function(req, res, next, chapter){
  req.chapter = chapter;
  next();
})

.get('/names/:id?/chapter/:chapter?', function(req, res) {
  var params = {chapter: req.chapter};

  if (req.params.id) {
    params.id = req.params.id;
  }

  res.set('Content-Type', 'application/json');
  res.set('charset', 'utf-8');
  // Retrieve info on the full DB
  q.ninvoke(apiHelpers, 'retrieveData', params)
    .then(function(data) {
      res.send(JSON.stringify(data));
      // data.forEach(function(d) {
      //   // push character names and IDs into the result
      //   result.nodes.push({id: d.id, name: d.name});
      // });
      
      // var outgoingDef = q.defer();
      
      // var count = 0;
      // var total = result.nodes.length;

      // for(var i = 0, len = data.length; i < len; i++) {
      //   var d = data[i];

      //   // get all the character's outgoing relations...
      //   d._node.outgoing('', function(err, rel) {
      //     if(err) { return outgoingDef.reject(err); }
      //     // ...if there are none, resolve immediately...
      //     if(rel.length === 0) { return outgoingDef.resolve(data); }

      //     // ...otherwise push them all into the result.
      //     for(var i = 0, len = rel.length; i < len; i++) {
      //       result.links.push({source: rel[i].start.id, 
      //         target: rel[i].end.id, 
      //         type: rel[i]._data.type});  
      //     }
          
      //     // if all the callbacks have returned, we can resolve the promise.
      //     if(++count >= total) {
      //       outgoingDef.resolve(data);
      //     }
      //   });
      // }

      // return outgoingDef.promise;
    })

    // .then(function(data) {
    //   res.send(JSON.stringify(result));
    // })

    .catch(function(err) {
      console.log('error', err);
      res.send(500);
    }).done();
})


.get('/relationship/types', function(req, res) {
  var params = req.query.filter.split(' ');
  res.send(200);

  /*TODO: develop api_helper and character_model
  methods for retrieveRelsOfType*/

  // q.ninvoke(apiHelpers, 'retrieveRelsOfType', 1)
  //   .then(function(data) {
  //     console.log('database response received in get handler')
  //     console.log(data);
  //     res.send(200);
  //   })
  //   .catch(function(err) {
  //     console.log('error', err);
  //     res.send(500);
  //   }).done();
})

.post('/names', function(req, res) {
  q.ninvoke(apiHelpers, 'saveNewCharacter', req.body, req.body.chapter)
    .then(function(data) {
      var node = {name: data.name, id: data.id};
      res.send(node);
    })
    .catch(function(err) {
      console.log('error', err);
      res.send(500);
    }).done();
})

.post('/relationship', function(req, res) {
    var relationship = JSON.parse(req.body.json);
    q.ninvoke(apiHelpers, 'saveRelationship', relationship)
      .then(function() {
        res.send(200);
      })
      .catch(function(err) {
        console.log('error', err);
        res.send(500);
      }).done();
});

module.exports.apiRouter = apiRouter;
