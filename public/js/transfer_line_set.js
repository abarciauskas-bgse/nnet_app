var tl_sets = [];
var TransferLineSet = function(type, layer, neuron, network) {
    this.type = type;
    this.layer = layer;
    this.neuron = neuron;
    this.network = network;

    switch(type) {
        case 'xw':
            this.source = _.findWhere(unit_sets, {type: 'input', layer: layer})
            this.target = _.findWhere(weight_sets, {type: 'xw', layer: layer, neuron: neuron})
            break;
        case 'wxh':
            this.source = _.findWhere(weight_sets, {type: 'xw', layer: layer, neuron: neuron})
            this.target = _.findWhere(hidden_states, {layer: layer, neuron: neuron})
            break;
        case 'hh':
            this.source = _.findWhere(hidden_states, {layer: layer, neuron: neuron})
            this.target = _.findWhere(weight_sets, {type: 'hy', layer: layer, neuron: neuron})
            break;
        case 'hy':
            this.source = _.findWhere(weight_sets, {type: 'hy', layer: layer, neuron: neuron})
            this.target = _.findWhere(unit_sets, {type: 'output', layer: layer})
            break;
    }
    tl_sets.push(this)
}

TransferLineSet.prototype.x_offset = function() {
    var x_offset = null;
    switch(this.type) {
        case 'xw':
            x_offset = (this.layer == 0) ? unit_width : (layer_width + unit_width);
            break;
        case 'wxh':
            layer_wxh_offset = 2*unit_width + transfer_width + inner_margin;
            x_offset = (this.layer == 0) ? layer_wxh_offset : layer_width + layer_wxh_offset;
            break;
        case 'hh':
            layer_hh_offset = unit_width + transfer_width + neuron_width/2 + unit_width/2;
            x_offset = (this.layer == 0) ? layer_hh_offset : layer_width + layer_hh_offset;
            break;
        case 'hy':
            x_offset = (this.layer == 0) ? (transfer_width + neuron_width) : (layer_width + transfer_width + neuron_width);
            break;
    }
    return x_offset;
}

TransferLineSet.prototype.add = function() {
    // add a group with x offset
    group = layer_group(this, this.network).append('g')
               .attr('class', 'tl_set')
               .attr('id', css_identifier('tl_set', this))
               .attr('transform', 'translate(' + this.x_offset() + ',0)')
    this.d3_group = group;
    for (i = 0; i < num_classes; i++) {
        tline = new TransferLine(this.type, this.layer, this.neuron, this, i)
        tline.add()
    }
}
