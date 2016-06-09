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
        ypos = transfer_addition_height/2 - transfer_multiply_yscale(d.value) - transfer_multiply_yscale(d.index)
        if (group_indx == 2) {
            ypos -= transfer_multiply_height
        }
    }

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
            y_update = transfer_multiply_height/2 + barheight(d)/2 + transfer_multiply_yscale(d.index) 
        } else if (d.weight < 0 && d.value < 0) {
            y_update = transfer_multiply_height/2 - transfer_multiply_yscale(Math.abs(d.value)) + barheight(d)/2 - transfer_multiply_yscale(d.index)
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
        .attr("stroke", "#333")
        .style("stroke-width", function(d) { return height_with_padding(d) });                    

    } else {
        d3.select(group).selectAll('.link').transition().duration(sub_step_time)
            .attr('d', function(d) {
                return lineFunction(lineData(d, true))
            })
    }
}

var draw_addition_links = function(node_data, group, group_indx, update, shift) {
    var lineFunction = d3.svg.line().interpolate("basis");

    var lineData = function(d, update, shift) {
      var shift_scaled = transfer_multiply_yscale(shift)
      var x_start = wtoffset+barwidth*2
      if (d.value < 0) {
          y_pos = transfer_multiply_height/2 + transfer_multiply_yscale(d.index) + barheight(d)/2
      } else {
          y_pos = transfer_multiply_height/2 - transfer_multiply_yscale(d.value) - transfer_multiply_yscale(d.index) + barheight(d)/2
      }
      var x_update = addition_position - x_start
      var y_update = y_pos
      if (update == 'first') {
        y_update = yposition_addition(d, group_indx) + barheight(d)/2 + (d.value > 0 ? -1 : 1)
      } else if (update == 'second') {
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
        .attr("stroke", "#333")
        .style("stroke-width", function(d) { return height_with_padding(d) })                   
    } else if (update == 'first') {
        d3.select(group).selectAll('.addition_link').transition().delay(walkthru ? 0 : sub_step_time*2).duration(sub_step_time)
           .attr('d', function(d) { return lineFunction(lineData(d, 'first')) })
    } else if (update == 'second') {
        d3.select(group).selectAll('.addition_link.group1').transition().delay(walkthru ? sub_step_time : sub_step_time*3).duration(sub_step_time)
           .attr('d', function(d) { return lineFunction(lineData(d, 'second', shift)) })
    }
}

var height_with_padding = function(d) {
    this_height = Math.abs(transfer_multiply_yscale(d.value))
    var padding = -2
    return ((this_height + padding) > 0 ? (this_height + padding) : 0.2)      
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
                return transfer_multiply_height/2 - transfer_multiply_yscale(d.value) - transfer_multiply_yscale(d.index)
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
            return transfer_multiply_height/2 - transfer_multiply_yscale(Math.abs(d.value)) - transfer_multiply_yscale(d.index)
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
    d3.selectAll('.wx_bar.multiply_bar.group' + group_indx + '_bar').transition().delay(walkthru ? 0 : sub_step_time*2).duration(sub_step_time)
      .attr('x', addition_position)
      .attr('y', function(d) { return yposition_addition(d, group_indx) })
}

var add = function(shift, shift_sign) {
    // select all the bars in the first group and shift them up or down depending on the value of the second group
    var shift_scaled = transfer_multiply_yscale(shift)
    d3.selectAll('.wx_bar.group1_bar').transition().delay(walkthru ? sub_step_time : sub_step_time*3).duration(sub_step_time)
        .attr('y', function(d) {
            return yposition_addition(d, 1) - shift_scaled
        })
    if (shift_sign != -1) {
        d3.selectAll('.wx_bar.group2_bar').transition().delay(walkthru ? sub_step_time : sub_step_time*4).duration(sub_step_time).style('opacity', 0.2)
    }
    d3.selectAll('.wx_bar').transition().delay(walkthru ? sub_step_time*2 : sub_step_time*4).duration(sub_step_time).style('opacity', 0.2)
}

// draw the thrshold transition polygon
var threshold = function(final_transfer_value, final_output_value) {
    init_poly = [ {"x": 2*barwidth, "y": transfer_multiply_height},
                  {"x": 2*barwidth, "y": transfer_multiply_height - transfer_multiply_yscale(final_transfer_value)},
                  {"x": 2*barwidth, "y": transfer_multiply_height - transfer_multiply_yscale(final_transfer_value)},
                  {"x": 2*barwidth, "y": transfer_multiply_height}];

    update_poly = [ {"x": 2*barwidth,               "y": transfer_multiply_height},
                    {"x": 2*barwidth,               "y": transfer_multiply_height - transfer_multiply_yscale(final_transfer_value)},
                    {"x": threshold_position, "y": transfer_multiply_height - transfer_multiply_yscale(final_output_value)},
                    {"x": threshold_position, "y": transfer_multiply_height}];

    transfer_addition_group.selectAll("polygon")
          .data([init_poly])
      .enter().append("polygon")
          .attr('id', 'threshold-poly')
          .attr("points",function(d) { 
              return d.map(function(d) {
                  return [d.x,d.y].join(",");
              }).join(" ");
          })
          .attr("class",'link')
          .style('fill', '#ddd')
          .style('stroke', 'none')
      .transition().delay((walkthru) ? sub_step_time : sub_step_time*5).duration(sub_step_time)
          .attr('points', function() {
              return update_poly.map(function(d) { return [d.x, d.y].join(',')}).join(' ')
          });

    transfer_addition_group.selectAll('.wxsum_start_bar').transition().delay((walkthru) ? 0 : sub_step_time*4).style('opacity',1)
        .transition()
        .delay(sub_step_time*5)
        .duration(sub_step_time)
        .style('opacity', 0.2)

    //move bar to threshold and shrink to final value
    transfer_addition_group.selectAll('.wxsum_bar').transition().delay((walkthru) ? sub_step_time : sub_step_time*5).duration(sub_step_time)
        .attr('x', threshold_position)
        .attr('opacity', 1)
        .attr('height', transfer_multiply_yscale(final_output_value))
        .attr('y', transfer_multiply_height - transfer_multiply_yscale(final_output_value))

    transfer_addition_group.selectAll('.wxsum_bar')
        .classed('neg_bar', false)
        .classed('pos_bar', true)
}

var activate = function() {
    d3.selectAll('.wxsum_bar').transition().delay(walkthru ? 0 : sub_step_time*4).duration(sub_step_time).style('opacity', 1)
}

var sub_step0 = function(data1, data2, final_data_start, final_data) {
    addwx_multiply(data1, transfer_multiply_group_1, 1)
    addwx_multiply(data2, transfer_multiply_group_2, 2)
    addwx_multiply(final_data_start, transfer_addition_group)
    addwx_multiply(final_data, transfer_addition_group)
    d3.selectAll('.x_start_bar').each(function() {
        d3.select(this).on('mouseover', data_rect_tip.show)
        d3.select(this).on('mouseleave', data_rect_tip.hide)
    })    
}

var sub_step1 = function(x1_start_data, x2_start_data) {
    draw_multiply_links(x1_start_data, transfer_group_1)
    draw_multiply_links(x2_start_data, transfer_group_2)
    draw_multiply_links(x1_start_data, transfer_group_1, true)
    draw_multiply_links(x2_start_data, transfer_group_2, true)
    multiply(1)
    multiply(2)
    d3.selectAll('.x_bar, .w_bar, .wx_start_bar').each(function() {
        d3.select(this).on('mouseover', data_rect_tip.show)
        d3.select(this).on('mouseleave', data_rect_tip.hide)
    })         
}

var sub_step2 = function(wx1_start_data, wx2_start_data, w2, x2, shift, shift_sign, final_transfer_value) {
    draw_addition_links(wx1_start_data, transfer_group_1, 1)
    draw_addition_links(wx2_start_data, transfer_group_2, 2)
    draw_addition_links(wx1_start_data, transfer_group_1, 1, 'first')
    draw_addition_links(wx2_start_data, transfer_group_2, 2, 'first')
    draw_addition_links(wx1_start_data, transfer_group_1, 1, 'second', w2*x2)
    move_to_addition(1)
    move_to_addition(2)
    d3.selectAll('.wx_bar').each(function() {
        d3.select(this).data()[0].original = final_transfer_value
        d3.select(this).on('mouseover', data_rect_tip.show)
        d3.select(this).on('mouseleave', data_rect_tip.hide)
    })     
    add(shift, shift_sign)     
}

var sub_step3 = function(final_transfer_value, final_output_value) {
    activate()
    threshold(final_transfer_value, final_output_value)
    d3.selectAll('.wxsum_bar').each(function() {
        d3.select(this).data()[0].original = final_output_value
        d3.select(this).on('mouseover', data_rect_tip.show)
        d3.select(this).on('mouseleave', data_rect_tip.hide)
    })
}

var highlight_outputs = function(final_output_value, delay) {
    // Update prediction
    colors = ['#9F55E8','#E88923']
    var outputs = d3.select('#whatisaneuron_unit_set_output_L0').selectAll('rect').data([final_output_value, final_output_value])
    outputs.transition().delay(delay).duration(sub_step_time) // delay was sub_step_tim*5
           .style('fill-opacity', function(d, i) {
                return Math.max(0.05, (i == 0) ? (1 - final_output_value) : final_output_value)
            })
           .style('fill', function(d, i) { return colors[i] })
    outputs.on('mouseover', outputs_tip.show)
           .on('mouseleave', outputs_tip.hide)
}
var transfer = function(x, w, iter = current_iter) {
    d3.selectAll('.multiply_bar').remove()
    d3.selectAll('.link').remove()
    d3.selectAll('.addition_link').remove()
    d3.selectAll('#threshold-poly').remove()

    var x = (x == undefined) ? runifo(2, 3) : x,
        x1 = x[0],
        x2 = x[1],
        true_class = x[2],
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
    
    if (!walkthru) {
        sub_step0(data1, data2, final_data_start, final_data)
        sub_step1(x1_start_data, x2_start_data)
        sub_step2(wx1_start_data, wx2_start_data, w2, x2, shift, shift_sign, final_transfer_value)
        sub_step3(final_transfer_value, final_output_value)
        highlight_outputs(final_output_value, sub_step_time*5, true_class)
    } else if (walkthru) {
        sub_step0_modal.show()
        setTimeout(function() {
            sub_step0(data1, data2, final_data_start, final_data)
            sub_step1(x1_start_data, x2_start_data)
            add_label_pointer('#whatisaneuron_unit_set_input_L0', 'input x1', 'top', -30, -17)
            add_label_pointer('#whatisaneuron_unit_set_input_L0', 'input x2', 'bottom', -35, unit_height*2-5)
            add_label_pointer('#whatisaneuron_weight_set_xw_L0_N0', 'weights', 'top right', -20, -31)
        }, 500)

        // FIXME: Some of the scariest code I've ever written
        $('#' + transfer_multiply_group_1.attr('id') 
          + ', #' + transfer_multiply_group_2.attr('id') 
          + ', #weights_label').on('click', function() {
            if (walkthru) {
                sub_step2_modal.show()
                setTimeout(function() {
                    sub_step2(wx1_start_data, wx2_start_data, w2, x2, shift, shift_sign, final_transfer_value)
                }, 500)
                setTimeout(function() {
                   add_label_pointer('.wx_bar', 'sum', 'bottom', -25, 20, false)
                }, 600 + 2*sub_step_time)            
                $('#' + transfer_multiply_group_1.attr('id')).unbind('click');

                $('#' + transfer_multiply_group_1.attr('id') + ', #' + transfer_multiply_group_2.attr('id') + ', #weights_label').unbind('click')
                $('.wx_bar, #sum_label').on('click', function() {
                    sub_step3_modal.show()
                    setTimeout(function() {
                        sub_step3(final_transfer_value, final_output_value)
                    }, 500)  
                    add_label_pointer('#threshold_bar_top', 'threshold', 'top right', -20, -31)  
                })              
            }
        })

        $('#threshold_bar_top, #transfer_addition_group, #threshold_bar_bottom').on('click', function() {
            if (walkthru) {
                output_modal.show()
                setTimeout(function() {
                    highlight_outputs(final_output_value, 0, true_class)
                }, 500)
                add_label_pointer('#whatisaneuron_unit_set_output_L0', 'guess', 'top right', -20, -31)
            }
        })

        $('#whatisaneuron_unit_set_output_L0').on('click', function() {
            if (walkthru) {
                target_modal.show()
                setTimeout(function() {
                    update_current_point(iter)
                    iter_weights = all_weights[iter]
                    iter_loss = long_term_regrets[iter]
                    update_shaded(iter_weights, iter)
                    update_loss(short_term_regrets, iter_loss, iter)
                    add_label_pointer('#whatisaneuron_unit_set_target_L0', 'target', 'bottom', -30, unit_height*2)
                }, 500)
            }
        })

        $('#whatisaneuron_unit_set_target_L0').on('click', function() {
            if (walkthru) {
                walkthru = false
                $('#walkthru-button').html('loop')
                finished_walkthru_modal.show()
            }
        })
    }
}
