var tlines = [];
var TransferLine = function(type, layer, neuron, set, index) {
    this.type = type;
    this.layer = layer;
    this.neuron = neuron;
    this.set = set;
    this.index = index;
    this.source = set.source;
    this.target = set.target;
    this.network = set.network;
    tlines.push(this)
}

TransferLine.prototype.transfer_line_data = function(state) {
    unit_offset = unit_height*this.index + unit_height/2

    source_y = this.source.y_position
    target_y = this.target.y_position

    target_y = this.type == 'wxh' ? target_y + unit_height/2 : target_y + unit_offset
    y_start = source_y + (this.type == 'hh' ? unit_height/2 : unit_offset)
    //  : The 105 is pixel-fixing
    full_transfer_width = (this.type == 'xw' || this.type == 'hy') ? (transfer_width + inner_margin) : 105;
    first_break = 1/4

    if (state == 'grow') {
        line_data = [
            [0, y_start],
            [full_transfer_width*first_break, y_start],
            [full_transfer_width*(1-first_break), target_y],
            [full_transfer_width - 6, target_y]
        ]
    } else if (state == 'init') {
        line_data = [
            [0, y_start],
            [0, y_start],
            [0, y_start],
            [0, y_start]
        ] 
    }
    this.line_data = line_data
    return line_data
}

TransferLine.prototype.add = function() {
    marker_id = css_identifier('marker', this)
    marker = add_marker(marker_id)
    this.marker = marker   
    path = this.set.d3_group.append("path")
            .attr("d", line_function(this.transfer_line_data('init')))
            .attr('class', 'link')
            .attr("stroke", medium_grey)
            .attr('fill', 'none')
            .attr('visibility', 'hidden')
            .attr("marker-end", 'url(#' + marker_id + ')');
    this.path = path; 
}

TransferLine.prototype.grow = function(duration = default_sub_iter_duration) {
    this.path.attr('visibility', 'visible')
      .transition().duration(duration)
      .attr('d', line_function(this.transfer_line_data('grow')))
}

