angular.module('storyviz.directives', ['d3'])
  .directive('chapterSlider', [function(){
    return {
      restrict: 'E',
      template: '<div class="range-slider round" data-slider data-options="start: 0; end: 20;">' +
                  '<span class="range-slider-handle"></span>' +
                  '<span class="range-slider-active-segment"></span>' +
                  '<input type="hidden">' +
                '</div><span></span>', //span sacrifices itself in order for div to render
      scope: {
        chapter: '=chapter',
      },
      link: function(scope, element) {
        var new_value = 3;
        $('slider').foundation('slider', 'set_value', new_value);
      }
    };
  }
])
  .directive('storyGraph', ['d3Service', function(d3Service){
    return {
      restrict: 'E',
      scope: {
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

          // var labelForce = d3.layout.force()
          //   .charge(-100)
          //   .linkDistance(0)
          //   .linkStrength(8)
          //   .size([width, height]);

          scope.render = function(graphData) {

            // stores number of relationships between a source and target
            var numRels = {};

            var countRels = function() {
              for (var i = 0; i < graphData.links.length; i++) {
                if (graphData.links[i].source.id === undefined) {
                  var source = graphData.links[i].source;
                  var target = graphData.links[i].target;
                } else {
                  var source = graphData.links[i].source.index;
                  var target = graphData.links[i].target.index;
                }
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
                graphData.links[i].linkIndex = numRels[key1];
                console.dir(numRels);
              }
            };
            countRels();

            force.nodes(graphData.nodes)
              .links(graphData.links)
              .on("tick", tick)
              .start();

            var path = svg.append("svg:g").selectAll("path")
              .data(force.links())
              .enter().append("svg:path")
              .attr("fill", "none")
              .attr("class", "link")
              .attr("id", function(d){return d.type;})
              .attr("stroke-width", 3)

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

            var gnodes = svg.selectAll('g.gnode')
              .data(graphData.nodes)
              .enter().append('g')
              .classed('gnode', true);

            var node = gnodes.append('circle')
              .attr('class', 'node')
              .attr('r', 25)
              .style('fill', function(d){return color(d.id)})
              .on('dblclick', function(d, i){return scope.onClick({nodeId: d.id});})
              .call(force.drag);

            var labels = gnodes.append("text")
              .attr("text-anchor", "middle")
              .attr("class", "nodeLabels")
              .attr("dy", ".3em")
              .text(function(d) { return d.name; });

            // Use elliptical arc path segments to doubly-encode directionality.
            function tick() {
              path.attr("d", function(d) {
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
                  // "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;  
              });
                
              node.attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });

              labels.attr("transform", function(d) {
                  return "translate(" + d.x + "," + d.y + ")";
              });
            }; 

          };
          
          scope.$watchGroup(['data','data.nodes', 'data.links'], function(newValue) {
            if (newValue !== undefined) {
              // remove all children of svg
              d3.selectAll("svg > *").remove();
              scope.render(scope.data);
            }
          });

        }); // end d3Service promise chain
      } // end link function
    }; // end returned object
  } // end dependency injection into directive

]); // end directive
