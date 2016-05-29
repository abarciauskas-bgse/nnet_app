var unit_sets = []
var UnitSet = function(type, layer, network) {
    this.class = 'UnitSet';
    this.type = type;
    this.layer = layer;
    this.y_offset = unit_set_y_position;
    this.y_position = unit_set_y_position;
    this.network = network;
    this.values = _.map(_.range(0,num_classes), function(i) { return i*0 })
    unit_sets.push(this)
}

UnitSet.prototype.x_position = function() {
    var position = null;
    switch(this.type) {
        case 'input':
            // Not really sure about the second case, could be we use the output from layer 0
            position = (this.layer == 0) ? 0 : layer_width;
            break;
        case 'output':
            var layer_offset = unit_width + 2*transfer_width + neuron_width
            position = (this.layer == 0) ? layer_offset : (layer_width + layer_offset)
            break;
        case 'target':
            position = (this.layer == 0) ? (layer_width - unit_width) : (width - unit_width)
            break;
    }
    return position;
};


UnitSet.prototype.add = function() {
    group = layer_group(this, this.network).append("g")
        .attr("class", "unit_set")
        .attr("id", css_identifier('unit_set', this))
        .attr("transform", "translate(" + this.x_position() + "," + this.y_offset + ")")
    this.d3_group = group
    css_set_id = css_identifier('unit', this)
    group.selectAll('rect')
        .data(d3.range(0,num_classes))
        .enter().append('rect')
            .attr('class', 'unit')
            .attr('id', function(d, i) { return css_set_id + i })
            .attr('width', unit_width)
            .attr('height', unit_height)
            .attr('y', function(d, i) { return i*unit_height})
};
