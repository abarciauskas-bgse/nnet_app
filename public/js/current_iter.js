// depends on global value current_iter
var CurrentIter = function(network, data) {
    this.network = network
    if (network == 'whatisaneuron') {
        current_iter_data = data.data_points[current_iter]
        // FIXME: format of generated data may draw bugs
        this.values = [current_iter_data.x1, current_iter_data.x2]
        this.weights = data.all_weights[current_iter]
    }
    obj = this
    this.xw = _.map(_.range(this.values.length), function(idx) { return obj.values[idx]*obj.weights[idx] })
    this.xw_sum = _.reduce(this.xw, function(memo, num) { return memo + num })
    this.xw_sum_thresh = 1/(1+Math.exp(-this.xw_sum))
}

CurrentIter.prototype.add_units = function(update = 'init') {
    if (this.network == 'whatisaneuron') {
        this.d3_group = whatisaneuron_layer0
        d3_group = this.d3_group
        y_position = unit_set_y_position
        weight_position = unit_width + transfer_width + 20
        mid_position = transfer_width + neuron_width/2;
        unit_data = [
            {type: 'x', data: this.values, x_pos: 0},
            {type: 'x_double', data: this.values, x_pos: 0},
            {type:'w', data: this.weights, x_pos: weight_position},
            {type: 'xw', data: this.xw, x_pos: weight_position},
            {type: 'xw_sum', data: [this.xw_sum], x_pos: mid_position},
            {type: 'xw_sum_thresh', data: [this.xw_sum_thresh], x_pos: mid_position}]
        _.each(unit_data, function(datum) {
            d3_group.selectAll('rect.' + datum.type + '_unit')
                .data(datum.data).enter().append('rect')
                .attr('class', datum.type + '_unit transit_unit')
                .attr('x', datum.x_pos)
                .attr('y', function(d, i) { return unit_height*i + y_position + unit_height/2 })
                .attr('height', 0)
                .attr('width', unit_width)
                .attr('stroke', '#333')
                .attr('visibility', 'hidden')
        })
    }
}
