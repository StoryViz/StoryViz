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
 * Retrieve all characters from the database, across all types and all chapters
 * in the format { 1: {nodes: [ {name: 'Mitch', id: 1} ], 
 *   links: [ source: 123, target: 456, type: 'knows' ] }, 2: ...}
 * @param  {Function} callback Callback for errors and results. provides an
 *                                      array containing Character instances
 *                                      representing the characters.
 */
Character.getAll = function(params, callback) {
  var query;
  if(Object.keys(params).length === 0) {
    // if I specify neither, return all types and IDs
    query = [
       'MATCH (source:CHARACTER)-[:CHAPTER]->(chap:CHAPTER)', //{num:' + chapter +'})',
       'OPTIONAL MATCH (chap)-[t]->(target:CHARACTER)',
       'RETURN source, type(t), target, chap.num'
      ].join('\n');
  } else if(params.id !== undefined && params.type !== undefined) {
    // if I specify both, return a single ID and a single type
    query = [
      'MATCH (source:CHARACTER)-[:CHAPTER]->(chap:CHAPTER)',
      'WHERE id(source)=' + params.id,
      'OPTIONAL MATCH (chap)-[t]->(target:CHARACTER)',
      'WHERE id(source)=' + params.id +' AND type(t)=\'' + params.type + '\'',
      'RETURN source, type(t), target, chap.num'
    ].join('\n');
  } else if (params.id !== undefined) {
    // if I only specify ID, return all types
    query = [
      'MATCH (source:CHARACTER)-[:CHAPTER]->(chap:CHAPTER)',
      'WHERE id(source)=' + params.id,
      'OPTIONAL MATCH (chap)-[t]->(target:CHARACTER)',
      'WHERE id(source)=' + params.id,
      'RETURN source, type(t), target, chap.num'
    ].join('\n');
    
  } else if (params.type !== undefined) {
    query = [
      // 'MATCH (source:CHARACTER)-[:CHAPTER]->(chap:CHAPTER)',
      // 'OPTIONAL MATCH (chap)-[t]->(target:CHARACTER)',
      'MATCH (source:CHARACTER)-[:CHAPTER]->(chap:CHAPTER)-[t]->(target:CHARACTER)',
      'WHERE '+ params.type,
      'RETURN source, type(t), target, chap.num'
    ].join('\n');
  }

  q.ninvoke(db, 'query', query, null)
    .then(function(results) {
      var r = {};
      var namesUniq = {};
      results.forEach(function(result) {
        var thisChapter = result['chap.num'];

        // make keys for the current chapter if one doesn't exist
        if(!r.hasOwnProperty(thisChapter)) { 
          r[thisChapter] = {nodes: [], links: []}; 
          namesUniq[thisChapter] = {};
        }

        // There will always be a source-- so we can get a list of all characters
        // existing in a chapter (regarless of their relationships). The source
        // names will repeat for every relationship, so we uniq them per chapter.
        var sourceCharacter = new Character(result.source);

        if(!namesUniq[thisChapter][sourceCharacter.name]) {
          r[thisChapter].nodes.push(sourceCharacter);
          namesUniq[thisChapter][sourceCharacter.name] = true;
        }

        if(result.target) {
          var targetCharacter = new Character(result.target);
          
          if(!namesUniq[thisChapter][targetCharacter.name]) {
            r[thisChapter].nodes.push(targetCharacter);
            namesUniq[thisChapter][targetCharacter.name] = true;
          }

          r[thisChapter].links.push({
            source: sourceCharacter, 
            target: targetCharacter,
            type: result['type(t)']
          });
        }
      });

      // double check
      // for (var chapter in r) {
      //   console.log('in chapter', chapter);
      //   console.log('characters:');
      //   r[chapter].nodes.forEach(function(node) {
      //     console.log(node.name);
      //   });
      //   console.log('links:');
      //   r[chapter].links.forEach(function(link) {
      //     console.log(link.source.name, link.target.name, link.type);
      //   });
      // }

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
    .then(function(results) {
      callback(null, results)
    })
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
