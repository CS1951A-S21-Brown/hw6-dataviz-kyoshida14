
//setting objects for setGraph1
  //set up SVG object
  let svg_graph1 = d3.select("#graph1")
                    .append("svg")
                    .attr("width", graph_1_width)
                    .attr("height", graph_1_height)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

  //set up reference to count SVG group
  let countRef1 = svg_graph1.append("g");

  //a linear scale for x axis (count)
  let x_graph1 = d3.scaleLinear()
                   .range([0, graph_1_width - margin.left - margin.right]);

  //a scale band for y axis (genre)
  let y_graph1 = d3.scaleBand()
                   .range([0, graph_1_height - margin.top - margin.bottom])
                   .padding(0.1);

  //set up reference to y axis label -> update with each button click
  let y_labels_graph1 = svg_graph1.append("g");

//elements that should not update with button clicks
  //x axis label (Count)
  svg_graph1.append("text")
            .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2},
                                          ${(graph_1_height-margin.top-margin.bottom)+15})`)
            .style("text-anchor", "middle")
            .text("Count");

  //y axis label (Genre)
  svg_graph1.append("text")
            .attr("transform", `translate(-130,${(graph_1_height-margin.top-margin.bottom)/2})`)
            .style("text-anchor", "middle")
            .text("Genre");

  //chart title
  svg_graph1.append("text")
            .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2},-10)`)
            .style("text-anchor", "middle")
            .style("font-size", 17)
            .text("The number of titles per genre on Netflix");

  // // comment at the bottom
  // svg_graph1.append("text")
  //           .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2},
  //                                         ${(graph_1_height-margin.top-margin.bottom)+35})`)
  //           .style("text-anchor", "middle")
  //           .style("font-size", 10)
  //           .text("*The chart ranks in total of 42 genres on Netflix and divides into 3 sections.");

////////////////// main function ////////////////////////////////////

function setGraph1(data,index) {
  //a sorted & filtered list of pairs of genre and count
  //  [ [genre1, count1], [genre2, count2], ... ]
  let counted_genres = getGenreCount(data,index);

  //update x axis domain with the max count
  x_graph1.domain([0, d3.max(counted_genres, function(d) {return d[1]})]);
  //update y axis domain
  y_graph1.domain(counted_genres.map(function(d) { return d[0] }));

  //update y axis labels (genres)
  y_labels_graph1.call(d3.axisLeft(y_graph1).tickSize(0).tickPadding(10))
                 .call(svg_graph1 => svg_graph1.select(".domain").remove());

  //set up bars & colors
  let bars = svg_graph1.selectAll("rect").data(counted_genres);
  let color1 = d3.scaleOrdinal()
                 .domain(data.map(function(d) { return d[0] }))
                 .range(d3.quantize(d3.interpolateHcl("#2878d3", "#81c2c3"), counted_genres.length+1));
  bars.enter()
      .append("rect")
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("fill", function(d) { return color1(d[0]) })
      .attr("x", x_graph1(0))
      .attr("y", function(d) { return y_graph1(d[0]) })
      .attr("width", function(d) { return x_graph1(d[1]) })
      .attr("height", y_graph1.bandwidth());

  //set up texts of counts
  let counts = countRef1.selectAll("text").data(counted_genres);
  counts.enter()
        .append("text")
        .merge(counts)
        .style("text-anchor", "start")
        .style("font-size", 10)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x_graph1(d[1])+4 })
        .attr("y", function(d) { return y_graph1(d[0])+13 })
        .text(function(d) { return d[1] });

  // Remove elements not in use if fewer groups in new dataset
  bars.exit().remove();
  counts.exit().remove();
}

////////////////// helper functions ////////////////////////////////////

// output: a sorted list of pairs of genre and count
//         [["International Movies", 1927], ["Dramas", 1623], ...]
function getGenreCount(data, index) {
  //get a list of genres
  let genres_list = [];
  genres_list = data.map(function(d) { return d["listed_in"].split(", ") });

  //get counts
  let counted_genres = genres_list.reduce(function(all_genres, genres){
    for (i=0; i<genres.length; i++) {
      if (all_genres[genres[i]] === undefined ){ all_genres[genres[i]] = 1 }
      else { all_genres[genres[i]] += 1 }
    }
    return all_genres
  },{});  //return dictionary
  counted_genres = Object.keys(counted_genres).map(function(genre){
    return [genre, counted_genres[genre]]
  }); //change to array

  //sort & filter
  counted_genres = counted_genres.sort(function comparator(a, b) { return b[1]-a[1] })
                                 .filter(function(d,i) {
                                   if (index===1) { return i<(counted_genres.length/3) }
                                   else if (index===2) { return i>=(counted_genres.length/3) && i<(counted_genres.length/3*2) }
                                   else { return  i>=(counted_genres.length/3*2) }
                                 });

  return counted_genres;
}
