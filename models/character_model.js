// The character class is a model for the data associated with a character in 
// the DB. These methods interact with the DB directly, and are called by the
// api_helpers.

var neo4j = require('neo4j');
var q     = require('q');

// todo: put this on a process variable:
//       process.env['NEO4J_URL'] ||
//       process.env['GRAPHENEDB_URL'] || localhost...
var db = new neo4j.GraphDatabase('http://localhost:7474');


// adapted from github.com/aseemk/node-neo4j-template

/**
 * Represents a character node in the DB
 * @param {Node-Neo4j Node} node A Node-Neo4j node, ie. result of 
 *                               db.createNode(), or the result of a db.query().
 */
var Character = function(node) {
  this._node = node;
};

// Static methods-- for retrieving Characters and relationships:

Character.getById = function (id, callback) {
  var query = [
  'MATCH (character:Character)',
  'WHERE id(character)=',
  id,
  'RETURN character'
  ].join('\n');

  q.ninvoke(db, 'query', query, null)
    .then(function(results) {
      callback(null, new Character(results[0].character));
    })
    .catch(function(err) {
      callback(err);
    })
    .done();
};


Character.getAll = function(callback) {
  var query = [
      'MATCH (character:Character)',
      'RETURN character',
  ].join('\n');

  q.ninvoke(db, 'query', query, null)
    .then(function(results) {
      var characters = results.map(function(result) {
        return new Character(result.character);
      });

      callback(null, characters);
    })
    .catch(function(err) {
      callback(err);
    })
    .done();
};

// Character.getAllRelationshipsOnly = function(callback) {
//   var query = 'MATCH (a)-[r:`knows`]->(b) RETURN r';

//   db.query(query, {}, function(err, results) {
//     if(err) { return callback(err); }

//     callback(null, results);
//   });
// };

Character.create = function (data, callback) {
  var node = db.createNode(data);
  var character = new Character(node);

  var query = [
      'CREATE (character:Character {data})',
      'RETURN character',
  ].join('\n');

  // Where data is just {name: "name"}, for now.
  var params = {
      data: data
  };

  q.ninvoke(db, 'query', query, params)
    .then(function(results) {
      var character = new Character(results[0].character);
      callback(null, character);
    })
    .catch(function(err) {
      return callback(err);
    })
    .done();
};

// Instance properties and methods-- for operating on a single Character:

Object.defineProperty(Character.prototype, 'id', {
  get: function() {
    return this._node.id;
  }
});

Object.defineProperty(Character.prototype, 'name', {
  get: function() {
    return this._node.data.name;
  },
  set: function(name) {
    this._node.data.name = name;
  }
});

Character.prototype.save = function(callback) {
  this._node.save(function(err) {
    if(callback) { callback(err); }
  });
};

Character.prototype.follow = function(other, type, callback) {
  type || (type = 'knows');
  this._node.createRelationshipTo(other._node, type, {}, function(err, rel) {
    if(callback) { callback(err); }
  });
};

module.exports.Character = Character;
