var shaded_once = false
var update_shaded = function(weights, iter) {
    shade_plot([0,plot_width], [0,plot_width], weights, scale, second_plot_group, shaded_once)
    shaded_once = true
}

var update_loss = function(regrets, loss, iter) {
    regrets.push(loss);
    d3.selectAll('path.regrets')
      .attr("d", loss_line_function(regrets))
      .attr("transform", null)
      .transition()
      .duration(step_duration)
      // THIS WAS PROBABLY ALWAYS BAD, CAN REMOVE?
      //.attr("transform", "translate(" + loss_xscale(-1) + ")");
    regrets.shift();
}

var update_current_point = function(iter) {
    var points = d3.selectAll('#first_plot_group .dot')
    points.classed('current-point', false)
    points.attr('r', 3.5)
    n = points[0].length
    current_point = d3.select(points[0][iter%n]).classed('current-point', true).attr('r',6)
    position = $('.dot.dot-active.current-point').position()
    klass = current_point.data()[0].class
    colors = ['#9F55E8','#E88923']
    d3.select('#whatisaneuron_unit_set_target_L0').selectAll('rect')
      .transition().delay(walkthru ? 0 : sub_step_time*5).duration(sub_step_time)
      .style('fill', function(d, i) { return i == klass ? colors[i] : 'white' })
    // highlight new point for first n iters
    points = d3.selectAll('#second_plot_group .dot')[0]
    if (iter<n) { d3.select(points[iter]).transition()
        .attr('class', 'dot dot-active') }      
}

var step_update = function(iter) {
    if (playing) {
        step_duration = time_scale(iter)
        sub_step_time = step_duration/6-25
        current_iter = iter
    }

    //d3.selectAll('#current-iteration').html(current_iter)
    iter_weights = all_weights[iter]
    iter_loss = long_term_regrets[iter]
    update_current_point(iter)
    update_shaded(iter_weights, iter)
    update_loss(short_term_regrets, iter_loss, iter)
    currentx_data = current_data[iter%n]
    x = [currentx_data.x1, currentx_data.x2]
    transfer(x, iter_weights)
}
