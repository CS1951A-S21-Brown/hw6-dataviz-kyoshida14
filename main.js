// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 400;
let graph_2_width = MAX_WIDTH- 10, graph_2_height = 300;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 550;

let data;
let cur_graph1 = 1;

d3.csv("./data/netflix.csv").then(function(d) {
  data = d;
  updateGraph1(cur_graph1);
  setGraph2(data);
  setGraph3(data);
});

// update Graph 1 with button clicks
function updateGraph1(index) {
  cur_graph1 = index;
  setGraph1(data,cur_graph1);
}
