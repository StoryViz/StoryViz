angular.module('storyviz.services', [])

.factory('Story', function($http) {
  // var storyManager = {
    var getAllChars = function() {
      console.log("inside getAllChars function");
      return $http({
        method: 'GET',
        url: '/api/dummy'
      });
    };
    return {getAllChars: getAllChars};
  // };

  // return storyManager;
});
