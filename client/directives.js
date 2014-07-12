angular.module('storyviz.directives', ['d3'])
  .directive('storyGraph', ['d3Service', function(d3Service){
    return {
      restrict: 'E',
      scope: {
        data: '=data'
      },
      link:function(scope, element) {
        d3Service.d3().then(function(d3) {

          // var tick = function() {
          //   node.attr("x", function(d) { return d.x - 20; })
          //       .attr("y", function(d) { return d.y - 20; })

          //   link.attr("x1", function(d) { return d.source.x; })
          //       .attr("y1", function(d) { return d.source.y; })
          //       .attr("x2", function(d) { return d.target.x; })
          //       .attr("y2", function(d) { return d.target.y; });
          // };

          var width = 500;
          var height = 500;
          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height);

          var graphData = scope.data.data;

          var force = d3.layout.force()
            .nodes(graphData.nodes)
            .links(graphData.links)
            .charge(-150)
            .linkDistance(50)
            .size([width, height]);
            // console.log("links: ", graphData.links);
            // console.log("nodes: ", graphData.nodes);

          scope.render = function() {

            var node = svg.selectAll('.node')
                .data(graphData.nodes)
              .enter()
                .append('svg:circle')
                .attr('class', 'node')
                .attr('r', 10);
            // node.append("title")
            //   .text(function(d) { return d.name; });

            var link = svg.selectAll('.link')
                .data(graphData.links)
              .enter()
                .insert('line', '.node')
                .attr('class', 'link')
                .style("stroke-width", 3);
            // link.enter()
            //   .insert('line', '.node')
            //   .attr('class', 'link');

            // node.enter()
            //   .append('svg:circle')
            //   .attr('class', 'node')
            //   .attr('r', 30);

            force.start();
            force.on("tick", function() {
              link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });

              node.attr("cx", function(d) { return d.x; })
                  .attr("cy", function(d) { return d.y; });
            });
          };
          scope.render();
        });
      }
    };
  }

]);
