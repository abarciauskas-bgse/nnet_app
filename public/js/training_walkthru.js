var current_state = 'entered'
var playing = false
var two_layers_setup = false

var timeouts = [];
var play = function() {
    playing = true
    for (i = 1; i < (song.sequence_length-current_iter); i++) {
        timeouts.push(setTimeout(function(){
            iter();
        }, i*default_sub_iter_duration));
    }
    // restart
    timeouts.push(setTimeout(function() {
        current_iter = 0;
        current_iter_notes = iter_note_sets[current_iter]
        play();
    }, (song.sequence_length-current_iter)*default_sub_iter_duration))
    current_state = 'playing'    
}

var grow_all_layer1_lines = function() {
    xw_lines = _.where(tlines, {type: 'xw', layer: 1})
    xw_lines.forEach(function(tl) { return tl.grow() })

    wxh_lines = _.where(tlines, {type: 'wxh', layer: 1})
    wxh_lines.forEach(function(tl) {
        memory_cells_open_close('left', 1)
        tl.grow()
    })

    hh_lines = _.where(tlines, {type: 'hh', layer: 1})
    hh_lines.forEach(function(tl) {
        memory_cells_open_close('right', 1)
        tl.grow()
        // only needs to happen once
        tl.path.transition().duration(default_sub_iter_duration)
          .delay(default_sub_iter_duration)
          .attr('class', 'flowline')
    })

    hy_lines = _.where(tlines, {type: 'hy', layer: 1})
    hy_lines.forEach(function(tl) {
        tl.grow()
    })    
}

var add_weights = function() {
    var wts_1_id = '#' + _.find(weight_sets, {layer: 0, type: 'xw', neuron: 0}).d3_group.attr('id')
    var wts_2_id = '#' + _.find(weight_sets, {layer: 1, type: 'xw', neuron: 0}).d3_group.attr('id')

    weight_sets.forEach(function(set) {
        set.update_weights();
    })
    add_label_pointer(wts_1_id, 'input weights', 'top right')     
}

var plot_song = function() {
    song.plot()
    song.init_pointers()
    song.shift(current_iter)         
}

var song_setup = function() {
    song.draw_song_unit_line('input', 'grow')
    song.draw_song_unit_line('target', 'grow')
    units_1_id = '#' + _.find(unit_sets, {layer: 0, type: 'input'}).d3_group.attr('id')
    units_2_id = '#' + _.find(unit_sets, {layer: (layer1_visible ? 1 : 0), type: 'target'}).d3_group.attr('id')
    add_label_pointer(units_1_id, 'inputs', 'top right', 0, -unit_width)
    add_label_pointer(units_2_id, 'targets', 'top left', -unit_width/2, -unit_width) 
    d3.selectAll('.song_plot_unit').each(function(d) {
        d3.select(this).on('mouseover', notes_tip.show)
        d3.select(this).on('mouseleave', notes_tip.hide)
    })
}

var setup_xw_lines = function() {
    xw_lines = _.where(tlines, {type: 'xw', layer: 0})
    xw_lines.forEach(function(tl) { return tl.grow() })    
}

var setup_wh_lines = function() {
    wxh_lines = _.where(tlines, {type: 'wxh', layer: 0})
    wxh_lines.forEach(function(tl) {
        memory_cells_open_close('left', 0)
        tl.grow()
    })
    memory_id = '.' + _.find(memory_cells, {layer: 0}).d3_group.attr('class')
    add_label_pointer(memory_id, 'memory', 'top right', +unit_width, -unit_width)    
}

var setup_hh_lines = function() {
    hh_lines = _.where(tlines, {type: 'hh', layer: 0})
    hh_lines.forEach(function(tl) {
        memory_cells_open_close('right', 0)
        tl.grow()
        // only needs to happen once
        tl.path.transition().duration(default_sub_iter_duration)
          .delay(default_sub_iter_duration)
          .attr('class', 'flowline')
    })
    wt_set_id = '#' + _.find(weight_sets, {layer: 0, neuron: 0, type: 'hy'}).d3_group.attr('id')
    add_label_pointer(wt_set_id, 'output weights', 'top right', 0, -unit_width)    
}

var setup_hy_lines = function() {
    hy_lines = _.where(tlines, {type: 'hy', layer: 0})
    hy_lines.forEach(function(tl) {
        tl.grow()
    })
    unit_set_id = '#' + _.find(unit_sets, {type: 'output', layer: 0}).d3_group.attr('id')
    add_label_pointer(unit_set_id, 'outputs', 'bottom', -unit_width/2, num_classes*unit_height + unit_height/2)    
}
var instant_setup = function() {
    var info_modal = $('#myModal')
    var svg_position = $('svg').position() 
    add_weights()  
    plot_song()
    song_setup()
    setup_xw_lines()
    setup_wh_lines()
    setup_hh_lines()
    setup_hy_lines()
    play()
}

