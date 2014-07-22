angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {

    $scope.relationshipTypes = ['ParentChild', "Siblings", 'Near', 'Allies', 'Enemies', 'Kills', 'Mutual', 'Unrequited'];
    
    // nodes and links to be rendered in d3
    $scope.data = {};

    // nodes and links organized by chapter
    $scope.dataByChapter = {};

    // node data for character being added
    $scope.newChar= {};

    // link data for relationship being added
    $scope.newRel = {};

    // relationship types to be rendered in d3
    $scope.selectedRelTypes = [];

    // node data for selected character
    $scope.selectedChar = {};

    // chapter set by slider bar in view
    // set to 1 for initialization
    $scope.selectedChapter = 1;

    // $('.range-slider').foundation('slider', 'set_value', $scope.selectedChapter);

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
          // console.log('data.links: ');
          // console.log(data.links);
          $scope.dataByChapter = data;
          $scope.data = $scope.dataByChapter[$scope.selectedChapter];
        })
        .catch(function(err) {
          console.log(err);
          throw err;
        });
    };

    $scope.getAll();

    $scope.updateChapter = function() {
      $scope.selectedChapter = $('#sliderInput')[0].value;
      $scope.getAll();
    };
    
    // make sure updateChapter and getAll are defined beforehand
    $(document).foundation({
      slider: {
        on_change: function(){
            $scope.updateChapter();
        }
      }
    });
    
    $scope.onClick = function(nodeId) {
      $scope.$apply(function() {
        $scope.selectedChar.id = nodeId;
        $scope.getAll();
      });
    };

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

    $scope.playChapters = function() {
      console.log('Playing chapters');
      console.log($scope.selectedRelTypes);

      // clear screen
      $scope.data = {nodes: [], links: []};
      $scope.numChapters = Object.keys($scope.dataByChapter).length;
      $scope.selectedChapter = 1;

      var play = setInterval(function() {
        console.log('Current chapter: ', $scope.selectedChapter);
        $('.range-slider').foundation('slider', 'set_value', $scope.selectedChapter);
        $scope.getAll();
        $scope.selectedChapter++;

        if ($scope.selectedChapter >= $scope.numChapters) {
          clearInterval(play);
        }
      }, 1000);
    }

  });



