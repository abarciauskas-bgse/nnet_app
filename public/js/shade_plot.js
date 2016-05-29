var shade_plot = function(yrange, xrange, wts, scale, group, update) {
    // xscale
    var x = d3.scale.linear()
        .range([xrange[0], xrange[1]]);
    // yscale
    var y = d3.scale.linear()
        .range([yrange[1], yrange[0]]);

    x.domain([-scale,scale]).nice();
    y.domain([-scale,scale]).nice();

    var area = d3.svg.area()
      .x(function(d) {return x(d[0]);})
      .y0(yrange[1])
      .y1(function(d) {
        yval = y(d[1])
        return yval;
      });

    var w = wts
    if (w[0] * w[1] > 0) {
        if (w[0] > w[1]) {
            x1_vals = [-scale, -scale*w[1]/w[0], scale*w[1]/w[0], scale]
            x2_vals = [scale, scale, -scale, -scale]
        } else {
            x1_vals = [-scale, -scale, scale, scale]
            x2_vals = [scale, scale*w[0]/w[1], -scale*w[0]/w[1], -scale]
        }
    } else {
        if (Math.abs(w[0]) < Math.abs(w[1])) {
            x1_vals = [-scale, -scale, scale, scale]
            x2_vals = [scale, scale*w[0]/w[1], -scale*w[0]/w[1], -scale]
        } else {
            x1_vals = [scale*w[1]/w[0], -scale*w[1]/w[0], scale, scale]
            x2_vals = [-scale, scale, scale, -scale]
        }
    }
    var shading_pts = x1_vals.map(function (e, i) {
        return [x1_vals[i], x2_vals[i]];
    });

    if (update) {
        group.selectAll('.area').transition().duration(step_duration)
            .attr('d', area(shading_pts))
            .attr('clip', "url(#clip)")
    } else {
        group.append("path")
            .attr("class", "area")
            .attr("d", area(shading_pts))
            .attr('clip-path', "url(#clip)");        

    }
} // end shade plot
