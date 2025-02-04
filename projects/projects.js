import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');

console.log(projects)

// Select projects container
const projectsContainer = document.querySelector('.projects');

// Render projects
renderProjects(projects, projectsContainer, 'h3');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let data = [1, 2];
let total = 0;

for (let d of data) {
  total += d;
}
let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}
let arcs = arcData.map((d) => arcGenerator(d));

arcs.forEach(arc => {
    d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
  })

let colors = ['gold', 'purple'];
arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors[idx]) // Fill in the attribute for fill color via indexing the colors variable
})