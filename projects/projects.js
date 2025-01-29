import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');

// Select projects container
const projectsContainer = document.querySelector('.projects');

console.log('container successful')

// Render projects
renderProjects(projects, projectsContainer, 'h2');
