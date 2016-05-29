var current_state = 'entered'
var playing = false
var two_layers_setup = false
$('#training-action-button').on('click', function() {
    current_iter_notes = iter_note_sets[current_iter]

    if (current_state == 'entered') {
        $('#info-text').html("The first step is to gather the training data and initialize random weights. Now we're ready to start training!")
        $('#training-action-button').html("First step: Input song")

        song.plot()

        weight_sets.forEach(function(set) {
            set.update_weights();
        })

        add_label_pointer(_.find(weight_sets, {layer: 0, type: 'xw', neuron: 0}).d3_group, 'input weights', 'top right')
        add_label_pointer(_.find(weight_sets, {layer: 1, type: 'xw', neuron: 0}).d3_group, 'input weights', 'top right')

        current_state = 'network_setup'
    } else if (current_state == 'network_setup') {
        $('#info-text').html("In the first iteration, the <b>input</b> is the first note and the <b>target</b> is the second note.")
        $('#training-action-button').html("Next Step")
        song.init_pointers()

        song.draw_song_unit_line('input', 'grow')
        song.draw_song_unit_line('target', 'grow')

        add_label_pointer(
            _.find(unit_sets, {layer: 0, type: 'input'}).d3_group, 'inputs', 'top right')
        add_label_pointer(
            _.find(unit_sets,
                {layer: (layer1_visible ? 1 : 0), type: 'target'}).d3_group,
                'targets',
                (layer1_visible ? 'top left' : 'bottom right'))

        sub_iter0()

        current_state = 'sub_iter0'
    } else if (current_state == 'sub_iter0') {
        $('#info-text').html("The input is multiplied by a set of weights.")
        xw_lines = _.where(tlines, {type: 'xw', layer: 0})
        xw_lines.forEach(function(tl) { return tl.grow() })
        sub_iter1()
        current_state = 'sub_iter1'
    } else if (current_state == 'sub_iter1') {
        $('#info-text').html("The weighted sum is then passed to the \"memory\" cell. This is the <b>magic of a recurrent neural network.</b>")
        wxh_lines = _.where(tlines, {type: 'wxh', layer: 0})
        wxh_lines.forEach(function(tl) {
            memory_cells_open_close('left', 0)
            tl.grow()
        })
        add_label_pointer(_.find(memory_cells, {layer: 0}).d3_group, 'memory', 'top right')
        sub_iter2()
        current_state = 'sub_iter2'
    } else if (current_state == 'sub_iter2') {
        $('#info-text').html("The memory cell stores the information in the <b>hidden state</b> which can be recalled on the next iteration.")
        hh_lines = _.where(tlines, {type: 'hh', layer: 0})
        hh_lines.forEach(function(tl) {
            memory_cells_open_close('right', 0)
            tl.grow()
            // only needs to happen once
            tl.path.transition().duration(default_sub_iter_duration)
              .delay(default_sub_iter_duration)
              .attr('class', 'flowline')
        })
        add_label_pointer(_.find(weight_sets, {layer: 0, neuron: 0, type: 'hy'}).d3_group, 'output weights', 'top right')
        sub_iter3()
        current_state = 'sub_iter3'
    } else if (current_state == 'sub_iter3') {
        $('#info-text').html("Finally, the hidden state is multiplied by an output set of weights, which formulates the probability of each note following the current note.")

        hy_lines = _.where(tlines, {type: 'hy', layer: 0})
        hy_lines.forEach(function(tl) {
            tl.grow()
        })
        add_label_pointer(_.find(unit_sets, {type: 'output', layer: 0}).d3_group, 'outputs', 'top')
        sub_iter4()
        current_state = 'sub_iter4'
    // branching: either we are done setting up the first layer and there's nothing else to do
    // or we need to setup the second layer   
    } else if (current_state == 'sub_iter4' && (!layer1_visible || two_layers_setup)) {
        $('#info-text').html("We calculate how wrong our guess was and update the weights. (ADD ME: VISUALIZE")
        $('#training-action-button').html("Update weights")

        current_state = 'backpropagate'
    } else if (current_state == 'sub_iter4' && layer1_visible && !two_layers_setup) {
        $('#info-text').html("The output of the first layer comes the input to the second layer.")
        // update the input for layer 1 using the output from layer 0
        update_units(1, 'input')
        $('#training-action-button').html("Next Layer")
        current_state = 'next layer'
    } else if (current_state == 'next layer') {
        $('#info-text').html("The second layer works just like the first.")

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
        $('#info-text').html("Now that we see how the network is working, let's train on the full song!")
        $('#training-action-button').html("Train all")

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