$('#training-action-button').on('click', function() {
    current_iter_notes = iter_note_sets[current_iter]
    var info_modal = $('#myModal')
    var svg_position = $('svg').position()

    if (current_state == 'entered') {
        setTimeout(function() {
            $('.modal-dialog').addClass('modal-sm')
            $('#info-header').html('Network setup')
            $('#info-text').html("First, we will randomly set network weights.\nDuring training, the network learns weights from the data.")
            $('#training-action-button').html("Initialize weights")
            info_modal.css('top', svg_position.top)
            info_modal.css('right', width/2 - inner_margin - unit_width*2)
            info_modal.modal('show')
        }, 200)

        current_state = 'add_weights'       
    } else if (current_state == 'add_weights') {
        add_weights()

        setTimeout(function() {
            $('#info-text').html("Next, we input a song into the network.")
            $('#training-action-button').html("Input song")
            info_modal.css('top', $('#song_plot_group').position().top - svg_position.top - 1.5*song_plot_height)
            info_modal.css('right', width-200)
            info_modal.modal('show')
        }, 200)

        current_state = 'ready_to_train'
    } else if (current_state == 'ready_to_train') {
        setTimeout(function() {
            $('#info-header').html('Ready to train')
            $('#info-text').html("Now we're ready to start training!")
            $('#training-action-button').html("Start training")
            info_modal.css('top', '300px')
            info_modal.css('right', '0px')
            info_modal.modal('show')
        }, 200)

        plot_song()
     
        current_state = 'network_setup'
    } else if (current_state == 'network_setup') {
        sub_iter0()
        song_setup()

        setTimeout(function() {
            $('#info-header').html('Training')
            $('#info-text').html("In the first iteration, the <b>input</b> is the first note and the <b>target</b> is the second note.")
            $('#training-action-button').html("Next step")
            info_modal.css('top', '300px')
            info_modal.css('right', 0)
            info_modal.modal('show')
        }, 200)
        current_state = 'sub_iter0'
    } else if (current_state == 'sub_iter0') {
        setup_xw_lines()
        sub_iter1()

        setTimeout(function() {
            $('#info-text').html("The input is multiplied by the first set of weights.")
            info_modal.css('top', svg_position.top + 10)
            info_modal.css('right', 834)
            info_modal.modal('show')
        }, 200)

        current_state = 'sub_iter1'
    } else if (current_state == 'sub_iter1') {
        setup_wh_lines()
        sub_iter2()

        setTimeout(function() {
            $('#info-text').html("The weighted sum is then passed to the memory cell.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width-200)
            info_modal.modal('show')
        }, 200)  

        current_state = 'sub_iter2'
    } else if (current_state == 'sub_iter2') {
        setup_hh_lines()
        sub_iter3()

        setTimeout(function() {
            $('#info-text').html("The memory cell stores the information in a <b>hidden state</b> which is recalled on the next iteration.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width-200)
            info_modal.modal('show')
        }, 200) 

        current_state = 'sub_iter3'
    } else if (current_state == 'sub_iter3') {
        $('#info-text').html("Finally, the hidden state is multiplied by an output set of weights, which formulates the probability of each note following the current note.")

        setup_hy_lines()
        sub_iter4()
        current_state = 'sub_iter4'

        setTimeout(function() {
            $('#info-text').html("The hidden state is multiplied by output weights. This is the output of the first layer.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width-200)
            info_modal.modal('show')
        }, 200)

        current_state = 'sub_iter4'  
    // branching: either we are done setting up the first layer and there's nothing else to do
    // or we need to setup the second layer   
    } else if (current_state == 'sub_iter4' && (!layer1_visible || two_layers_setup)) {
        setTimeout(function() {
            $('#info-text').html("The difference between our guess and the truth is used to nudge the weights to better fit the data.")
            $('#training-action-button').html("Update weights")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width/2-200)
            info_modal.modal('show')
        }, 200)

        current_state = 'backpropagate'
    } else if (current_state == 'sub_iter4' && layer1_visible && !two_layers_setup) {
        // update the input for layer 1 using the output from layer 0
        update_units(1, 'input')

        setTimeout(function() {
            $('#info-text').html("The output of the first layer becomes the input to the second layer.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width/2-200)
            info_modal.modal('show')
        }, 200)

        current_state = 'next layer'
    } else if (current_state == 'next layer') {
        setTimeout(function() {
            $('#info-text').html("And the second layer works just like the first.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width/2-200)
            info_modal.modal('show')
        }, 200)

        grow_all_layer1_lines()
        sub_iter1(1)
        sub_iter2(1)
        //nothing to be done here
        sub_iter3()
        sub_iter4(1)

        two_layers_setup = true
        current_state = 'sub_iter4'
    } else if (current_state == 'backpropagate') {
        // reverse lines
        weight_lines().forEach(function(line, i) {
            reversed_line_data = line.line_data.reverse()
            reversed_line_data = _.map(reversed_line_data, function(ld) { return [ld[0]+5, ld[1]] })
            line.path.transition().duration(default_sub_iter_duration)
                .attr('d', line_function(reversed_line_data))
        })
        weight_sets.forEach(function(set) {
            set.update_weights();
        }) 
        setTimeout(function() {
            $('#info-text').html("Now that we see how the network is working, let's train on the full song!")
            $('#training-action-button').html("Train network!")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width/2-200)
            info_modal.modal('show')
        }, default_sub_iter_duration)                    
        current_state = 'train all'
        music_playing = true
        MIDIjs.play('/js/daft_punk-one_more_time.mid')
        $('#stopplay-button i').html('stop')
        $('#stopplay-button b').html('Stop')
    } else if (current_state == 'train all') {
        // re-reverse lines
        weight_lines().forEach(function(line, i) {
            line.path.transition().duration(default_sub_iter_duration)
                .attr('d', line_function(line.line_data.reverse()))
        })
        play()
        network_running = true
        current_state = 'playing'
    }
})
