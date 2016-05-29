var sub_step_time = function() {
    return time_scale(current_iter)/6;
}

var create_interval_data = function(x, type, weight) {
    // create unit and modulo of data
    var x_data = d3.range(Math.floor(Math.abs(x))).map(function() {
        return (x < 0) ? -1 : 1
    })
    x_data.push(x%1)
    x_data = x_data.map(function(interval, idx) {
        return {original: x, type: type, value: interval, index: idx, weight: weight}
    })
    return x_data   
}
       
var yposition = function(d) {
    ypos = 0
    if (d.value < 0) {
        if (!(d.type == 'wx' || d.type == 'wx_start')) {
            ypos = transfer_multiply_height/2 + transfer_multiply_yscale(d.index)
        } else {
            ypos = transfer_multiply_height/2
        }
    } else {
        if (!(d.type == 'wx' || d.type == 'wx_start')) {
            ypos = transfer_multiply_height/2 - transfer_multiply_yscale(d.value) - transfer_multiply_yscale(d.index)
        } else {
            ypos = transfer_multiply_height/2 - transfer_multiply_yscale(d.value)
        } 
    }

    if (d.original > 0) { ypos += 2 }
    return ypos
}

var yposition_addition = function(d, group_indx) {
    ypos = 0
    if (d.value < 0) {
        ypos = transfer_multiply_yscale(d.index)
        if (group_indx == 1) {
            ypos += transfer_multiply_height
        }
    } else {
        ypos = transfer_addition_height/2 - transfer_multiply_yscale(d.index) - transfer_multiply_yscale(d.value)
        if (group_indx == 2) {
            ypos -= transfer_multiply_height
        }
    }
    if (d.original > 0) { ypos += 2 }
    return ypos
}

var barheight = function(d) {
  return Math.abs(transfer_multiply_yscale(d.value))
}

var draw_multiply_links = function(node_data, group, update) {
    var lineFunction = d3.svg.line().interpolate("basis");

    var lineData = function(d, update) {
      var y_pos = yposition(d) + barheight(d)/2 + ((d.value > 0) ? -1 : 0)
      var x_update = wtoffset + barwidth
      var y_update = y_pos
      if (update) {
        if (d.weight * d.value < 0) {
            y_update = transfer_multiply_height/2 + transfer_multiply_yscale(d.index) + barheight(d)/2
        } else if (d.weight < 0 && d.value < 0) {
            y_update = transfer_multiply_height/2 - transfer_multiply_yscale(d.index) - transfer_multiply_yscale(Math.abs(d.value)) + barheight(d)/2 + 1
        }
      }
      return [ 
        [ barwidth, y_pos],
        [ update ? x_update - 3*x_update/4 : barwidth, y_pos],
        [ update ? x_update - x_update/4 : barwidth, update ? y_update : y_pos],
        [ update ? x_update-barwidth : barwidth,  update ? y_update : y_pos]]
    }

    if (!update) {
      d3.select(group).selectAll('path.link').data(node_data)
        .enter().append("path")
        .attr("d", function(d) { return lineFunction(lineData(d)) })
        .attr('class', 'link')
        .attr("stroke", "white")
        .attr("stroke-width", function(d) { return height_with_padding(d) });                    

    } else {
        d3.select(group).selectAll('.link').transition().duration(sub_step_time)
           .attr('d', function(d) { return lineFunction(lineData(d, true)) })
    }
}

