angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
    
    $scope.relationshipTypes = ['ParentChild', "Siblings", 'Near', 'Allies', 'Enemies', 'Kills', 'Mutual', 'Unrequited'];
    
    // nodes and links to be rendered in d3
    $scope.data = {};

    // nodes and links organized by chapter
    $scope.dataByChapter = {};

    // relationship types to be rendered in d3
    $scope.selectedRelTypes = [];

    // node data for character being added
    $scope.newChar= {};

    // link data for relationship being added
    $scope.newRel = {};

    // node data for selected character
    $scope.selectedChar = {};

    // Get all characters and relationships
    $scope.getAll = function() {
      var params = {};
      if ($scope.selectedChar.id) {
        params.id = $scope.selectedChar.id;
      }

      if ($scope.selectedRelTypes.length > 0) {
        params.type = $scope.selectedRelTypes;
      }

      Story.getAll(params)
        .then(Story.reindexLinks)
        .then(function(data) {
          $scope.dataByChapter = data;
          $scope.data = $scope.dataByChapter;
        })
        .catch(function(err) {
          console.log(err);
          throw err;
        });
    };

    $scope.getAll();

    // TEST invocation of getAll with id & types
    // -------------------
    setTimeout(function() {
      $scope.selectedChar.id = $scope.data[1].nodes[0].id;
      $scope.selectedRelTypes = ['knows'];
      $scope.getAll();
    }, 200);
    // -------------------

    // Add new character
    // addChar called from view on click
    $scope.addChar = function() {
      // $scope.name set through data binding in view
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
