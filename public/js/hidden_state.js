var hidden_states = []
var HiddenState = function(layer, neuron, network) {
    this.layer = layer;
    this.neuron = neuron;
    this.y_offset = (neuron_height - unit_height)/2;
    this.y_position = this.y_offset + network_y_position + (neuron == 1 ? (neuron_height + inner_margin) : 0);
    this.x_offset = (neuron_width - unit_width)/2;
    this.value = 0;
    this.input_weight_set = _.find(weight_sets, {layer: this.layer, neuron: this.neuron, type: 'xw'})
    this.output_weight_set = _.find(weight_sets, {layer: this.layer, neuron: this.neuron, type: 'hy'})
    this.network = network;
    hidden_states.push(this)
}

HiddenState.prototype.add = function() {
    var neuron = d3.select("#" + this.network + "_neuron_L" + this.layer + "_i" + this.neuron)

    this.d3_unit = neuron.append('rect')
                    .attr('class', 'hidden_state unit')
                    .attr('id', css_identifier('hidden_state', this))
                    .attr('width', unit_width)
                    .attr('height', unit_height)
                    .attr('x', this.x_offset)
                    .attr('y', this.y_offset)

    memory_cell = new MemoryCell(this, neuron);
    memory_cell.add()
}

var vector_multiply = function(v1, v2) {
    // ASSERT EQUAL LENGTH
    sum = 0
    for (i = 0; i < v1.length; i ++) { sum += v1[i]*v2[i] }
    return sum
}
var notes_to_vector = function(notes) {
    return _.map(_.range(0, num_classes), function(i) {
        return _.contains(notes, i) ? 1 : 0
    })
}

HiddenState.prototype.update = function(delay = default_sub_iter_duration) {
    weights = this.input_weight_set.weights

    notes = notes_to_vector(current_iter_notes.inputs)
    update_value = Math.tanh(vector_multiply(notes, weights))

    this.value = update_value
    this.d3_unit.transition()
      .duration(default_sub_iter_duration)
      .delay(delay)
      .style('fill', hskolors(this.value))
    outlines = _.where(tlines, {source: this})

    outlines.forEach(function(line) {
        line.path.style('stroke', hskolors(update_value))
        line.marker.style('fill', hskolors(update_value))
    })

}