var neo4j = require('neo4j');
var path  = require('path');

var db         = new neo4j.GraphDatabase('http://localhost:7474');
var api        = require('./api_helpers');
var publicDir  = require('../helpers/path_helpers').publicDir;
var dummyJSON  = require(path.join(publicDir, 'dummyJSON.json'));

/**
 * Clear the DB, then fill it with users from dummyJSON.json
 */
function mockDB() {
  var clearDb = [
  'MATCH (n)',
  'OPTIONAL MATCH (n)-[r]-()',
  'DELETE n,r'
  ].join('\n');

  // clear the DB
  db.query(clearDb,{}, function(){});
  console.log('DB cleared.');

  console.log('adding fake data to db...');
  dummyJSON.nodes.forEach(function(node) {
    api.saveNewCharacter({name: node.name}, function(err, id) {
      if(err) { console.log(err); }
      else {
        console.log('New mock user created: ' + id);
      }
    });
  });
  // dummyJSON.links.forEach(function(link) {
  //   db.createRelationshipFrom();
  // });
}

module.exports.mockDB = mockDB;