angular.module('storyviz.services', [])

.factory('Story', function($http) {
  var storyManager = {
    // get all names and relationships
    getAll: function() {
        return $http.get('/api/names/chapter/1');
    },

    // get nodes and links connected to specified character
    getChar: function(id) {
        return $http.get('/api/names/' + id + '/chapter/1');
    },

    // create new character
    addChar: function(newChar) {

        // jQuery's param method serializes object for ajax request
        var data = $.param(newChar);
        return $http({
            method: 'POST',
            url: '/api/names',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
    },

     // create new relationship
    addRel: function(relationship) {
        var data = $.param({json: JSON.stringify(relationship)});

        return $http({
            method: 'POST',
            url: '/api/relationship',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    },

    getRelsOfType: function(types) {
        var queryString = types.join('+');
        var url = '/api/relationship/types?filter=' + queryString;

        return $http({
            method: 'GET',
            url: url,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    },

    reindexLinks: function(data) {
        // var nodes = data.data.nodes;
        // var nodeIndexStorage = {};
        // var links = data.data.links;
        // var linkStorage = [];
        var dataByChapter = {};

        // Save array index of each node in nodeIndexStorage object
        for (var chapter in data.data) {
            var nodes = data.data[chapter].nodes;
            var nodeIndexStorage = {};
            var links = data.data[chapter].links;
            var linkStorage = [];

            for (var i = 0; i < nodes.length; i++) {
              nodeIndexStorage[nodes[i].id] = i;
            }

            for (var j = 0; j < links.length; j++) {
              var newLink = {};

              // Change source to refer to array index instead of character id
              var charIDSource = links[j].source;
              var charIDTarget = links[j].target;
              newLink.source = nodeIndexStorage[charIDSource];
              newLink.target = nodeIndexStorage[charIDTarget];
              newLink.type = links[j].type;
              linkStorage.push(newLink);
            }

            dataByChapter[chapter] = {nodes: nodes, links: linkStorage};
        }

        // return {nodes: nodes, links: linkStorage};
        return dataByChapter;
    }

  };
  return storyManager;
});
