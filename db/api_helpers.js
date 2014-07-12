// Methods in this file are called by the API router directly. They talk to 
// the character model to create and retrieve information from the DB.
var q     = require('q');

var publicDir  = require('../server').publicDir;
var Character  = require('../models/character_model').Character;

/**
 * Retrieve info from the DB in JSON, formatted the way D3 expects
 * @param  {Object} params A hash of parameters. 'All', or no params returns 
 *                         the entire graph, or accept an array of IDs on 
 *                         params.id to show those IDs and their first-degree 
 *                         connections. 
 *                         (to support isolation view for a single node, and
 *                         for clicking nodes to increase scope in isolation
 *                         view)
 * @return {String}        Conveniently-formatted JSON
 */
function retrieveData(params) {
  if(params === undefined || params.all || Object.keys(params).length === 0) {
    // return whole graph
  } else if (params.id) {

  }
}



/**
 * Persist a new node to the DB
 * @param  {Object}   params Parameters to save on the node. For now, just name.
 * @param  {Function} callback A callback with the signature 
 *                             (err, ID), where ID is the new character's ID.
 */
function saveNewCharacter(params, callback) {
  if(params.name) {
    Character.create(params, function(err, newCharacter) {
      if(err) { callback(err); }

      else {
        callback(null, newCharacter);
      }
    });
  } else {
    callback('saveNewCharacter requires first argument ' +
      'to be an object with a "name" property');
  }
}

/**
 * Persist a new relationship to the DB
 * @param  {Object} params     Parameters to save on the edge. Needs at least 
 *                             FromID, toID, and Type.
 * @param  {Function} callback 
 */
function saveRelationship(params, callback) {
  if (params.from !== undefined && params.to !== undefined && params.type !== undefined) {
    console.log('creating from', params.from, 'to', params.to);
    var toDef   = q.defer();
    var fromDef = q.defer();

    q.all([toDef.promise, fromDef.promise])
      .spread(function(a, b) {
        a.follow(b, params.type, function() { a.save(); });
        b.follow(a, params.type, function() { b.save(); });
      }).catch(function(err) {
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
};

