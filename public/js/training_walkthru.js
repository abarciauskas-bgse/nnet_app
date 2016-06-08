var current_state = 'entered'
var playing = false
var two_layers_setup = false
$('#training-action-button').on('click', function() {
    current_iter_notes = iter_note_sets[current_iter]
    var info_modal = $('#myModal')
    var svg_position = $('svg').position()
    var wts_1_id = '#' + _.find(weight_sets, {layer: 0, type: 'xw', neuron: 0}).d3_group.attr('id')
    var wts_2_id = '#' + _.find(weight_sets, {layer: 1, type: 'xw', neuron: 0}).d3_group.attr('id')

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
        weight_sets.forEach(function(set) {
            set.update_weights();
        })
        add_label_pointer(wts_1_id, 'input weights', 'top right')
        add_label_pointer(wts_2_id, 'input weights', 'top right') 

        setTimeout(function() {
            $('#info-text').html("Next, we input a song into the network.")
            $('#training-action-button').html("Input song")
            info_modal.css('top', $('#song_plot_group').position().top - svg_position.top - song_plot_height)
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
        }, default_sub_iter_duration)
        song.plot()
        song.init_pointers()
        song.shift(current_iter)       
        current_state = 'network_setup'
    } else if (current_state == 'network_setup') {
        sub_iter0()
        song.draw_song_unit_line('input', 'grow')
        song.draw_song_unit_line('target', 'grow')
        units_1_id = '#' + _.find(unit_sets, {layer: 0, type: 'input'}).d3_group.attr('id')
        units_2_id = '#' + _.find(unit_sets, {layer: (layer1_visible ? 1 : 0), type: 'target'}).d3_group.attr('id')
        add_label_pointer(units_1_id, 'inputs', 'top right')
        add_label_pointer(units_2_id, 'targets', (layer1_visible ? 'top left' : 'bottom right'))

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
        $('#info-text').html("The input is multiplied by a set of weights.")
        xw_lines = _.where(tlines, {type: 'xw', layer: 0})
        xw_lines.forEach(function(tl) { return tl.grow() })
        sub_iter1()

        setTimeout(function() {
            $('#info-text').html("The input is multiplied by the first set of weights.")
            info_modal.css('top', svg_position.top + 10)
            info_modal.css('right', width/2 - inner_margin - unit_width*2)
            info_modal.modal('show')
        }, 200)

        current_state = 'sub_iter1'
    } else if (current_state == 'sub_iter1') {
        wxh_lines = _.where(tlines, {type: 'wxh', layer: 0})
        wxh_lines.forEach(function(tl) {
            memory_cells_open_close('left', 0)
            tl.grow()
        })
        memory_id = '.' + _.find(memory_cells, {layer: 0}).d3_group.attr('class')
        add_label_pointer(memory_id, 'memory', 'top left')
        sub_iter2()

        setTimeout(function() {
            $('#info-text').html("The weighted sum is then passed to the memory cell.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width-200)
            info_modal.modal('show')
        }, 200)  

        current_state = 'sub_iter2'
    } else if (current_state == 'sub_iter2') {
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
        add_label_pointer(wt_set_id, 'output weights', 'top right')
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

        hy_lines = _.where(tlines, {type: 'hy', layer: 0})
        hy_lines.forEach(function(tl) {
            tl.grow()
        })
        unit_set_id = '#' + _.find(unit_sets, {type: 'output', layer: 0}).d3_group.attr('id')
        add_label_pointer(unit_set_id, 'outputs', 'top right')
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
        }, default_sub_iter_duration)

        current_state = 'backpropagate'
    } else if (current_state == 'sub_iter4' && layer1_visible && !two_layers_setup) {
        // update the input for layer 1 using the output from layer 0
        update_units(1, 'input')

        setTimeout(function() {
            $('#info-text').html("The output of the first layer becomes the input to the second layer.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width/2-200)
            info_modal.modal('show')
        }, default_sub_iter_duration)

        current_state = 'next layer'
    } else if (current_state == 'next layer') {
        setTimeout(function() {
            $('#info-text').html("And the second layer works just like the first.")
            info_modal.css('top', svg_position.top + neuron_height/2 + 2*unit_width)
            info_modal.css('right', width/2-200)
            info_modal.modal('show')
        }, default_sub_iter_duration)

        xw_lines = _.where(tlines, {type: 'xw', layer: 1})
        xw_lines.forEach(function(tl) { return tl.grow() })
        sub_iter1(1)

        wxh_lines = _.where(tlines, {type: 'wxh', layer: 1})
        wxh_lines.forEach(function(tl) {
            memory_cells_open_close('left', 1)
            tl.grow()
        })
        sub_iter2(1)

        hh_lines = _.where(tlines, {type: 'hh', layer: 1})
        hh_lines.forEach(function(tl) {
            memory_cells_open_close('right', 1)
            tl.grow()
            // only needs to happen once
            tl.path.transition().duration(default_sub_iter_duration)
              .delay(default_sub_iter_duration)
              .attr('class', 'flowline')
        })
        // nothing to be done here
        sub_iter3()

        hy_lines = _.where(tlines, {type: 'hy', layer: 1})
        hy_lines.forEach(function(tl) {
            tl.grow()
        })
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
    } else if (current_state == 'train all') {
        // re-reverse lines
        playing = true
        weight_lines().forEach(function(line, i) {
            line.path.transition().duration(default_sub_iter_duration)
                .attr('d', line_function(line.line_data.reverse()))
        })
        for (i = 1; i < song.sequence_length-1; i++) {
            // nothing is done in sub_iter 3 so though we have 5 sub iterations we only care about 4 of them
            setTimeout(function(){ iter(); }, i*default_sub_iter_duration);
        }
        current_state = 'playing'
    }
})
