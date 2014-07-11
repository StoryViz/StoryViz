angular.module('storyviz.services', [])

.factory('Story', function($http) {
  var storyManager = {
    getAllChars: function() {
      return $http.get('/api/dummy');
    }
  };
  return storyManager;
});
