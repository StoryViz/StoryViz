angular.module('storyviz.services', [])

.factory('Story', function($http) {
  var storyManager = {
    // get all names and relationships
    getAll: function(params) {
        var url = '/api/names/';

        if (params.id && params.type) {
            // Add relationship types as query string
            // e.g. /api/names/type/Kills+Near+Enemies
            var queryString = params.type.join('+');
            url += params.id + '/type/' + queryString;
        } else if (params.id) {
            url += params.id;
        } else if (params.type) {
            url += 'type/' + params.type;
        }

        return $http.get(url);
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

    reindexLinks: function(data) {
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
        return dataByChapter;
    }

  };
  return storyManager;
});
