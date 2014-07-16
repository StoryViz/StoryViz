// The character class is a model for the data associated with a character in 
// the DB. These methods interact with the DB directly, and are called by the
// api_helpers.

var neo4j = require('neo4j');
var q     = require('q');

// todo: put this on a process variable:
//       process.env['NEO4J_URL'] ||
//       process.env['GRAPHENEDB_URL'] || localhost...
var db = new neo4j.GraphDatabase('http://localhost:7474');

// tell DB to enforce unique character names, in the case that we're booting with
// a new DB. If DB exists and this was already set, it will silently fail.
var uniqueNameQuery = [
  'CREATE CONSTRAINT ON (c:CHARACTER)',
  'ASSERT c.name IS UNIQUE'
].join('\n');
db.query(uniqueNameQuery, null, function(){});

// adapted from (now barely resembling) github.com/aseemk/node-neo4j-template

/**
 * Represents a character node in the DB
 * @param {Node-Neo4j Node} node A Node-Neo4j node, ie. result of 
 *                               db.createNode(), or the result of a db.query().
 */
var Character = function(node) {
  this._node = node;
};

// Static methods-- for retrieving Characters and relationships:

/**
 * Search for a character in the DB by database ID. 
 * @param  {Number}   id       The ID of the character in the database
 * @param  {Function} callback Callback for errors and results. Provides an 
 *                                      instance of the Character class 
 *                                      representing the new character.
 */
Character.getById = function (id, callback) {
  var query = [
  'MATCH (character:CHARACTER)',
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

/**
 * Retrieve all characters from the database
 * @param  {Function} callback Callback for errors and results. provides an
 *                                      array containing Character instances
 *                                      representing the characters.
 */
Character.getAll = function(chapter, callback) {
  var query = [
   'MATCH (source:CHARACTER)-[:CHAPTER]->(chap:CHAPTER {num:' + chapter +'})',
   'OPTIONAL MATCH (chap)-[t]->(target:CHARACTER)',
   'RETURN source, type(t), target'
  ].join('\n');

  q.ninvoke(db, 'query', query, null)
    .then(function(results) {

      // {source: <character>, target: <character>, type: 'knows'}
      var r = {nodes: [], links: []};
      var namesUniq = {};
      results.forEach(function(result) {
        // TODO: uniq the nodes array.
        thisCharacter = new Character(result.source);
        if(!namesUniq[thisCharacter.name]) {
          r.nodes.push(thisCharacter);  
          namesUniq[thisCharacter.name] = true;
        }
        
        
        if(result.target) {
          r.links.push({
            source: thisCharacter, 
            target: new Character(result.target),
            type: result['type(t)']
          });
          console.log('target:', r.links[r.links.length - 1].target.name);
        }
      });
      callback(null, r);
    })
    .catch(function(err) {
      callback(err);
    })
    .done();
};

/**
 * Create a Character instance using the provided data.
 * @param  {Object}   data     The data to be stored on the character's db node.
 *                             ie. name.
 * @param  {Number}   chapter  Chapter number to create the character in.
 * @param  {Function} callback Callback for errors and results. Provides a new
 *                             Character instance containing the new character'
 *                             information in the DB. Error contains any error
 *                             messages from the DB, if the creation is
 *                             unsuccessful.
 *                             
 */
Character.create = function (data, chapter, callback) {
  if(chapter === undefined) { 
    return callback('Character.create needs both data and an initial chapter');
  }

  var node = db.createNode(data);
  var character = new Character(node);

  // When a character is first created, it needs to be associated with a 
  // chapter or it will not show up in any view. Front-end should POST to
  // api/names with the character's name, and the current chapter to form
  // an initial association.

  //todo: Get chapter into data object somehow
  var query = [
      'CREATE (c:CHARACTER {data})',
      'CREATE (c)-[:CHAPTER]->(:CHAPTER {num: ' + 
        chapter + ', character: c.name})',
      'RETURN c'
  ].join('\n');

  // Where data is just {name: "name"}, for now.
  var params = {
      data: data
  };

  q.ninvoke(db, 'query', query, params)
    .then(function(results) {
      var character = new Character(results[0].c);
      callback(null, character);
    })
    .catch(function(err, res) {
      // will error if character name is non-unique.
      callback(err);
    })
    .done();
};

// Instance properties and methods-- for operating on a single Character:

// getter for a character instance's ID
Object.defineProperty(Character.prototype, 'id', {
  get: function() {
    return this._node.id;
  }
});

// Getter and setter for a character instance's ID. Call .save() after to 
// persist changes to the DB.
Object.defineProperty(Character.prototype, 'name', {
  get: function() {
    return this._node.data.name;
  },
  set: function(name) {
    this._node.data.name = name;
  }
});

/**
 * Persist any changes to a character instance back to the DB. 
 * @param  {Function} callback Provides any error message from the server.
 */
Character.prototype.save = function(callback) {
  this._node.save(function(err) {
    if(callback) { return callback(err); }
  });
};

/**
 * Create and persist a relationship to another character.
 * @param  {Character}   other    A character instance, ie. the result of
 *                                Character.getById.
 * @param  {String}   type     The type of relationship. Defaults to 'knows'.
 * @param  {Number}   chapter  The chapter in which to create the relationship.
 * @param  {Function} callback Provides any error message from the server.
 */
Character.prototype.relateTo = function(other, type, chapter, callback) {
  // TODO: this could probably be a static method and save a couple db lookups.
  if(chapter === undefined) { return callback('relateTo needs a chapter.')}
  type || (type = 'knows');
  
  // TODO: use a params object instead of stringbuilding.
  var query = [
    'MATCH (p1:CHARACTER) WHERE id(p1)=' + this.id,
    'MATCH (p2:CHARACTER) WHERE id(p2)=' + other.id,
    'CREATE UNIQUE (p1)-[:CHAPTER]->(c:CHAPTER {num: ' + chapter +
      ', character: p1.name})',
    'CREATE UNIQUE (p2)-[:CHAPTER]->(:CHAPTER {num: ' + chapter + 
      ', character: p2.name})',
    'MERGE (c)-[:'+ type +']->(p2)'
  ].join('\n');

  q.ninvoke(db, 'query', query, {})
    .catch(function(err, res) {
      // will error if character name is non-unique.
      callback(err);
    })
    .done();
  // this._node.createRelationshipTo(other._node, type, {}, function(err, rel) {
  //   if(callback) { return callback(err); }
  // });
};

module.exports.Character = Character;
