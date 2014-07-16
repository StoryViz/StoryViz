// Methods in this file generate mock data into the DB for testing.

var neo4j = require('neo4j');
var path  = require('path');

var db = new neo4j.GraphDatabase('http://localhost:7474');

var api        = require('../helpers/api_helpers');
var publicDir  = require('../helpers/path_helpers').publicDir;
var dummyJSON  = require(path.join(publicDir, 'dummyJSON.json'));

/**
 * Clear the DB, then fill it with character from dummyJSON.json
 */
function mockDB() {
  var clearDb = [
    'MATCH (n)',
    'OPTIONAL MATCH (n)-[r]-()',
    'DELETE n,r'
  ].join('\n');

  // clear the DB
  // 
  // This is ugly code that's here for testing purposes-- don't base anything 
  // that you care about on it.
  db.query(clearDb, {}, function(err, succ) {
    console.log('DB cleared.');
    console.log('adding fake data to db...');
    var characterCount = Object.keys(dummyJSON.nodes).length;

    var completed = 0;
    var newCharacters = [];

    dummyJSON.nodes.forEach(function(node) {
      api.saveNewCharacter({
        name: node.name
      }, 1, function(err, character) {
        if (err) { console.log(err);} 
        else { newCharacters.push(character); }
        
        completed += 1;

        if (completed === 30) {
          newCharacters.forEach(function(character) {
            var source = character.id;
            var target = newCharacters[Math.floor(Math.random() * 
                                        newCharacters.length)].id;
            var type = 'knows';

            api.saveRelationship({
              from: source,
              to: target,
              type: type
            }, function(err) {
              if (err) { console.log(err); }
            });
          });
        }
      });
    });
  });
}

module.exports.mockDB = mockDB;