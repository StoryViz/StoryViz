angular.module('storyviz.services', [])

.factory('Story', function($http) {
  var storyManager = {
    getAllChars: function() {
      $http.get('/api/dummy');
    }
  };
});
