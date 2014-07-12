var fs    = require('fs');

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
        callback(null, newCharacter.id);
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
  if(params.fromId && params.toId && params.type) {
    
  } else {
    // callback('')
  }
}

module.exports = {
  retrieveData: retrieveData,
  saveNewCharacter: saveNewCharacter,
  saveRelationship: saveRelationship
};

