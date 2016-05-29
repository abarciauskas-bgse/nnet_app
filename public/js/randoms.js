/*
    FUNCTION runifo
*/
// generate n random numbers, between [-scale, scale]
// returns an array of length n
function runifo(n, scale) {
    var rdraws = []
    for (var i = 0; i < n; i++) {
        var sign = rbinom(1,-1,0.5)
        rdraws.push(sign*Math.random()*scale)
    }
    return rdraws
}

// example:
runifo(3, 3)
//[1.7030681813073976, 2.442447060508446, -2.8843051397256323]
// TODO: add test


/*
    FUNCTION dotproduct
*/
var dotproduct = function(weights, X) {
    var dp = 0
    for(var i=0; i< weights.length; i++) {
        dp += weights[i]*X[i];
    }
    return dp
}
// test:
// dotproduct([1,2], [-2,0]) == -2
// dotproduct([1,2], [0,0]) == 0
// dotproduct([1,2], [2,3]) == 8



/*
    FUNCTION simulate_training_data
*/
// generate n random with probability eta of class 1 (0 otherwise)
// TODO: only 2-dimensional but should be easy to fix
// returns a javascript array of length n, the ith item being an object, e.g.:
//   [{'x1': ..., 'x2': ..., 'class': ...}, ..., {...}]
//
var simulate_training_data = function(wts, eta, n, scale) {
    // generate n random x1, x2
    var x1s = runifo(n, scale)
    var x2s = runifo(n, scale)
    // I don't know if it matters yet but this could be an array of n hashes 
    // but potentially concerned about performance of hash v array...
    var data = []

    // generate class distribution with probability eta
    for (var i = 0; i < n; i ++) {
        var x1 = x1s[i]
        var x2 = x2s[i]
        var y = 0
        if (dotproduct([x1,x2], wts) > 0) {
            // assign to class 1 with probability eta
            y = rbinom(0,1,eta)
        } else {
            y = rbinom(0,1,1-eta)
        }
        data.push({'x1': x1, 'x2': x2, 'class': y})
    }

    return data
}

// example:
// var wts = runifo(2, 3)
// data = simulate_training_data(wts, 0.85, 100, 3)
// TODO: add tests

