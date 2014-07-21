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
    // set to 1 for testing
    $scope.selectedChapter = 1;

    // $scope.numChapters = Object.keys($scope.dataByChapter).length;

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
          $scope.data = $scope.dataByChapter[$scope.selectedChapter];
        })
        .catch(function(err) {
          console.log(err);
          throw err;
        });
    };

    $scope.getAll();

    $scope.onClick = function(nodeId) {
      $scope.$apply(function() {
        $scope.selectedChar.id = nodeId;
        console.log(nodeId);
        $scope.getAll();
        console.log($scope.data);
      });
    };
    // TEST invocation of getAll with id & types
    // -------------------
    // setTimeout(function() {
    //   $scope.selectedChar.id = $scope.dataByChapter[$scope.selectedChapter].nodes[0].id;
    //   $scope.selectedRelTypes = ['knows'];
    //   $scope.getAll();
    // }, 200);
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

  //  $scope.playChapters = function() {
  //   console.log('dataByChapter: ');
  //   console.log($scope.dataByChapter);
  //   console.log('Playing chapters');
  //   $scope.data = {nodes: [], links: []};
  //   $scope.numChapters = Object.keys($scope.dataByChapter).length;
  //   console.log($scope.numChapters);
  //   var play = setInterval(function() {
  //     console.log('Current chapter: ', $scope.selectedChapter);
  //     $scope.data = $scope.dataByChapter[$scope.selectedChapter];
  //     console.log($scope.data);
  //     $scope.selectedChapter++;
  //     if ($scope.selectedChapter >= $scope.numChapters) {
  //       clearInterval(play);
  //     }
  //   }, 5000);
  // };

    // $scope.playChapters = function() {
    //   console.log('Playing chapters');
    //   $scope.data = {};
    //   var numChapters = Object.keys($scope.dataByChapter).length;
    //   console.log(numChapters);

    //   for (var chapter = 1; chapter <= numChapters; chapter++) {
    //     console.log('Chapter: ', chapter);
    //     // set data to be rendered
    //     // (triggers render() in d3 directive for each chapter)
    //     // needs to be slowed down
    //     $scope.data = $scope.dataByChapter[chapter];
    //   }
    // };

    // TEST playChapters
    // setTimeout(function() {
    //   $scope.playChapters();
    // }, 3000);

  });
