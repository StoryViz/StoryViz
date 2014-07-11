angular.module('storyviz.directives', ['d3'])
  .directive('storyGraph', ['d3Service', function(d3Service){
    return {
      restrict: 'E',
      scope: {
        data: '='
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
          var vishmich = [{name: 'vish'}, {name: 'michelle'}];
          var rel = [{source: 0, target: 1}];

          var force = d3.layout.force()
            .nodes(vishmich)
            .links(rel)
            .charge(-150)
            .linkDistance(50)
            .size([width, height]);

          scope.render = function() {

            var node = svg.selectAll('.node')
                .data(vishmich)
              .enter()
                .append('svg:circle')
                .attr('class', 'node')
                .attr('r', 10);

            var link = svg.selectAll('.link')
                .data(rel)
              .enter()
                .insert('line', '.node')
                .attr('class', 'link')
                .style("stroke-width", 10);
            console.log(link);
            console.log(node);

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
