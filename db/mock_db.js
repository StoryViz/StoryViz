var neo4j = require('neo4j');
var path  = require('path');

var db = new neo4j.GraphDatabase('http://localhost:7474');
var publicDir  = require('../helpers/path_helpers').publicDir;

function mockDB() {
  // var dummyJSON = require(path.join(publicDir, 'dummyJSON.json'));

  var clearDb = [
  'MATCH (n)',
  'OPTIONAL MATCH (n)-[r]-()',
  'DELETE n,r'
  ].join('\n');

  // clear the DB
  db.query(clearDb,{}, function(){});
  console.log('DB cleared.');
  // console.log('adding fake data to db...');
  
  // dummyJSON.nodes.forEach(function(node) {
  //   db.createNode({name: node.name}).save(function(err, node){

  //   });

  // });
  // dummyJSON.links.forEach(function(link) {
  //   // db.createRelationshipFrom();
  // });
}

module.exports.mockDB = mockDB;