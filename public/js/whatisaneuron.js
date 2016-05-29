var svg = d3.select("#container").append("svg")       
    .attr("width", width+2)
    .attr("height", height)

var layer1_visible = false
var num_neurons = 1
var num_layers = 1
var num_classes = 2
var unit_height = (neuron_height - 2*inner_margin)/2
var unit_set_y_position = network_y_position + inner_margin
var whscale = d3.scale.linear().domain([0,scale]).range([0,unit_height/2])
var wkolors = d3.scale.ordinal().domain([-1,1]).range(['#444','#fefefe']);

// training setup
var whatisaneuron_group = svg.append('g')
    .attr('id', 'whatisaneuron')
var whatisaneuron_layer0 = whatisaneuron_group.append('g').attr('id', 'layer0')
var whatisaneuron_layer1 = whatisaneuron_group.append('g').attr('id', 'layer1')

add_network('whatisaneuron') // network - whatisaneuron, training or create
d3.select('#whatisaneuron').attr('transform', 'translate(' + layer_width/2 + ',0)')

var sim_data = gen_data();

var step = function() {
    unit_sets[0].update_values()
    weight_sets[0].update_weights()
    tlines.forEach(function(line) { return line.grow() })
}

step();