var draw_addition_links = function(node_data, group, group_indx, update, shift) {
    var lineFunction = d3.svg.line().interpolate("basis");

    var lineData = function(d, update, shift) {
      var shift_scaled = transfer_multiply_yscale(shift)
      var x_start = wtoffset+barwidth*2
      if (d.value < 0) {
          y_pos = transfer_multiply_height/2 + transfer_multiply_yscale(d.index) + barheight(d)/2 - 1
      } else {
          y_pos = transfer_multiply_height/2 - transfer_multiply_yscale(d.value) - transfer_multiply_yscale(d.index) + barheight(d)/2 + 1
      }
      var x_update = transfer_multiply_height/2-barwidth*2
      var y_update = y_pos
      if (update == 'first') {
        y_update = yposition_addition(d, group_indx) + barheight(d)/2 + (d.value > 0 ? -1 : 1)
      } else if (update == 'second') {
        console.log(shift_scaled)
        y_update = yposition_addition(d, group_indx) + barheight(d)/2 - shift_scaled + (shift_scaled < 0 ? -1 : 1)
      }
      update_pos = (update != undefined) ? true : false
      return [
        [ x_start, y_pos],
        [ update_pos ? x_start + x_update/4 : x_start, y_pos],
        [ update_pos ? x_start + 3*x_update/4 : x_start, update_pos ? y_update : y_pos],
        [ update_pos ? x_start + x_update : x_start,  update_pos ? y_update : y_pos]]
    }

    if (update == undefined) {
      d3.select(group).selectAll('path.addition_link').data(node_data)
        .enter().append("path")
        .attr("d", function(d) { return lineFunction(lineData(d)) })
        .attr('class', 'addition_link group' + group_indx)
        .attr("stroke", "white")
        .attr("stroke-width", function(d) { return height_with_padding(d) })                   
    } else if (update == 'first') {
        d3.select(group).selectAll('.addition_link').transition().delay(sub_step_time*2).duration(sub_step_time)
           .attr('d', function(d) { return lineFunction(lineData(d, 'first')) })
    } else if (update == 'second') {
        d3.select(group).selectAll('.addition_link.group1').transition().delay(sub_step_time*3).duration(sub_step_time)
           .attr('d', function(d) { return lineFunction(lineData(d, 'second', shift)) })
    }
}

var height_with_padding = function(d) {
    var height = Math.abs(transfer_multiply_yscale(d.value))
    var padding = -2//(d.index == 0 ? 0 : -2)
    return ((height + padding) > 2 ? (height + padding) : height)      
}
// function to add x and w to transfer multiply group plot
var addwx_multiply = function(data, group, group_indx) {
    var bars = group.selectAll('multiply_bar')
      .data(data)
      .enter().append('svg:rect')
      .attr('class', function(d) {
        return ((d.value > 0) ? 'pos_bar ' : 'neg_bar ') + d.type + '_bar multiply_bar ' + 'group' + group_indx + '_bar'
      })
      .attr('x', function(d) {
          if (d.type == 'x' || d.type =='x_start') {
              return 0;
          } else if (d.type == 'wx' || d.type == 'wx_start') {
              return wtoffset+barwidth;
          } else if (d.type == 'w') {
              return wtoffset;
          } else if (d.type == 'wxsum' || d.type == 'wxsum_start') {
              return barwidth;
          }
      })
      .attr('y', function(d) {
          if (!(d.type == 'wxsum' || d.type == 'wxsum_start')) {
            return yposition(d)
          } else {
            return yposition_addition(d, 1)
          }
       })
      .attr('width', barwidth)
      .attr('opacity', function(d) {
          return ((d.type == 'wx_start' || d.type == 'wxsum' || d.type == 'wxsum_start') ? 0 : 1)
      })
      .attr('height', function(d) { return height_with_padding(d) })
}

