angular.module('storyviz.services', [])

.factory('Story', function($http) {
  var storyManager = {
    // get dummy data
    getAllChars: function() {
      return $http.get('/api/dummy');
    },

    // get all names and relationships
    getAll: function() {
        return $http.get('/api/names/all');
    },

    // Warning: post requests currently not handled by server

    // create new character
    setChar: function(name) {
        return $http.post('/api/names/create', {name: name});
    },

    // create new relationship
    setRelationship: function(from, to, type) {
        return $http.post('/api/names/follow', {from: from, to: to, type: type});
    }


  };
  return storyManager;
});
