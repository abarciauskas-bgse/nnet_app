var weight_sets = []
WeightSet = function(type, layer, neuron, network) {
    this.class = 'WeightSet';
    this.type = type;
    this.layer = layer;
    // FIXME: should be neuron_idx everywhere or dried with neuron attribution
    this.neuron = neuron;
    this.y_offset = (neuron_height - weight_set_height)/2; // equally spaced from top and bottom of neuron container
    // FIXME: Hacky - duplicates code from Neuron#y_position
    this.y_position = this.y_offset + ((neuron == 0) ? network_y_position : (network_y_position + neuron_height + inner_margin))
    this.network = network;
    this.x_offset = (this.type == 'xw') ? inner_margin : (neuron_width - inner_margin - unit_width)
    weight_sets.push(this)
}

WeightSet.prototype.add = function() {
    var neuron = d3.select("#" + this.network + "_neuron_L" + this.layer + "_i" + this.neuron)
    add_unit_sets(neuron, 'weight', this)
}


WeightSet.prototype.update_weights = function() {
    weights = _.map(_.range(0,num_classes), function() { return Math.random()*_.random(-1,1)})
    this.weights = weights
    network = this.network
    this.d3_group.selectAll('rect.weight')
        .transition().duration(default_sub_iter_duration)
        .style('fill', function(d,i) { return (network == 'whatisaneuron') ? wkolors(Math.sign(weights[i])) : wkolors(weights[i]) })
        .attr('height', function(d, i) { return (network == 'whatisaneuron') ? whscale(Math.abs(weights[i])) : unit_height })
        .attr('y', function(d, i) {
            if (network == 'whatisaneuron') {
                weight = weights[i]
                height_offset = d.index*unit_height + unit_height/2
                this_height = weight > 0 ? height_offset - whscale(Math.abs(weight)) : height_offset
            } else { 
                this_height = d.index*unit_height
            }
            return this_height
        })
}