var stack_bars = function(class_selection) {
    var all_bars = d3.selectAll(class_selection)
    num_bars = all_bars[0].length
    all_bars.each(function(d, i) {
        d3.select(this).transition()
          .delay(sub_step_time)
          .duration(sub_step_time)
          .style('opacity', 1)
          .attr('y', function(d) {
            if (d.value < 0) {
                return transfer_multiply_height/2 + transfer_multiply_yscale(d.index)
            } else {
                return transfer_multiply_height/2 - transfer_multiply_yscale(d.value) - transfer_multiply_yscale(d.index) + 2
            }
          })

    })        
}
// step function for transitioning and multiplying bars
var multiply = function(group_indx) {
    // select all x_bars, move and disappear them
    d3.selectAll('.x_bar.multiply_bar').transition()
      .duration(sub_step_time)
      .attr('x', wtoffset)
      .attr('y', function(d) {
        if (d.weight*d.value < 0) {
            return transfer_multiply_height/2 + transfer_multiply_yscale(d.index)
        } else {
            return transfer_multiply_height/2 - transfer_multiply_yscale(Math.abs(d.value)) - transfer_multiply_yscale(d.index) + 2
        }

      })
      .attr('height', function(d) { return height_with_padding(d) })
      .transition().duration(500).style('opacity', 0.2)

    // FIXME: would like this to be a transition but d3 doesn't like to transition classes
    d3.selectAll('.x_bar.multiply_bar')
      .classed("neg_bar", function(d) { return d.value*d.weight < 0 ? true : false})
      .classed("pos_bar", function(d) { return d.value*d.weight > 0 ? true : false})

    // fade x_start and w
    d3.selectAll('.x_start_bar').transition().duration(sub_step_time).style('opacity', 0.2)
    d3.selectAll('.w_bar').transition().duration(sub_step_time).style('opacity', 0.2)

    // stack wx bars
    var wx_selection = '.wx_bar.multiply_bar.group' + group_indx + '_bar'
    var wx_start_selection = ' .wx_start_bar.multiply_bar.group' + group_indx + '_bar'
    stack_bars(wx_selection)
    stack_bars(wx_start_selection)
}

// function to transition wx bars to the transfer addition space
var move_to_addition = function(group_indx) {
    d3.selectAll('.wx_start_bar').transition().delay(sub_step_time*2).duration(sub_step_time).style('opacity', 0.2)
    d3.selectAll('.wx_bar.multiply_bar.group' + group_indx + '_bar').transition().delay(sub_step_time*2).duration(sub_step_time)
      .attr('x', transfer_multiply_height)
      .attr('y', function(d) { return yposition_addition(d, group_indx) })
}

var add = function(shift, shift_sign) {
    // select all the bars in the first group and shift them up or down depending on the value of the second group
    var shift_scaled = transfer_multiply_yscale(shift)
    d3.selectAll('.wx_bar.group1_bar').transition().delay(sub_step_time*3).duration(sub_step_time)
        .attr('y', function(d) {
            return yposition_addition(d, 1) - shift_scaled
        })
    if (shift_sign == -1) {
        // d3.selectAll('.wx_bar.group2_bar').transition().delay(sub_step_time*3).duration(sub_step_time)
        //     .attr('y', function(d) {
        //         padding_shift = (shift < 0) ? 2*Math.ceil(Math.abs(shift)) : -2*Math.ceil(shift)
        //         return yposition_addition(d, 1) + shift_scaled - transfer_multiply_height + padding_shift
        //     })
    } else {
        d3.selectAll('.wx_bar.group2_bar').transition().delay(sub_step_time*4).duration(sub_step_time).style('opacity', 0.2)
    }
    d3.selectAll('.wx_bar').transition().delay(sub_step_time*4).duration(sub_step_time).style('opacity', 0.2)
}

// draw the thrshold transition polygon
var threshold = function(final_transfer_value, final_output_value) {
    offset = (final_transfer_value > 0 ? 2 : -2)
    init_poly = [ {"x": 2*barwidth, "y": transfer_multiply_height},
                  {"x": 2*barwidth, "y": transfer_multiply_height - transfer_multiply_yscale(final_transfer_value) + offset},
                  {"x": 2*barwidth, "y": transfer_multiply_height - transfer_multiply_yscale(final_transfer_value) + offset},
                  {"x": 2*barwidth, "y": transfer_multiply_height}];

    update_poly = [ {"x": 2*barwidth,               "y": transfer_multiply_height},
                    {"x": 2*barwidth,               "y": transfer_multiply_height - transfer_multiply_yscale(final_transfer_value) + offset},
                    {"x": transfer_addition_height, "y": transfer_multiply_height - transfer_multiply_yscale(final_output_value)},
                    {"x": transfer_addition_height, "y": transfer_multiply_height}];

    transfer_addition_group.selectAll("polygon")
          .data([init_poly])
      .enter().append("polygon")
          .attr('id', 'threshold-poly')
          .attr("points",function(d) { 
              return d.map(function(d) {
                  return [d.x,d.y].join(",");
              }).join(" ");
          })
          .attr("opacity",0.2)
      .transition().delay(sub_step_time*5).duration(sub_step_time)
          .attr('points', function() {
              return update_poly.map(function(d) { return [d.x, d.y].join(',')}).join(' ')
          });

    transfer_addition_group.selectAll('.wxsum_start_bar').transition().delay(sub_step_time*4).style('opacity',1)
        .transition()
        .delay(sub_step_time*5)
        .duration(sub_step_time)
        .style('opacity', 0.2)

    //move bar to threshold and shrink to final value
    transfer_addition_group.selectAll('.wxsum_bar').transition().delay(sub_step_time*5).duration(sub_step_time)
        .attr('x', transfer_addition_height-barwidth)
        .attr('opacity', 1)
        .attr('height', transfer_multiply_yscale(final_output_value))
        .attr('y', transfer_multiply_height - transfer_multiply_yscale(final_output_value))

    transfer_addition_group.selectAll('.wxsum_bar')
        .classed('neg_bar', false)
        .classed('pos_bar', true)
}

