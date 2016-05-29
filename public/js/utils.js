var css_identifier = function(object_type, obj) {
    return obj.network + '_' + object_type
        + ((obj.type == null) ? '' : '_' + obj.type)
        + ((obj.layer == null) ? '' : '_L' + obj.layer)
        + ((obj.neuron == null) ? '' : '_N' + obj.neuron)
        + ((obj.index == null) ? '' : '_i' + obj.index)
}

var layer_group = function(object, network) {
    if (object.layer == 0) {
        layer = (network == 'training') ? training_layer0 : create_layer0
    } else {
        layer = (network == 'training') ? training_layer1 : create_layer1
    }
    return layer
}

var line_function = d3.svg.line().interpolate("basis");

// FIXME: this is scary stuff
var add_label_pointer = function(d3_selection, text, position) {
    offset = 30
    client_rect = d3_selection[0][0].getBoundingClientRect()
    start_width = client_rect.width
    switch (position) {
        case 'bottom left':
            x_offset = -1.5*offset;
            y_offset = offset + client_rect.height;
            break;
        case 'bottom':
            x_offset = -unit_width/2
            y_offset = offset*1.25 + client_rect.height;
            break;
        case 'top right':
            x_offset = offset;
            y_offset = -offset*1.25;
            break;    
        case 'top':
            x_offset = -unit_width/2;
            y_offset = -offset*1.25;
            break;
        case 'top left':
            x_offset = -1.75*offset;
            y_offset = -offset;
            break;    
        default: 
            x_offset = offset
            y_offset = -offset
    }

    label_pointer_group = d3_selection.append('g')
                              .attr('class','label_pointer_group')
                              .attr('transform', 'translate(' + x_offset + ',' + y_offset + ')')

    label_pointer_group.append('text').text(text)

    client_rect = d3_selection[0][0].getBoundingClientRect()
    new_width = client_rect.width
    width_diff = new_width-start_width

    marker_id = 'label_pointer_' + text.split(" ").join("_")
    add_marker(marker_id)
    // FIXME: pixel pushing
    line_y_offset = (position == 'bottom left') ? -14 : -5
    line_x_start = (position == 'bottom left') ? width_diff/2 : -4
    offset = (position == 'bottom left') ? -(offset + unit_width/2) : offset - 5
    if (position == 'bottom left') {
        line_data = [
            [line_x_start, line_y_offset], 
            [line_x_start, offset],
            [-x_offset-5, offset]
        ]
    } else if (position == 'top left') {
        line_data = [
            [offset*1.75, line_y_offset], 
            [-x_offset + 10, line_y_offset],
            [-x_offset + 10, offset-5]
        ]
    } else if (position == 'top right') {
        line_data = [
            [line_x_start, line_y_offset], 
            [-x_offset + unit_width/2, line_y_offset],
            [-x_offset + unit_width/2, offset]
        ]
    } else if (position == 'bottom') {
        line_data = [
            [text.length*3, line_y_offset-5],
            [text.length*3, -offset - 5]
        ]
    } else if (position == 'top') {
        line_data = [
            [unit_width, 6],
            [unit_width, offset+4]
        ]
    }
    label_pointer_group.append('path')
            .attr("d", line_function(line_data))
            .attr('fill', 'none')
            .attr('stroke', medium_grey)
            .attr("marker-end", "url(#" + marker_id + ")"); 

}

// color units and update_units are similar, maybe could use better naming
// color units colors target or input units using training data
// update_units uses data from the network
var color_units = function(type, layer) {
    these_notes = (type == 'input') ? current_iter_notes.inputs : current_iter_notes.targets
    _.where(unit_sets, {type: type, layer: layer}).forEach(function(unit_set) {
        unit_set.d3_group.selectAll('.unit')
          .style('fill', 'white')
          .transition()
          .duration(default_sub_iter_duration)
          .delay(playing ? 0 : default_sub_iter_duration)
          .style('fill', function(d, i) { return _.contains(these_notes, i) ? kolors(i) : 'white'})
    })   
}

var add_marker = function(marker_id) {
    marker = training_group.append("defs").append("marker")
        .attr("id", marker_id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 2)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5");
    return marker
}


var weight_lines = function() {
    return _.filter(tlines, function(line) { return _.contains(['wxh', 'hh', 'hy'], line.type) })                
}

// This function also works for fill in input units for layer 1 using output from layer 0
// !IMPORTANT: updates values as well
var update_units = function(layer, type) {
    components = {layer: layer, type: type}
    unit_set = _.find(unit_sets, components)
    // if updating the ouput for layer 0 OR the input for layer 1, hy layer should be 0
    // if updating the output for layer 1, hy layer should be 1
    hy_lines_layer = (type == 'output' && layer == 1) ? 1 : 0
    lines = _.where(tlines, {layer: hy_lines_layer, type: 'hy'})

    unit_set.d3_group.selectAll('.unit')
      .transition()
      .duration(default_sub_iter_duration)
      .style('fill', function(d, i) { return kolors(i)})
      .attr('fill-opacity', function(d, i) {
            this_probs = _.map(_.where(lines, {index: i}), function(l) { return l.value })
            total_prob = _.reduce(this_probs, function(memo, num) { return memo + num })
            unit_set.values[i] = total_prob
            return Math.max(0.15, total_prob)
      })
}

