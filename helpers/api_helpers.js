// Methods in this file are called by the API router directly. They talk to 
// the character model to create and retrieve information from the DB. They do
// not talk to the DB directly.

var q = require('q');

var Character  = require('../models/character_model').Character;

/**
 * Retrieve info from the DB in JSON, formatted the way D3 expects
 * @param  {Object} params A hash of parameters. By default returns 
 *                         the entire graph, or accept an array of IDs on 
 *                         params.id to show those IDs and their first-degree 
 *                         connections. 
 *                         (to support isolation view for a single node, and
 *                         for clicking nodes to increase scope in isolation
 *                         view)
 *                         params.chapter (required) specifies the point in time to grab 
 *                         relationships from.
 * @return {String}        Conveniently-formatted JSON
 */
function retrieveData(params, callback) {
  if(!params.id || Object.keys(params).length === 0) {
    Character.getAll(params.chapter, function(err, data) {
      if(err) { return callback(err); }

      data.nodes = data.nodes.map(function(node) {
        return {name: node.name, id: node.id};
      });

      data.links = data.links.map(function(link){
        return {
          source: link.source.id, 
          target: link.target.id, 
          type: link.type
        };
      });
      
      callback(null, data);
    });
  } else if (params.id) {

  }
}

/**
 * Persist a new node to the DB
 * @param  {Object}   params Parameters to save on the node. For now, just name.
 * @param  {Function} callback A callback with the signature 
 *                             (err, ID), where ID is the new character's ID.
 */
function saveNewCharacter(params, chapter, callback) {
  if(params.name && (chapter !== undefined)) {
    Character.create(params, chapter, function(err, newCharacter) {
      if(err) { return callback(err); }

      callback(null, newCharacter);
    });
  } else {
    callback('saveNewCharacter requires first argument ' +
      'to be an object with a "name" property, and the second ' +
      'agument to be the chapter the character will be created in.');
  }
}

/**
 * Persist a new relationship to the DB
 * @param  {Object} params     Parameters to save on the edge. Needs at least 
 *                             FromID, toID, and Type.
 * @param  {Function} callback 
 */
function saveRelationship(params, callback) {
  if (params.from !== undefined 
      && params.to !== undefined 
      && params.type !== undefined) {

    var toDef   = q.defer();
    var fromDef = q.defer();
    
    q.all([toDef.promise, fromDef.promise])
      .then(function(result) {
        result[0].relateTo(result[1], params.type, 1, function(err) {
          console.log(err);
        });
      })
      // .spread(function(a, b) {
      //   a.relateTo(b, params.type, 1, function(err) {console.log(err);});
      // })

      .catch(function(err) {
        callback(err);
      });

    Character.getById(params.to, function(err, node) {
      if (err) { toDef.reject(err); }
      toDef.resolve(node);
    }); 

    Character.getById(params.from, function(err, node) {
      if (err) { fromDef.reject(err); }
      fromDef.resolve(node);
    });

  } else {
    callback('saveRelationship requires from, to, and type properties.');
  }
}

module.exports = {
  retrieveData: retrieveData,
  saveNewCharacter: saveNewCharacter,
  saveRelationship: saveRelationship
  // _getAllRelationshipsOnly: _getAllRelationshipsOnly // for mocking
};
