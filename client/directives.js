angular.module('storyviz.directives', ['d3'])
  .directive('storyGraph', ['d3Service', function(d3Service){
    return {
      restrict: 'E',
      scope: {
        data: '=data'
      },
      link:function(scope, element) {
        d3Service.d3().then(function(d3) {

          var width = 1000;
          var height = 500;
          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height);

          // var graphData = scope.data.data;
          var color = d3.scale.category20();


          var force = d3.layout.force()
            // .nodes(graphData.nodes)
            // .links(graphData.links)
            .charge(-150)
            .linkDistance(50)
            .size([width, height]);

          scope.render = function(graphData) {

            var drawGraph = function() {
              force.nodes(graphData.nodes)
                .links(graphData.links)
                .on("tick", tick)
                .start();
            }

            var gnodes = svg.selectAll('g.gnode')
                .data(graphData.nodes)
                .enter()
                .append('g')
                .classed('gnode', true);

            var node = gnodes.append('circle')
                .attr('class', 'node')
                .attr('r', 10)
                .style('fill', function(d){return color(d.id)})
                .call(force.drag);


            var labels = gnodes.append("text")
              // .attr("text-anchor", "middle")
              // .attr("dy", ".1em")
              .text(function(d) { return d.name; });
             console.log(labels);

            var link = svg.selectAll('.link')
                .data(graphData.links)
              .enter()
                .insert('line', '.gnode')
                .attr('class', 'link')
                .style("stroke-width", 3);
            // link.enter()
            //   .insert('line', '.node')
            //   .attr('class', 'link');

            // node.enter()
            //   .append('svg:circle')
            //   .attr('class', 'node')
            //   .attr('r', 30);

            // force.start();
            function tick() {
              link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });
              gnodes.attr("transform", function(d) { 
                return 'translate(' + [d.x, d.y] + ')'; 
              });
              // node.attr("cx", function(d) { return d.x; })
              //     .attr("cy", function(d) { return d.y; });
            };
          drawGraph();
          };

          scope.$watch('data', function(newValue) {
            if (newValue !== undefined) {
              scope.render(newValue.data);
            }
          });
        });
      }
    };
  }

]);
