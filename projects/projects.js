import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');

console.log(projects)

// Select projects container
const projectsContainer = document.querySelector('.projects');

// Render projects
renderProjects(projects, projectsContainer, 'h3');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let sliceGenerator = d3.pie().value((d) => d.value);

let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
let total = 0;

for (let d of data) {
  total += d;
}
let angle = 0;
let arcData = sliceGenerator(data);


for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}
let arcs = arcData.map((d) => arcGenerator(d));

arcs.forEach(arc => {
    d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
  })

let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, idx) => {
    d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx))
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})

