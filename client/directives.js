angular.module('storyviz.directives', ['d3'])
  .directive('storyGraph', ['d3Service', function(d3Service){
    return {
      restrict: 'E',
      scope: {
        data: '=data'
      },
      link:function(scope, element) {
        d3Service.d3().then(function(d3) {
          var width = 1200;
          var height = 800;
          var svg = d3.select(element[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height);
          var markerWidth = 6;
          var markerHeight = 6;
          var cRadius = 25;
          var refX = cRadius + (markerWidth * 2) - 1;
          var refY = -Math.sqrt(cRadius) + 9;
          var drSub = cRadius + refY;
          var color = d3.scale.category20();


          var force = d3.layout.force()
            .charge(-650)
            .linkDistance(150)
            .size([width, height]);

          scope.render = function(graphData) {
              // sort the links by source, then target
              var sortLinks = function() {               
                 graphData.links.sort(function(a,b) {
                      if (a.source > b.source) {
                          return 1;
                      }
                      else if (a.source < b.source) {
                          return -1;
                      }
                      else {
                          if (a.target > b.target) {
                              return 1;
                          } 
                          if (a.target < b.target) {
                              return -1;
                          }
                          else {
                              return 0;
                          }
                      }
                  });
              }
              
              //any links with duplicate source and target get an incremented 'linknum'
              var setLinkIndexAndNum = function() {               
                  for (var i = 0; i < graphData.links.length; i++) 
                  {
                      if (i != 0 &&
                          graphData.links[i].source == graphData.links[i-1].source &&
                          graphData.links[i].target == graphData.links[i-1].target) 
                      {
                          graphData.links[i].linkindex = graphData.links[i-1].linkindex + 1;
                      }
                      else 
                      {
                          graphData.links[i].linkindex = 1;
                      }
                      // save the total number of links between two nodes
                      if(mLinkNum[graphData.links[i].target + "," + graphData.links[i].source] !== undefined)
                      {
                          mLinkNum[graphData.links[i].target + "," + graphData.links[i].source] = graphData.links[i].linkindex;
                      }
                      else
                      {
                          mLinkNum[graphData.links[i].source + "," + graphData.links[i].target] = graphData.links[i].linkindex;
                      }
                  }
              } 
            console.log(graphData.links);
              

              var mLinkNum = {};
              
              // sort links first
              sortLinks();                
              
              // set up linkIndex and linkNumer, because it may possible multiple links share the same source and target node
              setLinkIndexAndNum();

              force.nodes(graphData.nodes)
                .links(graphData.links)
                .on("tick", tick)
                .start();


              // var arrowRel = graphData.links.filter(function(d, i) { return d.type === 'loves'})
              //                 // .attr('class', 'loves');

              // console.log(arrowRel);
              var path = svg.append("svg:g").selectAll("path")
                .data(force.links())
                .enter().append("svg:path")
                .attr("fill", "none")
                .attr("class", "link")
                .attr("id", function(d){return d.type;})
                .attr("stroke-width", 3)

                svg.selectAll('#loves, #kills')
                .attr("marker-end", "url(#end)");

              svg.append("svg:defs").selectAll("marker")
                .data(["end"])
                  .enter().append("svg:marker")  
                    .attr("id", String)
                    // .attr("class", function(d){return d.type;})
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


              console.log(svg.selectAll("#loves"));
              var gnodes = svg.selectAll('g.gnode')
                .data(graphData.nodes)
                .enter().append('g')
                .classed('gnode', true);

              var node = gnodes.append('circle')
                  .attr('class', 'node')
                  .attr('r', 25)
                  .style('fill', function(d){return color(d.id)})
                  .call(force.drag);

              var labels = gnodes.append("text")
                .attr("text-anchor", "middle")
                .attr("class", "nodeLabels")
                .attr("dy", ".3em")
                .text(function(d) { return d.name; })
                // .call(force.drag);

              
              // Use elliptical arc path segments to doubly-encode directionality.
              function tick() {
                  path.attr("d", function(d) {
                      var dx = d.target.x - d.source.x,
                          dy = d.target.y - d.source.y,
                          dr = Math.sqrt(dx * dx + dy * dy);
                      // get the total link numbers between source and target node
                      var lTotalLinkNum = mLinkNum[d.source.id + "," + d.target.id] || mLinkNum[d.target.id + "," + d.source.id];
                      if(lTotalLinkNum > 1)
                      {
                          // if there are multiple links between these two nodes, we need generate different dr for each path
                          dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
                      }     
                      // generate svg path
                      return "M" + d.source.x + "," + d.source.y + 
                          "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y + 
                          "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;  
                  });
                  
                  // Add tooltip to the connection path
                  // path.append("svg:title")
                  //     .text(function(d, i) { return d.name; });
                  
                  node.attr("transform", function(d) {
                      return "translate(" + d.x + "," + d.y + ")";
                  });

                  labels.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
              } 
              


              //   function tick() {
              //     // path.attr("x1", function(d) { return d.source.x; })
              //     //     .attr("y1", function(d) { return d.source.y; })
              //     //     .attr("x2", function(d) { return d.target.x; })
              //     //     .attr("y2", function(d) { return d.target.y; });
              //     path.attr("d", function(d) {
              //     var dx = d.target.x - d.source.x,
              //         dy = d.target.y - d.source.y,
              //         dr = Math.sqrt(dx * dx + dy * dy);
              //         return "M" + d.source.x + "," + d.source.y + "A" + (dr - drSub) + "," + (dr - drSub) + " 0 0,1 " + d.target.x + "," + d.target.y;
              //     });
              //     // gnodes.attr("transform", function(d) { 
              //       // return "translate(" + d.x + "," + d.y + ")";
              //     gnodes.attr("transform", function(d) { 
              //       return 'translate(' + [d.x, d.y] + ')'; 
              //     });
              //     // node.attr("cx", function(d) { return d.x; })
              //     //     .attr("cy", function(d) { return d.y; });
              //   };
              // // drawGraph();
          };

          scope.$watchGroup(['data', 'data.nodes', 'data.links'], function(newValue) {
            if (newValue !== undefined) {
              scope.render(scope.data.data);
            }
          });
        });
      }
    };
  }

]);
