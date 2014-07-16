angular.module('storyviz.services', [])

.factory('Story', function($http) {
  var storyManager = {
    // get all names and relationships
    getAll: function() {
        return $http.get('/api/names/all/1');
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
    addRel: function(relationship) {
        // var url = '/api/names/:' + from.id;

        var url = '/api/names/' + 1;
        var data = $.param({json: JSON.stringify(relationship)});

        return $http({
            method: 'POST',
            url: url,
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

  };
  return storyManager;
});
