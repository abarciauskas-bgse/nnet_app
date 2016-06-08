// LAYOUT
var num_classes = 11,
    num_neurons = 2,
    num_layers = 2,
    width = 1024,
    height = 668, // height of whole container
    header_height = 0,
    unit_width = 20,
    unit_height = unit_width,
    transfer_width = 60,
    song_plot_height = 100,
    songs_bar_y_offset = height - song_plot_height,
    song_plot_width = width,
    inner_margin = 20,
    neuron_y_offset = 20,
    layer_width = width/2,
    neuron_width = (layer_width - 3*unit_width - 2*transfer_width - inner_margin),
    neuron_height = (height // height dynamically defined by other factors
        - header_height
        - 2*neuron_y_offset // offset from top and bottom of the network
        - inner_margin*(num_neurons-1) // space between neurons in a layer
        - song_plot_height)/num_neurons, // divide by number of neurons
    network_y_position = neuron_y_offset + header_height,
    weight_set_height = num_classes*unit_height,
    unit_set_y_position = network_y_position + (2*neuron_height + inner_margin)/2 - weight_set_height/2,
    light_grey = '#ededed',
    medium_grey = '#ccc',
    song_plot_note_height = song_plot_height/num_classes,
    layer1_visible = false,
    default_sub_iter_duration = 1000,
    training_layer0 = null
