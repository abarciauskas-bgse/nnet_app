var unit_sets = []
var UnitSet = function(type, layer, network) {
    this.class = 'UnitSet';
    this.type = type;
    this.layer = layer;
    this.y_offset = unit_set_y_position;
    this.y_position = unit_set_y_position;
    this.network = network;
    this.values = _.map(_.range(0,num_classes), function(i) { return i*0 })
    var x_offset = null;
    switch(this.type) {
        case 'input':
            // Not really sure about the second case, could be we use the output from layer 0
            x_offset = (this.layer == 0) ? 0 : layer_width;
            break;
        case 'output':
            var layer_offset = unit_width + 2*transfer_width + neuron_width
            x_offset = (this.layer == 0) ? layer_offset : (layer_width + layer_offset)
            break;
        case 'target':
            x_offset = (this.layer == 0) ? (layer_width - unit_width) : (width - unit_width)
            break;
    }
    this.x_offset = x_offset    
    unit_sets.push(this)
}


UnitSet.prototype.add = function() {
    var outer_group = layer_group(this, this.network)
    add_unit_sets(outer_group, 'unit', this)
};

UnitSet.prototype.update_values = function() {
    if (this.network == 'whatisaneuron') {
        values = sim_data.data_points[current_iter]
        values = [values.x1, values.x2]
        this.values = values
    }
    network = this.network
    this.d3_group.selectAll('.' + css_identifier('unit', this))
        .transition().duration(default_sub_iter_duration)
        .style('fill', function(d,i) { return (network == 'whatisaneuron') ? wkolors(Math.sign(values[i])) : wkolors(values[i]) })
        .attr('height', function(d, i) { return (network == 'whatisaneuron') ? whscale(Math.abs(values[i])) : unit_height })
        .attr('y', function(d, i) {
            if (network == 'whatisaneuron') {
                value = values[i]
                height_offset = d.index*unit_height + unit_height/2
                height = value > 0 ? height_offset - whscale(Math.abs(value)) : height_offset
            } else { 
                height = d.index*unit_height
            }
            return height
        })
}
