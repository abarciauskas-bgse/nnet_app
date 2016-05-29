memory_cells =[]
var MemoryCell = function(hidden_state, neuron) {
    this.hidden_state = hidden_state
    this.neuron = neuron
    this.layer = hidden_state.layer
    memory_cells.push(this)
}

MemoryCell.prototype.add = function() {
    mc_group = this.neuron.append('g').attr('class','memory_cell_group')
        .attr('transform', 'translate(' + this.hidden_state.x_offset + ',' + this.hidden_state.y_offset + ')')
    this.d3_group = mc_group
    // Memory cell top
    mc_group.append('svg:line')
        .attr('class', 'memory_cell memory_cell_top')
        .attr('x1', - unit_width)
        .attr('x2', + 2*unit_width)
        .attr('y1', - unit_width)
        .attr('y2', - unit_width)

    // memory cell right top
    mc_group.append('svg:line')
        .attr('class', 'memory_cell memory_cell_right_top')
        .attr('x1', + 2*unit_width)
        .attr('x2', + 2*unit_width)
        .attr('y1', - unit_width)
        .attr('y2', + unit_width/2)

    mc_group.append('svg:line')
        .attr('class', 'memory_cell memory_cell_right_bottom')
        .attr('x1', + 2*unit_width)
        .attr('x2', + 2*unit_width)
        .attr('y1', + unit_width/2)
        .attr('y2', + 2*unit_width)

    // memory cell bottom
    mc_group.append('svg:line')
        .attr('class', 'memory_cell memory_cell_bottom')
        .attr('x1', - unit_width)
        .attr('x2', + 2*unit_width)
        .attr('y1', + 2*unit_width)
        .attr('y2', + 2*unit_width)

    // memory cell left top
    mc_group.append('svg:line')
        .attr('class', 'memory_cell memory_cell_left_top')
        .attr('x1', - unit_width)
        .attr('x2', - unit_width)
        .attr('y1', - unit_width)
        .attr('y2', + unit_width/2)
    // memory cell left bottom
    mc_group.append('svg:line')
        .attr('class', 'memory_cell memory_cell_left_bottom')
        .attr('x1', - unit_width)
        .attr('x2', - unit_width)
        .attr('y1', + unit_width/2)
        .attr('y2', + 2*unit_width)
}

MemoryCell.prototype.open = function(duration, side) {
    new_x = 0
    if (side == 'left') {
        new_x += -unit_width - 3*unit_width/2
    } else {
        new_x += 3*unit_width
    }
    //new_x = this.hidden_state.x_offset + 3*unit_width
    // fix me: this transition should not change length of line in the interim
    this.neuron.selectAll('.memory_cell_' + side + '_top').transition()
        .ease('cubic')
        .duration(duration/2)
        .attr('x2', new_x)
        .attr('y2', -unit_width)

    this.neuron.selectAll('.memory_cell_' + side + '_bottom').transition()
        .duration(duration/2)
        .ease('cubic')
        .attr('x1', new_x)
        .attr('y1', 3*unit_width/2 + unit_width/2)
}

var memory_cells_open_close = function(side, layer, duration = default_sub_iter_duration) {
    _.where(memory_cells, {layer: layer}).forEach(function(mc) {
        mc.open(duration, side)
    })
}
