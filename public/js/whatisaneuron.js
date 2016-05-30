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

var sim_data = gen_data();
var current_iter_obj = new CurrentIter('whatisaneuron', sim_data)

add_network('whatisaneuron') // network - whatisaneuron, training or create
d3.select('#whatisaneuron').attr('transform', 'translate(' + layer_width/2 + ',0)')

var eta = 1
var n = 100 // number of training points
var scale = 3 // scale of data, -scale to scale
var max_iters = 100
var max_step_time = 5000
var min_step_time = 200
var time_scale = d3.scale.pow().exponent(-1/3).domain([1,1000]).range([max_step_time, min_step_time]);
var timeouts = [];
var current_iter = 0;
var transfer_multiply_height = unit_height
var transfer_addition_height = transfer_multiply_height*2
var transfer_multiply_xscale = d3.scale.linear()
    .range([0, transfer_multiply_height]);
var transfer_multiply_yscale = d3.scale.linear()
    .domain([-scale,0,scale])
    .range([-transfer_multiply_height/2, 0, transfer_multiply_height/2]);
var wtoffset = transfer_width + inner_margin + unit_width
var barwidth = unit_width
var unit_bar_height = transfer_multiply_yscale(1)
var addition_position = neuron_width/2 + transfer_width + unit_width
var threshold_position = neuron_width/2 - inner_margin

var transfer_multiply_group_1 = unit_sets[0].d3_group.append('svg:g')
    .attr('id', 'transfer_group_1')
    .attr('class', 'transfer_group_multiply')
    .attr('width', transfer_multiply_height)
    .attr('height', transfer_multiply_height)

var transfer_multiply_group_2 = unit_sets[0].d3_group.append('svg:g')
    .attr('id', 'transfer_group_2')
    .attr('class', 'transfer_group_multiply')
    .attr('width', transfer_multiply_height)
    .attr('height', transfer_multiply_height)
    .attr('transform', 'translate(0,' + unit_height + ')')

// The addition square
var transfer_addition_group = neurons[0].group.append('svg:g')
    .attr('id', 'transfer_addition_group')
    .attr('width', transfer_addition_height)
    .attr('height', transfer_addition_height)
    .attr('transform', "translate(" + (neuron_height/2+unit_width/2-1) + "," + inner_margin + ")")

// the threshold
var threshold_width = barwidth
var threshold_offset = neuron_width - inner_margin
var threshold_top_offset = inner_margin
neurons[0].group.append('svg:rect')
    .attr('id', 'threshold_bar_top')
    .attr('class', 'negative_region')
    .attr('x', threshold_offset-barwidth)
    .attr('y', threshold_top_offset)
    .attr('height', transfer_multiply_height - transfer_multiply_yscale(1))
    .attr('width', threshold_width)
neurons[0].group.append('svg:rect')
    .attr('id', 'threshold_bar_bottom')
    .attr('class', 'negative_region')
    .attr('x', threshold_offset-barwidth)
    .attr('y', threshold_top_offset + unit_height)
    .attr('height', transfer_multiply_height - threshold_top_offset)
    .attr('width', threshold_width)

transfer(current_iter_obj.values, current_iter_obj.weights)

