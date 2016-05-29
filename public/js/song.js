var Song = function(filename, network) {
    this.filename = filename;
    this.song_data = null;
    this.sequence_length = null;
    this.note_width = null;
    this.song_input_unit_path = null;
    this.song_target_unit_path = null;
    this.d3_notes = null;
    this.network = network;
    
    // function plot_song(song)
    var song = this
    d3.json(filename, function(data) {
        song.raw_song_data = data;
        song.song_data = []
        data.forEach(function(notes, i) {
            notes.forEach(function(note){
                song.song_data.push({note: note, seq_idx: i})
            })
        })
        song.sequence_length = data.length;
        song.note_width = song_plot_width/song.sequence_length + 0.5 // width of each note plotted (e.g. 16th note)

        // for every index in the total sequence, add an iter_note_set
        data.forEach(function(notes, i) {
            iter_note_set = new IterNoteSet(song, notes, data[i+1], i)
        })
    })
}

Song.prototype.plot = function() {
    // scale from width of plot to seq length
    var xscale = d3.scale.linear().domain([0, this.sequence_length]).range([0, song_plot_width]);

    this.d3_notes = song_plot_group.selectAll('rect')
                        .data(this.song_data).enter()
                          .append('rect').attr('class', 'song_plot_unit')
                          .attr('x', function(d,i) { return xscale(d.seq_idx) + song_plot_width + 2 })
                          .attr('y', function(d) { return song_plot_yscale(d.note) })
                          .attr('height', song_plot_note_height)
                          .attr('width', this.note_width)
                          .attr('fill', function(d) { return kolors(d.note) })
}

Song.prototype.shift = function(iter_index, duration = default_sub_iter_duration) {
    var xscale = d3.scale.linear().domain([0, this.sequence_length]).range([0, song_plot_width]);
    this.d3_notes.transition()
         .duration(duration)
         .attr('x', function(d) {
            return xscale(d.seq_idx) + width/2 - xscale(iter_index)
        })
}

Song.prototype.draw_song_unit_line = function(type, state, duration = default_sub_iter_duration) {
    // draw lines from song to input or target
    note_offset = (type == 'input' ? 0 : this.note_width) + song_plot_width/2
    song_x = note_offset + this.note_width/2
    // FIXME: wacky conditional
    target_x = (layer1_visible ? 0 : layer_width/2) 
        + (type == 'input' ? unit_width/2 : (layer_width - unit_width/2))
        + ((type == 'target' && layer1_visible) ? layer_width : 0)
    song_y = height - song_plot_height
    target_y = unit_set_y_position + weight_set_height

    if (state == 'grow') {
        line_data = [
            [song_x, song_y],
            [song_x, song_y - (song_y - target_y)/4],
            [target_x, song_y - 3*(song_y - target_y)/4],
            [target_x, target_y + 6] // plus 6 for the arrow
        ]
        if (type == 'input') {
            this.song_unit_path.transition()
                .duration(duration).attr('d', line_function(line_data))
                .attr('class', 'flowline')        
        } else {
            this.song_target_unit_path.transition()
                .duration(duration).attr('d', line_function(line_data))
                .attr('class', 'flowline')
        }

    } else if (state == 'init') {
        marker_id = css_identifier('marker', this)
        add_marker(marker_id)
        line_data = [
            [song_x, song_y],
            [song_x, song_y],
            [song_x, song_y],
            [song_x, song_y]
        ]
        path = training_group.append('path')
            .attr("d", line_function(line_data))
            .attr('class', 'link')
            .attr("stroke", medium_grey)
            .attr('fill', 'none')
            .attr("marker-end", "url(#" + marker_id + ")"); 
        if (type == 'input') {
            this.song_unit_path = path
        } else {
            this.song_target_unit_path = path
        }
    }    
}

var ascender_height = 6,
    descender_height = 1
Song.prototype.init_pointers = function() {
    pointers = ['t', 'between','tplus1']
    song = this
    pointers.forEach(function(pointer_type) {
        var x1 = 1,
            x2 = 1
        if (pointer_type == 'between') {
            x1 = song.note_width
            x2 = song.note_width
        } else if (pointer_type == 'tplus1') {
            x1 = 2*song.note_width
            x2 = 2*song.note_width
        }
        song_plot_group.append('line')
          .attr('class', 'song_bar_pointer')
          .attr('id', 'song_bar_' + pointer_type + '_pointer')
          .attr('x1', x1 + song_plot_width/2)
          .attr('y1', song_plot_height + descender_height)
          .attr('x2', x2 + song_plot_width/2)
          .attr('y2', -ascender_height)
          .attr('stroke', medium_grey)
    })

    this.draw_song_unit_line('input', 'init')  
    this.draw_song_unit_line('target', 'init')

    song_plot_group.append('rect')
        .attr('x',0)
        .attr('y', -ascender_height)
        .attr('width', song_plot_width/2)
        .attr('height', song_plot_height + ascender_height)
        .attr('fill', light_grey)
        .attr('opacity', 0.5)
}
