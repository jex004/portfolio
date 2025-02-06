import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

console.log(projects);

// Select projects container
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('svg');
const legend = d3.select('.legend');
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsGiven) {
  // Clear previous chart and legend
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // Recalculate data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let newData = newRolledData.map(([year, count]) => ({ value: count, label: year }));
  let total = d3.sum(newData, (d) => d.value);
  
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  // Draw arcs
  newArcData.forEach((d, idx) => {
    svg.append('path')
      .attr('d', newArcGenerator(d))
      .attr('fill', colors(idx));
  });

  // Update legend
  newData.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Initial render
renderProjects(projects, projectsContainer, 'h3');
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  let query = event.target.value.toLowerCase();
  let filteredProjects = projects.filter((project) => {
    return Object.values(project).join('\n').toLowerCase().includes(query);
  });
  
  // Re-render projects and pie chart
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});