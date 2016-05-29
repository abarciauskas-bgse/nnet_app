var kolors = d3.scale.ordinal()
    .domain(d3.range(0,num_classes))
    .range(colorbrewer.Spectral[num_classes]);

var wkolors = d3.scale.linear()
    .domain([-1,0,1])
    .range(colorbrewer.Greys[4]);

// FIX ME: need a better wait to fix the domain of this thing.
// AND just colors in general
var hskolors = d3.scale.linear()
    .domain([-1,0,1])
    .range(colorbrewer.Blues[5]);
