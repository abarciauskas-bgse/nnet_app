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

/* Initialize tooltip */
var data_point_tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
    return 'x1 = ' + Math.round(d.x1*100)/100 + ', x2 = ' + Math.round(d.x2*100)/100;
});
var outputs_tip = d3.tip().attr('class', 'd3-tip').html(function(d, i) {
    return Math.round(((i == 0) ? (1 - d) : d)*100)/100
});

var data_rect_tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
    switch (d.type) { 
        case 'x_start':
            label = 'data = '
            break;
        case 'x':
            label = 'data = '
            break;
        case 'w':
            label = 'weight = '
            break;
        case 'wx_start':
            label = 'data x weight = '
            break;
        case 'wx':
            label = 'sum = '
            break;
        case 'wxsum':
            label = 'signal = '
            break;
        default:
            label = ''
            break;
    }
    return label + Math.round(d.original*100)/100
})

/* Invoke the tip in the context of your visualization */
svg.call(data_point_tip)
svg.call(outputs_tip)
svg.call(data_rect_tip)

// LAYOUT VARS FOR whatisaneuron
var scale = 3// scale of data, -scale to scale
var transfer_multiply_height = unit_height
var transfer_addition_height = transfer_multiply_height*2
var transfer_multiply_xscale = d3.scale.linear()
    .range([0, transfer_multiply_height]);
var transfer_multiply_yscale = d3.scale.linear();
transfer_multiply_yscale.domain([-scale,scale]).nice(30);
transfer_multiply_yscale.range([-transfer_multiply_height/2, transfer_multiply_height/2])//.clamp(true);
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
    .attr('width', transfer_multiply_height - unit_width)
    .attr('height', transfer_multiply_height)

var transfer_multiply_group_2 = unit_sets[0].d3_group.append('svg:g')
    .attr('id', 'transfer_group_2')
    .attr('class', 'transfer_group_multiply')
    .attr('width', transfer_multiply_height - unit_width)
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
    .attr('height', transfer_multiply_height - transfer_multiply_yscale(1) - 2) // make room for stroke
    .attr('width', threshold_width)
neurons[0].group.append('svg:rect')
    .attr('id', 'threshold_bar_bottom')
    .attr('class', 'negative_region')
    .attr('x', threshold_offset-barwidth)
    .attr('y', threshold_top_offset + unit_height + 2) // make room for stroke
    .attr('height', transfer_multiply_height)
    .attr('width', threshold_width)

// DATA VARS
var eta = 1
var n = 100 // number of training points
var max_iters = 100
var max_step_time = 5000
var min_step_time = 1000
var time_scale = d3.scale.pow().exponent(-1/3).domain([1,1000]).range([max_step_time, min_step_time]);
var timeouts = [];
var current_iter = 1;

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
    .attr("transform", "translate(0," + plots_y_offset + ")")
var first_plot_position = $('#first_plot_group').position()
$('#plot-popover')
  .css('left', first_plot_position.left)
  .css('top', first_plot_position.top)
  .css('position', 'absolute')

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

var step_duration = sub_step_time
var play = function() {
    walkthru = true
    $('#walkthru-control').click()
    for (var iter = 0; iter < max_iters*n-n; iter++) {
        current_iter += 1
        step_duration = time_scale(current_iter)
        timeouts.push(
            setTimeout(function(i) {
                step_update(i)
            }, total_time, current_iter)
        );
        total_time += step_duration + 500 // half second pause between each step
    }
}

// Controls
var playing = false
var pause = function() {
    d3.selectAll("*").transition()
    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    //quick reset of the timer array you just cleared
    timeouts = []; 
    total_time = 0;     
}
d3.select('#play-button').on("click", function() {
    if (!playing) {
        playing = true
        $('#play-button').html('pause')
        play()
    } else {
        playing = false
        $('#play-button').html('play_arrow')
        pause()
    }
});

