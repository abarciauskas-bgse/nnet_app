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

var song = new Song('/js/daft_punk-one_more_time.json', 'training')

// initial state stuff
if (!layer1_visible) {
    d3.select('#training_layer0').selectAll('*').style('visibility', 'hidden')
    d3.select('#training_layer1').attr('transform', 'translate(' + layer_width/2 + ',0)')
} else {
    d3.select('#training_unit_set_target_L0').attr('visibility','hidden')
}

var current_iter = 0
var current_iter_notes = []
$('#myModal').modal()
