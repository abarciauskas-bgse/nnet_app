var svg = d3.select("#container").append("svg")       
    .attr("width", width+2)
    .attr("height", height)

// training setup
var training_group = svg.append('g')
    .attr('id', 'training')
var training_layer0 = training_group.append('g').attr('id', 'layer0')
var training_layer1 = training_group.append('g').attr('id', 'layer1')

add_network('training') // network - training or create
add_song_plot(training_group)

var song = new Song('/js/daft_punk-one_more_time.json', 'Daft Punk', 'One More Time', 'training')

// initial state stuff
var toggle_layer = function() {
    if (layer1_visible) {
        layer1_visible = false
        d3.select('#training_unit_set_target_L0').attr('visibility','visible')
        d3.select('#layer1').style('display', 'none')
        d3.select('#layer0').attr('transform', 'translate(' + layer_width/2 + ',0)')
        if (song.song_unit_path != undefined) {
            song.draw_song_unit_line('input', 'grow')
            song.draw_song_unit_line('target', 'grow')
        }
        if (playing) {
            d3.select('#targets_label').remove()
            units_2_id = '#' + _.find(unit_sets, {layer: 0, type: 'target'}).d3_group.attr('id')
            add_label_pointer(units_2_id, 'targets', 'top left', -unit_width/2, 0)        
        }
    } else {
        layer1_visible = true
        d3.select('#training_unit_set_target_L0').attr('visibility','hidden')
        d3.select('#layer1').style('display', 'block')
        d3.select('#layer0').attr('transform', 'translate(0,0)')
        if (song.song_unit_path != undefined) {
            song.draw_song_unit_line('input', 'grow')
            song.draw_song_unit_line('target', 'grow')
        }
        if (playing) {
            pause()
            grow_all_layer1_lines()
            setTimeout(function() { play() }, default_sub_iter_duration+100)
            d3.select('#targets_label').remove()
            units_2_id = '#' + _.find(unit_sets, {layer: 1, type: 'target'}).d3_group.attr('id')
            add_label_pointer(units_2_id, 'targets', 'top left', -unit_width/2, 0)
        }
    }
}
toggle_layer()
toggle_layer()

var current_iter = 0
var current_iter_notes = []
$('#myModal').modal()

$('#add-layer').on('click', function() {
    toggle_layer()
})

$('#refresh-button').on('click', function() {
    if (playing) {
        pause()
        current_iter = 0
        play()
    }
})

var notes_tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
    var note_i = (d.index == undefined) ? d.note : d.index
    return notes_values[note_i];
});

svg.call(notes_tip)

d3.selectAll('.training_unit_input_L0').each(function(d) {
    d3.select(this).on('mouseover', notes_tip.show)
    d3.select(this).on('mouseleave', notes_tip.hide)
})
