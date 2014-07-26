angular.module('storyviz.story', [])
  .controller('StoryController', function($scope, Story) {
    console.log('Controller caller');

    $scope.relationshipTypes = ['ParentChild', "Siblings", 'Near', 'Allies', 'Enemies', 'Kills', 'Mutual', 'Unrequited'];
    
    // nodes and links to be rendered in d3
    $scope.data = {};

    //Setup some structures for testing.
    $scope.test = 0;

    $scope.testData = {};

    // nodes and links organized by chapter
    $scope.dataByChapter = {};

    // create list of chapters to iterate over in dropdown
    $scope.chapters = [];

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
    $scope.selectedChapter = 10;

    // flag indicating play/pause status
    $scope.playing = false;

    // play/pause button text
    $scope.button = 'Play';


    // maps buttons to 'typeSelected' class
    $scope.relationships = {
      'Allies': '',
      'Enemies': '',
      'Mutual': '',
      'Near': '',
      'Kills': '',
      'ParentChild': '',
      'Siblings': '',
      'Unrequited': ''
    };
    // $('.range-slider').foundation('slider', 'set_value', $scope.selectedChapter);

    $scope.changeClass = function(string){
      if ($scope.relationships[string] === ''){
        $scope.relationships[string] = 'typeSelected';
      } else {
        $scope.relationships[string] = '';
      }
    };

    // toggle whether or not rel type should be in selectedRelTypes
    $scope.toggleRel = function(relString){
      $scope.changeClass(relString);
      var relIndex = $scope.selectedRelTypes.indexOf(relString);
      if(relIndex === -1){
        $scope.selectedRelTypes.push(relString);
      } else {
        $scope.selectedRelTypes.splice(relIndex, 1);
      }
      $scope.getAll();
    };

    $scope.selectNone = function(){
      $scope.selectedChar={};
      $scope.selectedRelTypes=[];
      $scope.getAll();
    };

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
          $scope.chapters = Object.keys($scope.dataByChapter);
        })
        .catch(function(err) {
          console.log(err);
          throw err;
        });
    };

    $scope.getAll();

    $scope.updateChapter = function() {
      if($('#sliderInput')[0].value !== $scope.selectedChapter && $('#sliderInput')[0].value){
        $scope.selectedChapter = $('#sliderInput')[0].value;
        console.log("Slider: ", $('#sliderInput')[0].value);
        console.log("Current chapter: ", $scope.selectedChapter);
        $scope.getAll();
      }
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
      // current throws errors if things have yet to be chosen
      // when defined relationship assignment below works
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
          // adds to array of all relationships
          $scope.data.links = $scope.data.links.concat(newLink);
        })
        .catch(function(err) {
          console.log(err);
          throw err;
        });
    };

    $scope.reset = function(){
      $('.range-slider').foundation('slider', 'set_value', 1);
      $scope.updateChapter();
      clearInterval($scope.play);
      $scope.getAll();
    };

    $scope.playChapters = function() {
      $scope.numChapters = Object.keys($scope.dataByChapter).length;
      var currentChapter = $scope.selectedChapter < $scope.numChapters ? $scope.selectedChapter : 1;

      if(!$scope.playing){
        $scope.button = 'Pause';
        $scope.playing = true;
        // $scope.data = {nodes: [], links: []};
        $('.range-slider').foundation('slider', 'set_value', currentChapter);

        $scope.play = setInterval(function() {
          currentChapter++;
          if (currentChapter <= $scope.numChapters){
            $('.range-slider').foundation('slider', 'set_value', currentChapter);
          }
          if (currentChapter >= $scope.numChapters) {
            $scope.playing = false;
            $scope.button = 'Play';
            clearInterval($scope.play);
          }
        }, 800);
      } else {
        $scope.button = 'Play';
        $scope.playing = false;
        clearInterval($scope.play);
      }

    };

  });



