var sub_iter0 = function() {
    song.shift(current_iter)
    color_units('input', 0)
    color_units('target', layer1_visible ? 1 : 0)
}

// FIXME: Not dry with sub_iter2
var sub_iter1 = function(layer = 0) {
    xw_lines = _.where(tlines, {type: 'xw', layer: layer})
    output_units_layer0 = _.where(unit_sets, {layer: 0, type: 'output'})[0]

    xw_lines.forEach(function(tl) {
        tl.activated = _.contains(current_iter_notes.inputs, tl.index) || (layer == 1)
        tl.path.transition()
            .duration(default_sub_iter_duration)
            // has to grow first
            .delay(playing ? 0 : default_sub_iter_duration)
            .style('stroke', (tl.activated) ? kolors(tl.index) : light_grey)
            .style('stroke-opacity', (layer == 1) ? Math.max(0.15, output_units_layer0.values[tl.index]) : 1)
            .style('stroke-width', tl.activated ? 2 : 1)
            .style('animation', tl.activated ? 'flow 2s linear infinite' : '')
            .style('-webkit-animation', tl.activated ? 'flow 2s linear infinite' : '')                        
        tl.marker
            .transition()
            .duration(default_sub_iter_duration)
            .delay(playing ? 0 : default_sub_iter_duration)
            .style('fill', (tl.activated) ? kolors(tl.index) : light_grey)
            .style('fill-opacity', (layer == 1) ? Math.max(0.15, output_units_layer0.values[tl.index]) : 1)
    })    
}

var sub_iter2 = function(layer = 0) {
    wxh_lines = _.where(tlines, {type: 'wxh', layer: layer})
    wxh_lines.forEach(function(tl) { 
        tl.activated = _.contains(current_iter_notes.inputs, tl.index) || (layer == 1)
        // turn on flowlines not already active
        tl.path.transition()
          .duration(default_sub_iter_duration)
          // has to grow first
          .delay(playing ? 0 : default_sub_iter_duration)
          .style('stroke', (tl.activated) ? kolors(tl.index) : light_grey)
          .style('opacity', Math.max(0.5, Math.abs(tl.source.weights[tl.index])))
          .style('stroke-width', tl.activated ? 2 : 1)
          .style('animation', tl.activated ? 'flow 2s linear infinite' : '')
          .style('-webkit-animation', tl.activated ? 'flow 2s linear infinite' : '')
        tl.marker.transition()
          .duration(default_sub_iter_duration)
          .delay(playing ? 0 : default_sub_iter_duration)
          .style('fill', (tl.activated) ? kolors(tl.index) : light_grey)
          .style('opacity', Math.max(0.5, Math.abs(tl.source.weights[tl.index])))
    })
    _.where(hidden_states, {layer: layer}).forEach(function(hs) {
        hs.update(default_sub_iter_duration)
    })
}

//updating of the lines is done in hs.update()        
var sub_iter3 = function() {}

var sub_iter4 = function(layer = 0) {
    hy_lines = _.where(tlines, {type: 'hy', layer: layer})
    hy_lines.forEach(function(tl) {
        weight = tl.source.weights[tl.index]
        hidden_state = _.find(hidden_states, {layer: tl.layer, neuron: tl.neuron})
        prob = weight*hidden_state.value
        tl.value = prob
        tl.path.transition()
            .duration(default_sub_iter_duration)
            .delay(playing ? 0 : default_sub_iter_duration)
            .attr('class', 'flowline')
        tl.path.attr('stroke', wkolors(prob))
        tl.marker.style('fill', wkolors(prob))
    })
    // fill in output units
    if (layer == 0) { update_units(0, 'output') }
    if (layer == 1) { update_units(1, 'output') }
}

var iter = function() {
    current_iter += 1
    current_iter_notes = iter_note_sets[current_iter]
    weight_sets.forEach(function(set) {
        set.update_weights();
    })    
    sub_iter0()
    sub_iter1()
    sub_iter2()
    sub_iter3()
    sub_iter4()
    // maybe we can do this anyways?
    if (layer1_visible) {
        update_units(1, 'input')
        sub_iter1(1)
        sub_iter2(1)
        //sub_iter3()
        sub_iter4(1)
    }
}
