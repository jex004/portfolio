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
    // Clear previous chart and legend
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();
  
    // Recalculate data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );
  
    let newData = newRolledData.map(([year, count]) => ({
      value: count,
      label: year
    }));
  
    let total = d3.sum(newData, (d) => d.value);
    
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  
    // Draw arcs
    svg.selectAll('path')
      .data(newArcData)
      .enter()
      .append('path')
      .attr('d', newArcGenerator)
      .attr('fill', (_, idx) => colors(idx))
      .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''))
      .on('click', function (event, d) {
        let clickedIndex = newData.findIndex((data) => data.label === d.data.label);
        
        // Toggle selection
        selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
  
        // Update class for selected pie wedge
        svg.selectAll('path')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
  
        // Update class for legend item
        legend.selectAll('li')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
  
        applyFilters();
      });
  
    // Update legend
    legend.selectAll('li')
      .data(newData)
      .enter()
      .append('li')
      .attr('style', (_, idx) => `--color:${colors(idx)}`)
      .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''))
      .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', function (event, d) {
        let clickedIndex = newData.findIndex((data) => data.label === d.label);
  
        // Toggle selection
        selectedIndex = selectedIndex === clickedIndex ? -1 : clickedIndex;
  
        // Update class for selected legend item
        legend.selectAll('li')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
  
        // Update class for pie wedges
        svg.selectAll('path')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
  
        applyFilters();
      });
  }

function applyFilters() {
  let filteredProjects = projects;
  
  if (searchQuery) {
    filteredProjects = filteredProjects.filter((project) => {
      return Object.values(project).join('\n').toLowerCase().includes(searchQuery);
    });
  }
  
  if (selectedIndex !== -1) {
    let newData = d3.rollups(
      projects,
      (v) => v.length,
      (d) => d.year
    ).map(([year, count]) => ({
      value: count,
      label: year
    }));
    
    let selectedLabel = newData[selectedIndex].label;
    filteredProjects = filteredProjects.filter(project => project.year === selectedLabel);
  }

  renderProjects(filteredProjects, projectsContainer, 'h2');
}

// Initial render
renderProjects(projects, projectsContainer, 'h3');
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  searchQuery = event.target.value.toLowerCase();
  applyFilters();
});
