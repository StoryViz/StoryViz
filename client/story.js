angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
      $scope.data = {};
      $scope.getAllChars = function() {
        console.log('hi');
        Story.getAllChars()
          .then(function(data) {
            //data is an object with node and link properties
            console.log('inside then');
            console.log(data);
            $scope.data = data;
          })
          .catch(function(err) {
            console.log(err);
            throw err;
          })
          .finally(function(){
            console.log("finally!");
          });
      };
      $scope.getAllChars();
  });