var activate = function() {
    d3.selectAll('.wxsum_bar').transition().delay(sub_step_time*4).duration(sub_step_time).style('opacity', 1)
}

var transfer = function(x, w) {
    d3.selectAll('.multiply_bar').remove()
    d3.selectAll('.link').remove()
    d3.selectAll('.addition_link').remove()
    d3.selectAll('#threshold-poly').remove()

    var x = (x == undefined) ? runifo(2, 3) : x,
        x1 = x[0],
        x2 = x[1],
        w = (x == undefined) ? runifo(2, 3) : w,
        w1 = w[0],
        w2 = w[1],
        shift = w2*x2,
        shift_sign = Math.sign(shift*(w1*x1)),
        final_transfer_value = w1*x1 + shift,
        final_output_value = 1/(1+Math.exp(-final_transfer_value))
    x1_data = create_interval_data(x1, 'x', w1)
    x2_data = create_interval_data(x2, 'x', w2)
    x1_start_data = create_interval_data(x1, 'x_start', w1)
    x2_start_data = create_interval_data(x2, 'x_start', w2)

    w1_data = create_interval_data(w1, 'w', w1)
    w2_data = create_interval_data(w2, 'w', w2)
    wx1_start_data = create_interval_data(x1*w1, 'wx_start', w1)
    wx2_start_data = create_interval_data(x2*w2, 'wx_start', w2)
    wx1_data = create_interval_data(x1*w1, 'wx', w1)
    wx2_data = create_interval_data(x2*w2, 'wx', w1)

    final_data_start = create_interval_data(final_transfer_value, 'wxsum_start')
    final_data = create_interval_data(final_transfer_value, 'wxsum')

    data1 = x1_data.concat(w1_data).concat(wx1_data).concat(x1_start_data).concat(wx1_start_data)
    data2 = x2_data.concat(w2_data).concat(wx2_data).concat(x2_start_data).concat(wx2_start_data)
    
    addwx_multiply(data1, transfer_multiply_group_1, 1)
    addwx_multiply(data2, transfer_multiply_group_2, 2)
    addwx_multiply(final_data_start, transfer_addition_group)
    addwx_multiply(final_data, transfer_addition_group)

    draw_multiply_links(x1_start_data, transfer_group_1)
    draw_multiply_links(x2_start_data, transfer_group_2)
    draw_multiply_links(x1_start_data, transfer_group_1, true)
    draw_multiply_links(x2_start_data, transfer_group_2, true)

    draw_addition_links(wx1_start_data, transfer_group_1, 1)
    draw_addition_links(wx2_start_data, transfer_group_2, 2)
    draw_addition_links(wx1_start_data, transfer_group_1, 1, 'first')
    draw_addition_links(wx2_start_data, transfer_group_2, 2, 'first')
    draw_addition_links(wx1_start_data, transfer_group_1, 1, 'second', w2*x2)

    multiply(1)
    multiply(2)
    move_to_addition(1)
    move_to_addition(2)
    add(shift, shift_sign)
    activate()
    threshold(final_transfer_value, final_output_value)
}
