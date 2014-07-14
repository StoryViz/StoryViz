angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
      $scope.data = {};

      // gets dummy data
      $scope.getAllChars = function() {
        Story.getAllChars()
          .then(function(data) {
            //data is an object with node and link properties
            $scope.data = data;
          })
          .catch(function(err) {
            console.log(err);
            throw err;
          });
      };
      $scope.getAllChars();

      // get all names and relationships
      $scope.getAll = function() {
        Story.getAll()
          .then(function(data) {
            //data is an object with node and link properties
            $scope.data = data;
          })
          .catch(function(err) {
            console.log(err);
            throw err;
          });
      };

      $scope.getAll();

      // setChar will be called from view (e.g. on click)
      $scope.setChar = function() {
        // $scope.name should be set through data binding 
        // in view (e.g. input field)
        Story.setChar($scope.name)
          .then(function(response) {
            console.log("response from setChar: ", response);
          })
          .catch(function(err) {
            console.log(err);
            throw err;
          });
      };

      $scope.setRelationship = function() {
        // $scope.from, $scope.to, and $scope.type
         // should be set through data binding 
        // in view (e.g. input field)
        Story.setRelationship($scope.from, $scope.to, $scope.type)
          .then(function(response) {
            console.log("response from setRelationship: ", response);
          })
          .catch(function(err) {
            console.log(err);
            throw err;
          });
      };
      
  });
