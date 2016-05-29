// generate a random draw from (k1,k2) with probability eta of k2
var rbinom = function(k1, k2, eta) {
    runif = Math.random()
    return (runif > (1-eta)) ? k2 : k1
}

// test
// var rbinoms = []
// var times = 100;
// var eta = 0.95
// for(var i=0; i < times; i++){
//     rdraw = rbinom(0, 1, eta)
//     rbinoms.push(rdraw)
// }

// var sum = rbinoms.reduce(function(previousValue, currentValue) {
//     return previousValue + currentValue;
// })

// var average = sum/times
// console.log('Average: ' + average + ' should be ~= ' + eta)
