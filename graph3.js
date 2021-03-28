
//setting objects for setGraph2
  //set up SVG object
  let svg_graph3 = d3.select("#graph3")
                     .append("svg")
                     .attr("width", graph_3_width)
                     .attr("height", graph_3_height)
                     .append("g")
                     .attr("transform", `translate(${margin.left},${margin.top})`);
  //define forces
  const forceX = d3.forceX(graph_3_width/2).strength(0.09),
        forceY = d3.forceY((graph_3_height+margin.top+margin.bottom)/2).strength(0.09);
  //set up tooltip for mouseover/out
  let tooltip3 = d3.select("#graph3")
                   .append("div")
                   .attr("class","tooltip")
                   .style("opacity",0);
  //set up colors for nodes
  let color3 = d3.scaleOrdinal(d3.schemeTableau10);

////////////////// main function ////////////////////////////////////

function setGraph3(data) {
  // get
  let newData = getActors(data);
  let links = newData[0], nodes = newData[1];

  //set up links
  let link = svg_graph3.append("g")
                       .selectAll("line")
                       .data(links)
                       .enter()
                       .append("line")
                       .style("stroke", "#999");
  //mouse hover on each link
   link.on("mouseover",function(d) { mouseover3(d,'link') })
       .on("mouseout",function(d) { mouseout3(d) });

  //set up nodes
  let node = svg_graph3.append("g")
                       .selectAll("circle")
                       .data(nodes)
                       .enter()
                       .append("circle")
                       .attr("r", 5)
                       .style("fill", function(d) { return color3(d.group)}); // change color based on groups
 //mouse hover on each node
 node.on("mouseover",function(d) { mouseover3(d,'node') })
     .on("mouseout",function(d) { mouseout3(d) });


  //set up the force to apply
  let simulation = d3.forceSimulation(nodes)
                     .force("x",forceX)
                     .force("y",forceY)
                     .force("link", d3.forceLink()
                                      .id(function(d) { return d.id; }) // for each actor
                                      .links(links))
                     .force("charge", d3.forceManyBody())
                     .force("center", d3.forceCenter((graph_3_width-margin.right-margin.left)/2-80,
                                                     (graph_3_height-margin.top-margin.bottom)/2));     // where the force is attracted
  simulation.on("tick", ticked); //show the changes of nodes and links

  //title
  svg_graph3.append("text")
            .attr("transform", `translate(${(graph_3_width-margin.left-margin.right)/2-50},-10)`)
            .style("text-anchor", "middle")
            .style("font-size", 17)
            .text("Actor collaborations**");
  //comment at the bottom
  svg_graph3.append("text")
            .attr("transform", `translate(${(graph_3_width-margin.left-margin.right)/2-50},
                                          ${(graph_3_height-margin.top-margin.bottom)})`)
            .style("text-anchor", "middle")
            .style("font-size", 12)
            .text("**The flow chart onlys shows the connections between actors who have appeared on screen together in more than 3 movies.");

  //update the position of nodes and links
  function ticked() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
}

////////////////// helper functions ////////////////////////////////////

// returns a filtered links and nodes (only the links that is stronger than 3 collaborations)
// output: [links, nodes]
//    links: [{ source: actor1, target: actor2 }, ...]
//    nodes: [{ id: actor1, group: group_number }, ...]   //group for color of the node
function getActors(data) {
  let actors_list = [];
  actors_list = data.filter(function(d) { return d.type=="Movie"})    //filter out non-movies
                    .map(function(d) { return d["cast"].split(", ") }); //get a list of cast for each movie


  // for each actor, dictionary of actors they have acted together and how many times
  //temp: {actor1: {actor2:#, actor3:#, ...}, actor2:{...}, ...}
  //  #: count how many times they have acted together for each link
  let temp = {};
  actors_list.forEach(function(d) {
    if (d.length>1) {
      for (let j=0; j<d.length; j++){ //source for link + add to node
        if (temp[d[j]]===undefined) { temp[d[j]] = {}; }
        for (let k=0; k<d.length; k++){ //target for link
          if (j!=k) {
            if (temp[d[j]][d[k]]===undefined) { temp[d[j]][d[k]] = 1; }
            else { temp[d[j]][d[k]]++; }
          }
        }
      }
    }
  });

  // get links and nodes
  let links = [], nodes = [];
  let temp_nodes = []; //keep track of all the actors added to the links
  let groups = {};  // key: actor, value: group number
  let g = 0;  // initial group number
  for (var s in temp){  //s = souce actor
    for (var t in temp[s]){ //t = target actor
      if (temp[s][t]>3) { // add the link only if more than 3 collaborations
        links.push({ source: s, target: t });
        if (!temp_nodes.includes(s)) {
          temp_nodes.push(s);
        }
        if (groups[s] === undefined){ // update group numbers
          g++;
          groups[s] = g;
        }
        groups[t] = groups[s];
      }
    }
  }
  for (var actor of temp_nodes) {
    nodes.push({ id: actor, group: groups[actor] });
  }
  // console.log(links);
  // console.log(nodes);

  return [links, nodes]
}

//for mouse hover, start showing the year + avg runtime
function mouseover3(d,loc) {
  let html;
  if (loc==='node') {  html = `${d.id}`; } //actor name for node
  else { html = `${d.source.id} - ${d.target.id}`; } //both actors for link
  console.log(html);

  //update tooltip based on the mouse location
  tooltip3.html(html)
      .style("left", `${(d3.event.pageX)-110}px`)
      .style("top", `${(d3.event.pageY)-40}px`)
      .style("box-shadow", `1px 1px 5px`)
      .style("opacity", 0.95);
};

//when the mouse is out, stop showing
function mouseout3(d) {
    tooltip3.transition()
        .duration(200)
        .style("opacity", 0);
};
