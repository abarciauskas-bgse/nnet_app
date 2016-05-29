var loss_memory = 100
var short_term_regrets = new Array(loss_memory).fill(0.0)
// Constants
var eta = 1
var n = 100 // number of training points
var scale = 3 // scale of data, -scale to scale
var max_iters = 100
var max_step_time = 5000
var min_step_time = 200
var time_scale = d3.scale.pow().exponent(-1/3).domain([1,1000]).range([max_step_time, min_step_time]);
var timeouts = [];
var current_iter = 0;

var gen_data = function() {
    // Step 0: Simulate traning data
    var wts = runifo(2, 3) // will be the true weights
    var data = simulate_training_data(wts, eta, n, scale)
    var short_term_regrets = new Array(loss_memory).fill(0.0)

    // Step 1: initialization
    var weights = runifo(2,3)
    var long_term_regrets = []
    var all_weights = []
    
    // Step 2: Iterate
    for (var iter = 0; iter < max_iters; iter ++) {
      for (var i = 0; i < n-1; i ++) {
          point = data[i]        
          res = step(point, weights)
          all_weights.push(res.weights)
          weights = res.weights
          long_term_regrets.push(res.loss)
      }
    }

    return {all_weights: all_weights, short_term_regrets: short_term_regrets, long_term_regrets: long_term_regrets, data_points: data}
}
