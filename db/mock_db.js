var neo4j = require('neo4j');
var path  = require('path');
var q     = require('q');

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
  var userCount = Object.keys(dummyJSON.nodes).length;

  var completed = 0;



  // var deferred = q.defer();

  // dummyJSON.nodes.forEach(function(node) {
  //   api.saveNewCharacter({name: node.name}, function(err, newUser) {
  //     if(err) { deferred.reject(new Error(err)); }

  //     deferred.resolve(newUser);
  //   }).then(function(newUser){
  //     console.log(newUser.id);
  //   });
  // });
  var newUsers = [];

  dummyJSON.nodes.forEach(function(node) {
    api.saveNewCharacter({name: node.name}, function(err, newUser) {
      if(err) { console.log(err); }
      else {
        console.log('New mock user created: ' + newUser.id);
        newUsers.push(newUser);
        // i need to get a full user object in stead of just the ID, so I can 
        // create relationships using .follow through .saverelationship
        // .saverelationship might need to be refactored? or we have to do ID 
        // lookups
      }
      completed += 1;
      if(completed === 30) {
        newUsers.forEach(function(user) {
          var source = user.id;
          var target = newUsers[Math.floor(Math.random() * newUsers.length)].id;
          var type   = 'knows';

          api.saveRelationship({
            from: source, 
              to: target,
            type: type 
          }, function(err) {
            if(err) { console.log('CAUGHT ERROR WHYYYYYY'); }
          });
        });
      }
    });
  });



}

module.exports.mockDB = mockDB;