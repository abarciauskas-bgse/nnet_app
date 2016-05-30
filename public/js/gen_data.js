var loss_memory = 100
var short_term_regrets = new Array(loss_memory).fill(0.0)

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
