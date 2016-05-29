var neurons = []
Neuron = function(layer, index, network) {
    this.layer = layer;
    this.index = index;
    this.height = neuron_height;
    this.width = neuron_width
    this.network = network;
    neurons.push(this)
}

Neuron.prototype.y_position = function() {
    return (this.index == 0) ? network_y_position : (network_y_position + neuron_height + inner_margin)
}

var neuron_x_offset = unit_width + transfer_width
Neuron.prototype.x_position = function() {
    return (this.layer == 0) ? neuron_x_offset : (layer_width + neuron_x_offset)
}

Neuron.prototype.add = function() {
    this.group = layer_group(this, this.network).append("g")
        .attr("class", "neuron")
        .attr("id", css_identifier("neuron", this))
        .attr("transform", "translate(" + this.x_position() + "," + this.y_position() + ")") 
    this.group.append('rect')
        .attr('class', 'neuron_container')
        .attr('width', neuron_width)
        .attr('height', neuron_height)
        .attr('fill', 'white')
        .attr('stroke', medium_grey)
}
