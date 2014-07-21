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
    var relationshipTypes = ['ParentChild', "Siblings", 'Near', 'Allies', 'Enemies', 'Kills'];
    
    api.saveNewCharacter({name: 'Mitch'}, 1, function(err, mitch) {
      api.saveNewCharacter({name: 'Vish'}, 1, function(err, vish) {
        api.saveNewCharacter({name: 'Michelle'}, 2, function(err, michelle) {
          api.saveNewCharacter({name: 'Joel Cox'}, 1, function(err, joelcox) {
            api.saveNewCharacter({name: 'Chris'}, 1, function(err, chris) {
              api.saveNewCharacter({name: 'Dhruv'}, 1, function(err, dhruv) {
                api.saveNewCharacter({name: 'Ajay'}, 1, function(err, ajay) {
                  api.saveNewCharacter({name: 'Andrew'}, 1, function(err, andrew) {
                    api.saveNewCharacter({name: 'Bao'}, 1, function(err, bao) {
                      api.saveNewCharacter({name: 'Celine'}, 1, function(err, celine) {
                        api.saveNewCharacter({name: 'David Deriso'}, 1, function(err, davidderiso) {
                          api.saveNewCharacter({name: 'David GW'}, 1, function(err, davidgw) {
                            api.saveNewCharacter({name: 'Voldemort'}, 1, function(err, voldemort) {
                              api.saveNewCharacter({name: 'Jake'}, 1, function(err, jake) {
                                api.saveNewCharacter({name: 'Jared'}, 1, function(err, jared) {
                                  api.saveNewCharacter({name: 'Mike S'}, 1, function(err, mikes) {
                                    api.saveNewCharacter({name: 'Park'}, 1, function(err, park) {
                                      api.saveNewCharacter({name: 'Mike B'}, 1, function(err, mikeb) {
                                        api.saveNewCharacter({name: 'Nelson'}, 1, function(err, nelson) {
                                          api.saveNewCharacter({name: 'Nick'}, 1, function(err, nick) {
                                            api.saveNewCharacter({name: 'Shawn'}, 1, function(err, shawn) {
                                              api.saveNewCharacter({name: 'Bob'}, 1, function(err, bob) {
                                                api.saveNewCharacter({name: 'Tom'}, 1, function(err, tom) {
                                                  api.saveNewCharacter({name: 'Tyler'}, 1, function(err, tyler) {
                                                    api.saveNewCharacter({name: 'Will V'}, 1, function(err, willv) {
                                                      api.saveNewCharacter({name: 'Walker'}, 1, function(err, walker) {
                                                        api.saveNewCharacter({name: 'Will J'}, 1, function(err, willj) {
                                                          api.saveNewCharacter({name: 'Will L'}, 1, function(err, willl) {
                                                            api.saveNewCharacter({name: 'Xianhui'}, 1, function(err, xianhui) {
                                                              relationshipTypes.forEach(function(type) {
                                                                var characters = [mitch, vish, michelle, joelcox, chris, dhruv, ajay, andrew, bao, celine, davidderiso, 
                                                                davidgw, voldemort, jake, mikes, park, mikeb, nelson, nick, shawn, bob, tom, tyler, willv, walker, willj, willl, xianhui];
                                                                var numChars = characters.length;
                                                                var numRels = Math.floor(Math.random()*20);
                                                                
                                                                for (var i = 0; i < numRels; i++) {
                                                                  var charIndex1 = Math.floor(Math.random()*numChars);
                                                                  var charIndex2 = Math.floor(Math.random()*numChars);
                                                                  if (charIndex1 === charIndex2) {
                                                                    charIndex2 = charIndex1 + 1;
                                                                  }
                                                                  
                                                                  characters[charIndex1].relateTo(characters[charIndex2], type, 1, function() {});
                                                                }
                                                              });
                                                            });
                                                          });
                                                        });      
                                                      });    
                                                    });  
                                                  });
                                                });
                                              });
                                            });
                                          });
                                        });      
                                      });    
                                    });  
                                  });
                                });
                              });
                            });
                          });      
                        });    
                      });  
                    });
                  });
                });
              });
            });
          });      
        });    
      });  
    });
  
    
    


    // dummyJSON.nodes.forEach(function(node) {
    //   api.saveNewCharacter({
    //     name: node.name
    //   }, 1, function(err, character) {
    //     if (err) { console.log(err);} 
    //     else { newCharacters.push(character); }
        
    //     completed += 1;

    //     if (completed === 30) {
    //       newCharacters.forEach(function(character) {
    //         var source = character.id;
    //         var target = newCharacters[Math.floor(Math.random() * 
    //                                     newCharacters.length)].id;
    //         var type = 'knows';
    //         api.saveRelationship({
    //           from: source,
    //           to: target,
    //           type: type
    //         }, function(err) {
    //           if (err) { console.log(err); }
    //         });
    //       });
    //     }
    //   });
    // });
  });
}

module.exports.mockDB = mockDB;