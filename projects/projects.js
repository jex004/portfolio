import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchJSON, renderProjects } from '../global.js';

// Fetch project data
const projects = await fetchJSON('../lib/projects.json');
console.log(projects);

// Select projects container and search input
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

// Function to render the pie chart
function renderPieChart(projectsGiven) {
    // Clear previous pie chart and legend
    let svg = d3.select("#projects-pie-plot");
    svg.selectAll("*").remove();
    let legend = d3.select(".legend");
    legend.selectAll("*").remove();

    // Re-group projects by year
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    // Convert rolled data to the correct format
    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    // Exit if no data
    if (data.length === 0) return;

    // Define pie chart generators
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value(d => d.value);
    let arcData = sliceGenerator(data);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Append pie slices
    arcData.forEach((d, idx) => {
        svg.append('path')
          .attr('d', arcGenerator(d))
          .attr('fill', colors(idx));
    });

    // Update legend
    data.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// Function to update projects and filter dynamically
function updateProjects() {
    let query = searchInput.value.toLowerCase();

    // Filter projects based on query
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Render filtered projects
    projectsContainer.innerHTML = ''; // Clear previous results
    renderProjects(filteredProjects, projectsContainer, 'h3');

    // Update pie chart
    renderPieChart(filteredProjects);
}

// Call function on page load to render all projects
renderProjects(projects, projectsContainer, 'h3');
renderPieChart(projects);

// Attach event listener for live search updates
searchInput.addEventListener('input', updateProjects);
