var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase('http://localhost:7474');

var clearDb = [
'MATCH (n)',
'OPTIONAL MATCH (n)-[r]-()',
'DELETE n,r'
].join('\n');

// clear the DB every time the server resets, for testing.
db.query(clearDb,{}, function(){});

/**
 * Retrieve info from the DB in JSON, formatted the way D3 expects
 * @param  {Object} params A hash of parameters. 'All' returns the entire
 *                         graph, or accept in array of IDs on params.id to 
 *                         show those IDs and their first-degree connections. 
 *                         (to support isolation view for a single node, and
 *                         for clicking nodes to increase scope in isolation
 *                         view)
}
 * @return {String}        Conveniently-formatted JSON
 */
function retrieveData(params) {
  if(params.all) {
    
  } else if (params.id) {

  }
}

/**
 * Persist a new node to the DB
 * @param  {Object} params Parameters to save on the node. For now, just name.
 * @return {Object}        The ID of the new node, and any other relevant data
 *                         from the DB.
 */
function saveNode(params) {
  if(params.name) {

  }
}

/**
 * Persist a new relationship to the DB
 * @param  {Object} params Parameters to save on the edge. Needs at least 
 *                         FromID, toID, and Type.
 * @return {Object}        Any relevant data from the DB.
 */
function saveRelationship(params) {
  if(params.fromId && params.toId && params.type) {
    
  }
}

// var group = [
// db.createNode({name: 'mitch', age: 27}),
// db.createNode({name: 'vish'}),
// db.createNode({name: 'michelle'})
// ];


// group.forEach(function(member){
//   member.save(function(err, succ){
//     if(err) {console.log(err);}
//     console.log(succ);
//   });
// });

