add_network = function(network) {
    // add input units
    // this should be conditional on number of layers for future impl
    if (network == 'create' || network == 'training') {
        unitsets = [['input',0],['input',1],['output',0],['output',1],['target',0],['target',1]]
    } else {
        unitsets = [['input',0],['output',0],['target',0]]
    }
    for (i = 0; i < unitsets.length; i++) {
       unitset = new UnitSet(unitsets[i][0], unitsets[i][1], network)
    }
        
    for (layer_i = 0; layer_i < num_layers; layer_i++) {
        for (neuron_i = 0; neuron_i < num_neurons; neuron_i++) {
            neuron = new Neuron(layer_i, neuron_i, network);
            neuron.add()

            weight_types = (network == 'create' || network == 'training') ? ['xw', 'hy'] : ['xw']
            weight_types.forEach(function(type) {
                weight_set = new WeightSet(type, layer_i, neuron_i, network);
                weight_set.add()
            })

            if (network == 'create' || network == 'training') {
                hidden_state = new HiddenState(layer_i, neuron_i, network)
                hidden_state.add()
            }

            transfer_line_types = (network == 'create' || network == 'training') ? ['xw', 'hh', 'hy', 'wxh'] : []
            transfer_line_types.forEach(function(type) {
                tl_set = new TransferLineSet(type, layer_i, neuron_i, network)
                tl_set.add()
            });

        }
    }

    unit_sets.forEach(function(set) { set.add() })
};
