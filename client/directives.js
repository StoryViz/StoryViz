angular.module('storyviz.directives', ['d3'])
  .directive('storyGraph', ['d3Service', function(d3Service){
    return {
      restrict: 'E',
      scope: {
        ngModel: '=',
        data: '=data',
        onClick: '&'
      },
      link: function(scope, element) {
        d3Service.d3().then(function(d3) {
          var width = 1200;
          var height = 800;
          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%');
          var markerWidth = 6;
          var markerHeight = 6;
          var cRadius = 25;
          var refX = cRadius + (markerWidth * 2) ;
          var refY = -Math.sqrt(cRadius) + 2;
          var drSub = cRadius + refY;
          var color = d3.scale.category20();

          var force = d3.layout.force()
            .charge(-650)
            .linkDistance(150)
            .size([width, height]);

          var graphData = {};
          graphData.nodes = [];
          graphData.links = [];
          var renderNumber = 0;

          var render = function(newData) {

            // format new data to work with existing chart
            var isNodeIDInChart = function(id){
              for (var i =0; i < graphData.nodes.length; i++){
                if (graphData.nodes[i].id === id){
                  return true;
                }
              }
              return false;
            };

            var isIDinNewData = function(id){
              for (var i =0; i < newData.nodes.length; i++){
                if (newData.nodes[i].id === id){
                  return true;
                }
              }
              return false;
            };

            var syncNewData = function(){
              //Remove nodes that are not in the new data set.
              var indexesToRemove = [];
              for (var j = 0; j < graphData.nodes.length; j++){
                if(!isIDinNewData(graphData.nodes[j].id)){
                  graphData.nodes.splice(j, 1);
                  j--;
                  indexesToRemove.push(j);
                }
              }
              //Add nodes that are not already in the chart
              for (var i = 0; i < newData.nodes.length; i++){
                if(!isNodeIDInChart(newData.nodes[i].id)){
                  graphData.nodes.push(newData.nodes[i]);
                }
              }
            };

            var getIndexOfChartNode = function(id){
              for(var i = 0; i < graphData.nodes.length; i++){
                if(graphData.nodes[i].id === id){
                  return i;
                }
              }
            }

            var syncNewLinks = function(){
              for(var i = 0; i < newData.links.length; i++){
                var currLink = newData.links[i];
                // Nodes that already went through the force layout have the
                // source and target changed to an object.
                if(typeof currLink.source === "number"){
                  currLink.sourceID = currLink.source;
                  currLink.targetID = currLink.target;
                }
                currLink.source = getIndexOfChartNode(currLink.sourceID);
                currLink.target = getIndexOfChartNode(currLink.targetID);
                graphData.links.push(currLink);
              }
            };

            graphData.links = [];
            syncNewData();
            syncNewLinks();

            // stores number of relationships between a source and target
            var numRels = {};

            var countRels = function() {
              // this is returning undefined
              for (var i = 0; i < graphData.links.length; i++) {
                var source;
                var target;

                source = graphData.links[i].source;
                target = graphData.links[i].target;

                var key1 = source + ',' + target;
                var key2 = target + ',' + source;

                if (numRels[key1]) {
                  numRels[key1]++;
                } else {
                  numRels[key1] = 1;
                }

                if (numRels[key2]) {
                  numRels[key2]++;
                } else {
                  numRels[key2] = 1;
                }

                // assign the link's position (out of the total number
                // of relationships between its source and target)
                // to its linkIndex
                // Concerned that this is retriggering the render item's watch since this is bound to the
                // same data that is passed in. 
                graphData.links[i].linkIndex = numRels[key1];
              }
            };
            countRels();

            // Adds force graph attributes to each graphData note
            // Also adds 'tick' trigger for animating the force graph as nodes are added.
            force.nodes(graphData.nodes)
              .links(graphData.links)
              .on("tick", tick);

              force.start();

            if (renderNumber === 0){
              var paths = svg.append("svg:g").selectAll("path")
                .data(force.links(), function(d){return '' + d.sourceID + '-' + d.targetID + '-' + d.type});
            }else {
              var paths = svg.selectAll("g:first-of-type").selectAll("path")
                .data(force.links(), function(d){return '' + d.sourceID + '-' + d.targetID + '-' + d.type}); 
            }

            renderNumber++;

            paths.exit().remove();

            var path = paths
              .enter().append("svg:path")
              .attr("fill", "none")
              .attr("class", "link")
              .attr("id", function(d){
                return d.type;
              })
              .attr("stroke-width", 3);

            svg.selectAll('#unrequited, #parentchild, #kills')
              .attr("marker-end", "url(#end)");

            svg.append("svg:defs").selectAll("marker")
              .data(["end"])
                .enter().append("svg:marker")
                  .attr("id", String)
                  .attr("viewBox", "0 -5 10 10")
                  .attr("refX", refX)
                  .attr("refY", refY)
                  .attr("markerWidth", markerWidth)
                  .attr("fill", "#009999")
                  .attr("stroke-width", 2)
                  .attr("markerHeight", markerHeight)
                  .attr("orient", "auto")
                .append("svg:path")
                  .attr("d", "M0,-5L10,0L0,5");

            var nodes = svg.selectAll('g.gnode')
              .data(graphData.nodes, function(d){return d.id});

            nodes.exit().remove();

            var gnodes = nodes
              .enter().append('g')
              .classed('gnode', true);

            var node = gnodes.append('circle')
              .attr('class', 'node')
              .attr('r', 25)
              .style('fill', function(d){
                return color(d.id);
              })
              .on('dblclick', function(d, i){
                return scope.onClick({nodeId: d.id});
              })
              .call(force.drag);

            var nodeCircles = nodes.selectAll('circle');

            var labels = gnodes.append("text")
              .attr("text-anchor", "middle")
              .attr("class", "nodeLabels")
              .attr("dy", ".3em")
              .text(function(d) {
                return d.name;
              })
              .on('dblclick', function(d, i){
                return scope.onClick({nodeId: d.id});
              })
              .call(force.drag);

            var textLabels = svg.selectAll("text");

            // Use elliptical arc path segments to doubly-encode directionality.
            function tick() {
              paths.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);

                // get the total link numbers between source and target node
                var index = d.source.index + ',' + d.target.index;

                if(numRels[index] > 1)
                {
                  // if there are multiple links between these two nodes, we need generate different dr for each path
                  dr = dr/(1 + (1/numRels[index]) * (d.linkIndex - 1));
                }

                // generate svg path
                return "M" + d.source.x + "," + d.source.y +
                  "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y;
                  // I think this should be deleted?
                  // "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;
              });
                
              nodeCircles.attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });

              textLabels.attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });
            }

          };

          // watchGroup a part angular beta
          scope.$watchGroup(['data','data.nodes', 'data.links'], function(newValue) {
            if (newValue !== undefined) {

              //figure out how to make this better
              if (scope.data && scope.data.links){
                render(scope.data);
              }
            }
          });

        }); // end d3Service promise chain
      } // end link function
    }; // end returned object
  } // end dependency injection into directive

]); // end directive
