angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
      $scope.data = {};

      // stores all relationships for each character
      // enables isolation of a single character and their
      // relationships
      $scope.characterRelationships = {};

      // newCharacter stores node data for character being added
      $scope.newCharacter = {name: 'MichelleDoppelganger'};

      // newRelationship stores link data for relationship being added
      $scope.newRelationship = {};

      // character stores node data for selected character
      $scope.selectedCharacter = {};

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

      // Get all characters and relationships
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

      $scope.getCharacterRelationships = function() {
        // $scope.selectedCharacter.id;
      };

      // Add new character
      // setChar will be called from view (e.g. on click)
      $scope.addChar = function() {
        // $scope.name should be set through data binding 
        // in view (e.g. input field)
        Story.addChar($scope.newCharacter.name)
          .then(function(response) {
            console.log("Response from addChar: ", response);
          })
          .catch(function(err) {
            console.log(err);
            throw err;
          });
      };

      // Test adding a character
      $scope.addChar();

      // Add new relationship
      $scope.addRel = function() {
        // $scope.from, $scope.to, and $scope.type
         // should be set through data binding 
        // in view (e.g. input field)
/*        Story.addRel($scope.from, $scope.to, $scope.type)
          .then(function(response) {
            console.log("response from addRelationship: ", response);
          })
          .catch(function(err) {
            console.log(err);
            throw err;
          });*/
      };
      console.log('addRel invoked from story controller');
  });
