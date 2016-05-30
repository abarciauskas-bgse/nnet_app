
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
