import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');

console.log(projects)

// Select projects container
const projectsContainer = document.querySelector('.projects');

// Render projects
renderProjects(projects, projectsContainer, 'h3');
