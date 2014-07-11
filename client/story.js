angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
      $scope.data = {};
      $scope.getAllChars = function() {
        Story.getAllChars()
          .then(function(data) {
            //data is an object with node and link properties
            console.log(data);
            $scope.data = data;
          })
          .catch(function(err) {
            throw err;
          });
      };
      $scope.getAllChars();
  });
