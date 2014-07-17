angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
    $scope.relationshipTypes = ['ParentChild', "Siblings", 'Near', 'Allies', 'Enemies', 'Kills', 'Mutual', 'Unrequited'];
    $scope.data = {};

    // stores all relationships for each character
    // enables isolation of a single character and their
    // relationships
    $scope.characterRelationships = {};

    // newChar stores node data for character being added
    $scope.newChar= {};

    // newRel stores link data for relationship being added
    $scope.newRel = {};

    // character stores node data for selected character
    $scope.selectedCharacter = {};

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
            newLink.type = links[j].type;
            linkStorage.push(newLink);
          }

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
    // addChar called from view on click
    $scope.addChar = function() {
      // $scope.name should be set through data binding 
      // in view (e.g. input field)
      Story.addChar($scope.newChar)
        .then(function(response) {

          // concat used instead of push in order to trigger change
          $scope.data.nodes = $scope.data.nodes.concat(response.data);
        })
        .catch(function(err) {
          console.log(err);
          throw err;
        });
    };

    // Add new relationship
    $scope.addRel = function() {
      // from, to, and, type are set through data binding in view 
      var relationship = {
        from: $scope.newRel.from.id,
        type: $scope.newRel.type,
        to: $scope.newRel.to.id,
      };

      Story.addRel(relationship)
        .then(function(response) {
          var newLink = {
            source: $scope.newRel.from.index,
            type: $scope.newRel.type,
            target: $scope.newRel.to.index
          };

          $scope.data.links = $scope.data.links.concat(newLink);
        })
        .catch(function(err) {
          console.log(err);
          throw err;
        });
    };

  });
