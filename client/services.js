angular.module('storyviz.services', [])

.factory('Story', function($http) {
  var storyManager = {
    // get all names and relationships
    getAll: function() {
        return $http.get('/api/names/all/1');
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
        var data = $.param({json: JSON.stringify(types)});
        return $http({
            method: 'GET',
            url: '/api/relationship/types',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

  };
  return storyManager;
});
