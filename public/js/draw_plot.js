var draw_plot = function(yrange, xrange, plot_type, data, group, dot_class, update) {
    // xscale
    var x = d3.scale.linear()
        .range([xrange[0], xrange[1]]);
    // yscale
    var y = d3.scale.linear()
        .range([yrange[1], yrange[0]]);

    // color scale
    var color = d3.scale.category10();
    // xAxis
    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(plot_type == 'loss' ? 0 : 5)
        .orient("bottom");

    // yAxis
    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left");

    if (plot_type == 'data') {
        x.domain([-scale, scale]).nice();
        y.domain([-scale, scale]).nice();
    } else if (plot_type == 'loss') {
        x.domain([0, data.length]);
        y.domain([0, 1]);
    }

    if (!update) {
        // draw x axis
        group.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + xrange[0] + "," + yrange[1] + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "label")
            .attr("x", xrange[1])
            .attr("y", -6)
            .style("text-anchor", "end")
            .text(plot_type == 'data' ? "x1" : 'Iterations');

        // draw y axis
        group.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(plot_type == 'data' ? "x2" : 'Loss');
    }
    // add data points
    if (plot_type == 'data') {
        // NOT SUPER HAPPY ABOUT THIS, BUT THERE IS SOME BUGS IN THE AREA-CREATING CODE BELOW
        // WHICH CAUSES THE SHADED REGION TO GO CRAZY
        var height = yrange[1]-yrange[0]
        var clip = svg.append("svg:clipPath")
          .attr("id", "clip")
        .append("svg:rect")
          .attr('width', height)
          .attr('height', height)
          .attr('x', xrange[0])
          .attr('y', yrange[0]);   
               
        if (!update) {
            // add legend
            var legend = group.selectAll(".legend")
                .data(color.domain())
              .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", xrange[1] - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", xrange[1] - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });
        } else if (update) {
            group.selectAll(".dot").remove()            
        }
        group.selectAll(".dot")
            .data(data)
          .enter().append("circle")
            .attr("class", dot_class)
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d.x1); })
            .attr("cy", function(d) { return y(d.x2); })
            .style("fill", function(d) { return d.class == 1 ? '#E88923' : '#9F55E8'; });        
    }

    if (plot_type == 'loss') {
        if (update) group.selectAll('path').remove()
        group.append('path')
            .attr('class', 'regrets')
            .attr('d', loss_line_function(data) )
            .style("stroke", "#E88923")
            .attr("stroke-width", 2)
            .attr("fill", "none");        
    }
}; // end draw_plot