d3.select('#pause-button').on("click", function() {
    pause()      
});
d3.select("#step-button").on("click", function() {
    current_iter += 1
    step_update(current_iter)
})
// do more here to clear the data and regenerate it
d3.select('#refresh-button').on("click", function() {
    current_iter = 1;
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
$("#myModal").modal()

var info_modal = $('#myModal')

var ModalData = function(header, body, button_text, top, right) {
    this.header = header;
    this.body = body;
    this.button_text = button_text;
    this.top = top;
    this.right = right;
}

ModalData.prototype.show = function(delay = 300) {
    var modal_object = this;
    setTimeout(function() {
        $('#dialog-control').html('Close dialog');
        if (modal_object.header != null) { $('#info-header').html(modal_object.header) }
        if (modal_object.body != null) { $('#info-text').html(modal_object.body.toString()) }
        if (modal_object.button_text != null) { $('#whatisaneuron-action-button').html(modal_object.button_text) }
        info_modal.css('top', modal_object.top)
        info_modal.css('right', modal_object.right)
        info_modal.modal('show')
    }, delay)
}

var tmg_position = $('#' + transfer_multiply_group_1.attr('id')).position()
var info_modal_top_pos = tmg_position.top - unit_height

var pick_point_modal = new ModalData(
    'Training', 
    '<b>Click a point</b> to start training the network.',
    'Close',
    info_modal_top_pos, width - threshold_position)

var sub_step0_modal = new ModalData(
    'Great!', 
    'Step 1 of 5: The data is multiplied by a set of weights. <b>Click the weights</b> to sum the weighted inputs.',
    'Close',
    info_modal_top_pos, width - threshold_position)

var tag_position = $('#' + transfer_addition_group.attr('id')).position()
var sub_step2_modal = new ModalData(
    'Good work!', 
    'Step 2 of 5: The weighted inputs are summed to a single value. <b>Click the sum</b> to see the output of the neuron.',
    'Close',
    info_modal_top_pos, width - threshold_position)

var sub_step3_modal = new ModalData(
    'Cool!', 
    'Step 3 of 5: The threshold function outputs a value between <b>0</b> and <b>1</b>. <b>Click the threshold</b> to see the output.',
    'Close',
    info_modal_top_pos, width - threshold_position)

var whatisaneuron_pos = $('#whatisaneuron').position
var output_modal = new ModalData(
    'Almost there!',
    'Step 4 of 5: Hover over the bars to see the probability of each class, <b style="color:#E88923">orange</b> and <b style="color:#9F55E8">purple</b>. The output of the neuron is <b>our guess</b> of either color. <b>Click the guess</b> to see the true class.',
    'Close',
    info_modal_top_pos, width - whatisaneuron_pos.left)

var target_modal = new ModalData(
    'Done!',
    'Step 5 of 5: The difference between the probability of the class is used to update the weights to better fit the data. <b>Click the target</b> to finish.',
    'Close',
    info_modal_top_pos, width - whatisaneuron_pos.left)

var finished_walkthru_modal = new ModalData(
    'Congratulations!',
    'Congratulations! You just trained a neuron. <b>Pick another point</b>, <b>use the controls</b> to train on the rest of the data.',
    'Close',
    info_modal_top_pos, width - whatisaneuron_pos.left)

var help_modal = new ModalData(
    'Help',
    'Click the <b>controls</b> to train all the points or <b>click a point</b> in the first plot to train that point. If you\'re done with this page go to <a href="/whatisaneuralnetwork">What is a neural network?</a>',
    'Close',
    info_modal_top_pos, width/2)

var info_modal = new ModalData(
    'Learn more',
    'This is a single neuron which has been setup to take 2 inputs, x1 and x2 and learn what class (<b style="color:#E88923">orange</b> or <b style="color:#9F55E8">purple</b>) the data point belongs to. It does this by randomly initializing a set of weights, multiplying each data point by a set of values, transforming the sum into a probability and than evaluating the difference between the output and the target class.',
    'Close',
    info_modal_top_pos, width/2)

var walkthru_modal = new ModalData(
    'Walkthrough Mode',
    'You are currently in walk-through mode, clicking this icon toggles between walkthrough and looping modes.',
    'Close',
    187, width - 200)

var looping_modal = new ModalData(
    'Looping Mode',
    'You are currently in looping mode, clicking this icon toggles between walkthrough and looping modes.',
    'Close',
    187, width - 200)

var points_clicked = 0
var walkthru = true
var info_modal = $('#myModal')

$('#whatisaneuron-action-button').on('click', function() {
    setTimeout(function() {
        $('.modal-footer .btn.btn-success').removeClass('btn-success').addClass('btn-default')
    }, 200)
    if ($('#myModal').data().state == undefined) {
        pick_point_modal.show()
        $('#myModal').data('state', 'entered')
    }
});

$('#help-button').on('click', function() {
    help_modal.show()
})

$('#info-button').on('click', function() {
    info_modal.show()
})

$('#walkthru-control').on('click', function() {
    if (walkthru == true) {
        d3.selectAll('.multiply_bar').remove()
        d3.selectAll('.link').remove()
        d3.selectAll('.addition_link').remove()
        d3.selectAll('#threshold-poly').remove()        
        walkthru = false
        looping_modal.show()
        $('#walkthru-button').html('loop')
        $('#walkthru-button-text').html('Looping')
    } else {
        pause()
        walkthru = true
        walkthru_modal.show()
        $('#walkthru-button').html('directions_walk')
        $('#walkthru-button-text').html('Walkthrough')
    }
})

$('#dialog-control, button.close, #whatisaneuron-action-button').on('click', function() {
    live_dialog = $('#myModal').attr('class').indexOf('in') > 0;
    if (live_dialog) {
        $('#dialog-control').html('Open dialog');
    } else {
        $('#dialog-control').html('Close dialog');
    }
});

add_label_pointer('.whatisaneuron_unit_input_L0', '-3', 'bottom left', 12, unit_height*2-30, false, 12, 'svg')
add_label_pointer('.whatisaneuron_unit_input_L0', '3', 'bottom left', 12, unit_height-30, false, 12, 'svg')

