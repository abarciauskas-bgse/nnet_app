var css_identifier = function(object_type, obj) {
    return obj.network + '_' + object_type
        + ((obj.type == null) ? '' : '_' + obj.type)
        + ((obj.layer == null) ? '' : '_L' + obj.layer)
        + ((obj.neuron == null) ? '' : '_N' + obj.neuron)
        + ((obj.index == null) ? '' : '_i' + obj.index)
}

var layer_group = function(object, network) {
    if (object.layer == 0) {
        switch (network) {
            case 'training': layer = training_layer0; break;
            case 'create': layer = create_layer0; break;
            case 'whatisaneuron': layer = whatisaneuron_layer0; break;
        }
    } else {
        layer = (network == 'training') ? training_layer1 : create_layer1
    }
    return layer
}

var line_function = d3.svg.line().interpolate("basis");

// FIXME: this is scary stuff
var add_label_pointer = function(d3_selector, text, position, add_x_offset = 0, add_y_offset = 0, add_pointer = true, fontsize = 16, parent_group = '#layer0') {
    marker_id = 'label_pointer_' + text.split(" ").join("_")
    if ($('#' + marker_id).length > 0) { return true }
    offset = 30
    svg_location = $(parent_group).position()
    var page_location = $(d3_selector).position()
    switch (position) {
        case 'bottom left':
            x_offset = page_location.left - offset;
            y_offset = page_location.top + offset;
            break;
        case 'bottom':
            x_offset = page_location.left;
            y_offset = page_location.top + offset;
            break;
        case 'top right':
            x_offset = page_location.left + offset;
            y_offset = page_location.top;
            break;    
        case 'top':
            x_offset = page_location.left;
            y_offset = page_location.top;
            break;
        case 'top left':
            x_offset = page_location.left - 1.5*offset;
            y_offset = page_location.top;
            break;    
        default: 
            x_offset = page_location.left;
            y_offset = page_location.top;
    }

    label_pointer_group = d3.select(parent_group).append('g')
          .attr('class','label_pointer_group')
          .attr('id', text.split(" ").join("_") + '_label')
          .attr('transform', 'translate('
            + (x_offset + add_x_offset - svg_location.left)
            + ',' + (y_offset + add_y_offset - svg_location.top) + ')')

    label_pointer_group.append('text').text(text).style('font-size', fontsize)
    add_marker(marker_id)
    // FIXME: pixel pushing
    line_y_offset = (position == 'bottom left') ? -14 : -5
    line_x_start = (position == 'top right') ? -3 : 50
    // offset = (position == 'bottom left') ? -(offset + unit_width/2) : offset - 5
    if (position == 'bottom left') {
        line_data = [
            [line_x_start, line_y_offset], 
            [line_x_start, offset],
            [-x_offset-5, offset]
        ]
    } else if (position == 'top left') {
        line_data = [
            [line_x_start, line_y_offset], 
            [offset*1.5 + unit_width, line_y_offset],
            [offset*1.5 + unit_width, offset/2]
        ]
    } else if (position == 'top right') {
        line_data = [
            [line_x_start, line_y_offset], 
            [-offset + unit_width/2, line_y_offset],
            [-offset + unit_width/2, offset/2]
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
            .attr('stroke', '#333')
            .attr("marker-end", "url(#" + marker_id + ")")
            .attr('visibility', add_pointer ? 'visible' : 'hidden'); 

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

var add_marker = function(marker_id, color = '#333') {
    marker = svg.append("defs").append("marker")
        .attr("id", marker_id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 2)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .style('fill', color)
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
      .style('fill', function(d, i) {
        rand = rbinom(0,1,0.5)
        if (rand > 0.6) {
            return kolors(i)
        } else {
            return 'white'
        }
      })
      // .attr('fill-opacity', function(d, i) {
      //       this_probs = _.map(_.where(lines, {index: i}), function(l) { return l.value })
      //       total_prob = _.reduce(this_probs, function(memo, num) { return memo + num })
      //       unit_set.values[i] = total_prob
      //       return Math.max(0.15, total_prob)
      // })
}


var add_unit_sets = function(outer_group, set_type, obj) {
    var set_group = outer_group.append('g')
                        .attr('class', set_type + '_set')
                        .attr('id', css_identifier(set_type + '_set', obj))
                        .attr('transform', 'translate(' + obj.x_offset + ',' + obj.y_offset + ')')
    obj.d3_group = set_group

    unit_data = _.map(d3.range(num_classes), function(idx) { return {index: idx, type: set_type} })

    set_group.selectAll('rect.' + set_type)
        .data(unit_data)
        .enter().append('rect')
            .attr('class', function(d, i) { return 'unit ' + d.type + ' ' + css_identifier(d.type, obj) })
            .attr('id', css_identifier(set_type + '_set', obj))
            .attr('width', unit_width)
            .attr('height', unit_height)
            .attr('y', function(d, i) { return d.index*unit_height })
}

var pause = function() {
    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    //quick reset of the timer array you just cleared
    timeouts = []; 
    total_time = 0;     
}

