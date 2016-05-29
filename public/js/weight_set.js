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
    weight_sets.push(this)
}

WeightSet.prototype.x_offset = function() {
    return (this.type == 'xw') ? inner_margin : (neuron_width - inner_margin - unit_width)
}

WeightSet.prototype.add = function() {
    var neuron = d3.select("#" + this.network + "_neuron_L" + this.layer + "_i" + this.neuron)
    var weight_set = neuron.append('g')
                            .attr('class','weight_set')
                            .attr('id', css_identifier('weight_set', this))
                            .attr('transform', 'translate(' + this.x_offset() + ',' + this.y_offset + ')')
    this.d3_group = weight_set
    var layer = this.layer
    var type = this.type
    var neuron = this.neuron
    // DRY me with UnitSet#add
    weight_set.selectAll('rect')
        .data(d3.range(0,num_classes))
        .enter().append('rect')
            .attr('class', 'unit '
                + function(d, i) { return css_identifier('weight', this) })
            .attr('id', function(d, i) { return css_identifier('weight', this) })
            .attr('width', unit_width)
            .attr('height', unit_height)
            .attr('y', function(d, i) { return i*unit_height})
}


WeightSet.prototype.update_weights = function() {
    random_weights = _.map(_.range(0,num_classes), function() { return Math.random()*_.random(-1,1)})
    this.weights = random_weights
    this.d3_group.selectAll('rect')
        .transition().duration(default_sub_iter_duration)
        .style('fill', function(d,i) { return wkolors(random_weights[i]) })
}

