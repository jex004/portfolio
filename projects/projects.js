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

let selectedIndex = -1;
let searchQuery = "";

function renderPieChart(projectsGiven) {
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();
  
    let newRolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);
    let newData = newRolledData.map(([year, count]) => ({ value: count, label: year }));
  
    let newSliceGenerator = d3.pie().value(d => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  
    svg.selectAll('path')
      .data(newArcData)
      .enter()
      .append('path')
      .attr('d', newArcGenerator)
      .attr('fill', (_, idx) => colors(idx))
      .attr('data-index', (_, idx) => idx)
      .on('click', function (event, d) {
        let clickedIndex = newData.findIndex(data => data.label === d.data.label);
        selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
        applyFilters();
      });
  
    legend.selectAll('li')
      .data(newData)
      .enter()
      .append('li')
      .attr('style', (_, idx) => `--color:${colors(idx)}`)
      .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', function (event, d) {
        let clickedIndex = newData.findIndex(data => data.label === d.label);
        selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
        applyFilters();
      });
}

function applyFilters() {
  let filteredProjects = projects.filter(project => {
    return (!searchQuery || Object.values(project).join('\n').toLowerCase().includes(searchQuery)) &&
           (selectedIndex === -1 || project.year === d3.rollups(projects, v => v.length, d => d.year)[selectedIndex][0]);
  });
  
  renderProjects(filteredProjects, projectsContainer, 'h2');
  svg.selectAll('path').classed('faded', selectedIndex !== -1);
  svg.selectAll('path').each(function(_, idx) {
    d3.select(this).classed('selected', idx === selectedIndex);
  });
}

renderProjects(projects, projectsContainer, 'h3');
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  searchQuery = event.target.value.toLowerCase();
  applyFilters();
});
