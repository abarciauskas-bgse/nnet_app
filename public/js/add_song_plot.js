// Song Stuff
var add_song_plot = function(d3_group) {
    song_plot_group = d3_group.append("g")
        .attr("id", "song_plot_group")
        .attr("transform", "translate(0," + songs_bar_y_offset + ")")
    song_plot_yscale = d3.scale.linear().domain([0,num_classes]).range([0, song_plot_height])

    d3.range(0, num_classes).forEach(function(d) {
        song_plot_group.append("line")
            .attr("x1", 0)
            .attr("y1", song_plot_yscale(d))
            .attr("x2", width)
            .attr("y2", song_plot_yscale(d))
            .attr("stroke", light_grey)
    })
};
