// LAYOUT VARS FROM GLOBAL APP
var layer1_visible = false
var num_neurons = 1
var num_layers = 1
var num_classes = 2
var unit_height = (neuron_height - 2*inner_margin)/2
var unit_set_y_position = network_y_position + inner_margin
var whscale = d3.scale.linear().domain([0,scale]).range([0,unit_height/2])
var wkolors = d3.scale.ordinal().domain([-1,1]).range(['#444','#fefefe']);

// LAYOUT FOR GLOBAL APP
var svg = d3.select("#container").append("svg")
    .attr("width", width+2)
    .attr("height", height)
var whatisaneuron_group = svg.append('g')
    .attr('id', 'whatisaneuron')
var whatisaneuron_layer0 = whatisaneuron_group.append('g').attr('id', 'layer0')
add_network('whatisaneuron') // network - whatisaneuron, training or create
d3.select('#whatisaneuron').attr('transform', 'translate(' + layer_width/2 + ',0)')


// LAYOUT VARS FOR whatisaneuron
var scale = 3// scale of data, -scale to scale
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
var threshold_width = barwidth
var threshold_offset = neuron_width - inner_margin
var threshold_top_offset = inner_margin

// LAYOUT FOR THE NEURON'S THINGS
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
    .attr('height', transfer_multiply_height)
    .attr('width', threshold_width)

// DATA VARS
var eta = 1
var n = 100 // number of training points
var max_iters = 100
var max_step_time = 5000
var min_step_time = 200
var time_scale = d3.scale.pow().exponent(-1/3).domain([1,1000]).range([max_step_time, min_step_time]);
var timeouts = [];
var current_iter = 0;

var reset = function(update = false) {
    // Step 0: Simulate traning data
    var data = gen_data()

    losses_plot_group.selectAll('path').remove();
    // update plots
    draw_plot([0,plot_width], [0,plot_width], 'data', data.data_points, first_plot_group, 'dot dot-active', update ? true : false)
    draw_plot([0,plot_width], [0,plot_width], 'data', data.data_points, second_plot_group, 'dot', update ? true : false)
    draw_plot(loss_xrange, loss_yrange, 'loss', short_term_regrets, losses_plot_group, update ? true : false)

    second_plot_group.selectAll('.area').remove();

    return {
        data_points: data.data_points,
        all_weights: data.all_weights,
        short_term_regrets: data.short_term_regrets,
        long_term_regrets: data.long_term_regrets
    }
}

// PLOTS
var whatisaneuron_width = neuron_width + 3*unit_width + 2*transfer_width + inner_margin
var plot_width = whatisaneuron_width/3 - inner_margin*2
var plots_y_offset = neuron_height + 60
var first_plot_group = whatisaneuron_layer0.append("g")
    .attr("id", "first_plot_group")
    // add 28px to make room for axis
    // TODO: padding of 20 for padding from top - should be var
    .attr("transform", "translate(0," + plots_y_offset + ")")

// second plot should be on far right
var second_plot_group = whatisaneuron_layer0.append("g")
    .attr("id", "second_plot_group")
    .attr("transform", "translate(" + (plot_width+3*inner_margin) + "," + plots_y_offset + ")")

// LOSS PLOT
var loss_memory = 100
var short_term_regrets = new Array(loss_memory).fill(0.0)
var losses_plot_group = whatisaneuron_layer0.append("g")
    .attr("id", "losses_plot_group")
    .attr("transform", "translate(" + (2*plot_width+6*inner_margin) +"," + plots_y_offset + ")")
var loss_xrange = [0,plot_width]
var loss_yrange = [0,plot_width]
// xscale
var loss_xscale = d3.scale.linear().range([loss_xrange[0], loss_xrange[1]]);
// yscale
var loss_yscale = d3.scale.linear().range([loss_yrange[1], loss_yrange[0]]);

loss_xscale.domain([0, short_term_regrets.length]);
loss_yscale.domain([0, 1]);
var loss_line_function = d3.svg.line()
        .x(function(d, i) { return loss_xscale(i) })
        .y(function(d, i) { return loss_yscale(d) })

var play = function() {
    for (var iter = 0; iter < max_iters*n-n; iter++) {
        current_iter += 1
        step_duration = time_scale(current_iter)
        timeouts.push(
            setTimeout(function(i) {
                step_update(i)
            }, total_time, current_iter)
        );
        total_time += step_duration
    }
}

// Controls
d3.select('#play-button').on("click", function() {play()});
d3.select('#pause-button').on("click", function() {
    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    //quick reset of the timer array you just cleared
    timeouts = []; 
    total_time = 0;       
});
d3.select("#step-button").on("click", function() {
    current_iter += 1
    step_update(current_iter)
})
// do more here to clear the data and regenerate it
d3.select('#refresh-button').on("click", function() {
    current_iter = 0;
    new_data = reset(true);
    short_term_regrets = new_data.short_term_regrets;
    long_term_regrets = new_data.long_term_regrets;
    all_weights = new_data.all_weights;
    current_data = new_data.data_points;

    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }

    //quick reset of the timer array you just cleared
    timeouts = [];
    total_time = 0;     
});

var initial_data = reset();
var short_term_regrets = initial_data.short_term_regrets;
var long_term_regrets = initial_data.long_term_regrets;
var all_weights = initial_data.all_weights;
var current_data = initial_data.data_points;
var current_iter_obj = new CurrentIter('whatisaneuron', initial_data)
// INSTANTIATE GLOBAL VAR OF STEP - RESET IN THE STEP_UPDATE
var sub_step_time = 1000
var total_time = 0;
