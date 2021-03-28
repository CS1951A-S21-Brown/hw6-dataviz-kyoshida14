
//setting objects for setGraph2
  //set up SVG object
  let svg_graph2 = d3.select("#graph2")
                    .append("svg")
                    .attr("width", graph_2_width)
                    .attr("height", graph_2_height)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

  //set up reference to count (runtime) SVG group
  let countRef2 = svg_graph2.append("g");

  //set up tooltip for mouseover/out
  let tooltip2 = d3.select("#graph2")
                  .append("div")
                  .attr("class","tooltip")
                  .style("opacity",0);

////////////////// main function ////////////////////////////////////

function setGraph2(data) {
  //a sorted & filtered list of pairs of year and avg runtime
  //  [ [year1, avg1], [year2, avg2], ... ]
  let years_runtime = getYearData(data);

  // add X axis (year)
  let x_max = d3.max(years_runtime, function(d) { return d[0] }), // max year
      x_min = d3.min(years_runtime, function(d) { return d[0] }), // min year
      x_num_ticks = (x_max-x_min)/5;  // how many ticks
  let x_graph2 = d3.scaleLinear()
                   .domain([x_min, x_max])
                   .range([0, graph_2_width - margin.left - margin.right]);
  svg_graph2.append("g")
            .attr("transform", `translate(0,${(graph_2_height-margin.top-(margin.bottom+15))})`)
            .call(d3.axisBottom(x_graph2)
                    .tickPadding(5)
                    .tickFormat(d3.format("d"))
                    .ticks(x_num_ticks)
                  );

  // add y axis (avg runtime)
  let y_max = (Math.floor(d3.max(years_runtime, function(d) {return d[1]})/10)+1)*10,
      y_min = 0,
      y_num_ticks = (y_max-y_min)/20;
  let y_graph2 = d3.scaleLinear()
                   .domain([y_max, y_min])
                   .range([0, graph_2_height - margin.top - (margin.bottom+15)]);
  svg_graph2.append("g")
            .call(d3.axisLeft(y_graph2)
                    .tickPadding(10)
                    .ticks(y_num_ticks)
                  );

  //add lines
  svg_graph2.append("path")
            .datum(years_runtime)
            .transition()
            .duration(1000)
            .attr("fill", "none")
            .attr("stroke", "#2878d3")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                         .x(function(d) { return x_graph2(d[0]) })
                         .y(function(d) { return y_graph2(d[1]) })
                 );

  //add points
  let points = countRef2.selectAll("circle").data(years_runtime);
  points.enter()
        .append("circle")
        .attr("cx", function(d) { return x_graph2(d[0]) })
        .attr("cy", function(d) { return y_graph2(d[1]) })
        .attr("r", 4)
        .attr("fill", "#2878d3")
        .on("mouseover",function(d) { mouseover2(d) })
        .on("mouseout",function(d) { mouseout2(d) });


  // title
  svg_graph2.append("text")
            .attr("transform", `translate(${(graph_2_width-margin.left-margin.right)/2},-15)`)
            .style("text-anchor", "middle")
            .style("font-size", 17)
            .text("The average runtime* of movies by release year");
  //x axis label (Year)
  svg_graph2.append("text") // x
            .attr("transform", `translate(${(graph_2_width-margin.left-margin.right)/2},
                                          ${(graph_2_height-margin.top-margin.bottom)+20})`)
            .style("text-anchor", "middle")
            .text("Year");
  //y axis labels (avg runtime)
  svg_graph2.append("text")
            .attr("transform", `translate(-95,${(graph_2_height-margin.top-margin.bottom)/2})`)
            .style("text-anchor", "middle")
            .text("Average runtime");
  svg_graph2.append("text")
            .attr("transform", `translate(-95,${(graph_2_height-margin.top-margin.bottom)/2+16})`)
            .style("text-anchor", "middle")
            .style("font-size", 13)
            .text("(min)");
  //comment at the bottom
  svg_graph2.append("text") // x + comment
            .attr("transform", `translate(${(graph_2_width-margin.left-margin.right)/2},
                                          ${(graph_2_height-margin.top-margin.bottom)+35})`)
            .style("text-anchor", "middle")
            .style("font-size", 12)
            .text("*Years with no movie release are shown as having average runtime of 0.");
}


////////////////// helper functions ////////////////////////////////////

// output: a sorted list of pairs of year and average runtime
//         [[1942, 35], [1943, 62.666666666666664], ...]
function getYearData(data) {
  //get a list of movies (info: release_year, duration)
  let movies_list = [];
  movies_list = data.filter(function(d) { return d.type=="Movie" })
           .map(function(d) { return [d.release_year, parseInt(d.duration.slice(0,d.duration.length-4))] }); //change to int

  //return dictionary (key: year, value: a list of durations)
  let years_list = movies_list.reduce(function(all_years, year){
    if (all_years[year[0]] === undefined ){ all_years[year[0]] = [year[1]] }
    else { all_years[year[0]].push(year[1]) }
    return all_years
  },{});

  let min_year = parseInt(d3.min(Object.keys(years_list))),
      max_year = parseInt(d3.max(Object.keys(years_list)));
  for (let y=min_year; y<max_year; y++) {
    if (years_list[y] === undefined ) { years_list[y] = [0]; }
  }

  //change to array (year, avg runtime)
  years_list = Object.keys(years_list).map(function(year){
    let sum = 0;
    for (let duration of years_list[year]) { sum += duration; }
    // return [ parseInt(year), sum/years_list[year].length ]
    return [ parseInt(year), sum/years_list[year].length ]
  });

  return years_list
}

//for mouse hover, start showing the year + avg runtime
function mouseover2(d) {
  // year + avg runtime
  let html = `${d[0]}<br/>
              ${d[1].toFixed(2)} min`;

  //update tooltip based on the mouse location
  tooltip2.html(html)
          .style("left", `${(d3.event.pageX)-100}px`)
          .style("top", `${(d3.event.pageY)-50}px`)
          .style("box-shadow", `1px 1px 5px`)
          .style("opacity", 0.95);
};

//when the mouse is out, stop showing
function mouseout2(d) {
  tooltip2.transition()
          .duration(200)
          .style("opacity", 0);
};
