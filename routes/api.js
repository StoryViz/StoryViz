// The server sends any requests starting with /api to this router.

var express = require('express');
var path    = require('path');
var q       = require('q');
var eParams = require('express-params');

var apiHelpers = require('../helpers/api_helpers');
var publicDir   = require('../helpers/path_helpers').publicDir;

var apiRouter = express.Router();
eParams.extend(apiRouter);

apiRouter.get('/', function(req, res) {
  res.send('StoryViz JSON API');
})

// validations for ID and type parameters
.param('id', /^\d+$/) // IDs are digits only
.param('type', /^[a-zA-Z,]+$/) // types are strings only


.get('/names/:id?', function(req, res) {
  handleIdAndType(req, res);
})

.get('/names/:id?/type/:type?', function(req, res) {
  handleIdAndType(req, res);
});

function handleIdAndType(req, res) {
  res.set('Content-Type', 'application/json');
  res.set('charset', 'utf-8');

  var params = {};

  // TODO: this could be simplified, since this logic is 
  // already in Character.getAll
  if(req.params.id !== undefined && req.params.type !== undefined) {
    // if I specify both, return a single ID and a single type
    //  GET /api/name/1/type/knows
    params.id = Number(req.params.id[0]);
    params.type = req.params.type[0];
    
  } else if(req.params.id !== undefined) {
    // if I only specify ID, return all types
    //  GET /api/names/:id
    params.id = Number(req.params.id[0]);
  } else if (req.params.type !== undefined) {
    // if I only specify type, return all IDs
    //  GET /api/names/type/:type
    // params.type = req.params.type[0];

    var temp = req.params.type[0].split(',');
    var result = [];
    for (var i = 0; i < temp.length; i++){
      result.push('type(t)=\'' + temp[i] + '\'');
    }
    params.type = result.join(' OR ');
  } else {
    // if I specify neither, return all types and IDs
    //  GET /api/names
  }

  // Retrieve info on the full DB
  q.ninvoke(apiHelpers, 'retrieveData', params)
    .then(function(data) {
      res.send(JSON.stringify(data));
    })

    .catch(function(err) {
      console.log('error', err);
      res.send(500);
    }).done();
}


// apiRouter.get('/relationship/types', function(req, res) {
//   var params = req.query.filter.split(' ');
//   res.send(200);

//   /*TODO: develop api_helper and character_model
//   methods for retrieveRelsOfType*/

//   // q.ninvoke(apiHelpers, 'retrieveRelsOfType', 1)
//   //   .then(function(data) {
//   //     console.log('database response received in get handler')
//   //     console.log(data);
//   //     res.send(200);
//   //   })
//   //   .catch(function(err) {
//   //     console.log('error', err);
//   //     res.send(500);
//   //   }).done();
// })

apiRouter.post('/names', function(req, res) {
  q.ninvoke(apiHelpers, 'saveNewCharacter', req.body, req.body.chapter)
    .then(function(data) {
      var node = {name: data.name, id: data.id};
      res.send(node);
    })
    .catch(function(err) {
      console.log('error in post /names', err);
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
