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

    // create new character
    addChar: function(name) {

        // jQuery's param method serializes object for ajax request
        var data = $.param({name: name});
        return $http({
            method: 'POST',
            url: '/api/names',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
    },

    // create new relationship
    addRel: function(from, to, type) {
        return $http.post('/api/names/follow', {from: from, to: to, type: type});
    }

  };
  return storyManager;
});
