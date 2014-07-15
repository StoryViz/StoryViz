angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
      $scope.data = {};

      // gets dummy data
/*      $scope.getAllChars = function() {
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
      $scope.getAllChars();*/

      // get all names and relationships
      $scope.getAll = function() {
        Story.getAll()
          .then(function(data) {
            var nodes = data.data.nodes;
            var nodeIndexStorage = {};
            var links = data.data.links;
            var linkStorage = [];

            // Save array index of each node in nodeIndexStorage object
            for (var i = 0; i < nodes.length; i++) {
              nodeIndexStorage[nodes[i].id] = i;
            }

            for (var j = 0; j < links.length; j++) {
              var newLink = {};

              // Change source to refer to array index instead of character id
              var charIDSource = links[j].source;
              var charIDTarget = links[j].target;
              newLink.source = nodeIndexStorage[charIDSource];
              newLink.target = nodeIndexStorage[charIDTarget];
              linkStorage.push(newLink);
            }

            //data is an object with node and link properties
            // $scope.data = data;
            $scope.data = {nodes: nodes, links: linkStorage};
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
