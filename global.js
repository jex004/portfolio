console.log("IT'S ALIVE!");

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'CV/', title: 'CV' },
  { url: 'https://github.com/jex004', title: 'GitHub' }
];

// Detect if we are on GitHub Pages
const IS_GITHUB_PAGES = location.hostname === 'jex004.github.io'; // Replace with your GitHub Pages domain if different
const BASE_PATH = IS_GITHUB_PAGES ? '/portfolio' : ''; // Add your repository name for GitHub Pages
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create and prepend the nav element
let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust URLs for GitHub Pages or non-home pages
  url = !ARE_WE_HOME && !url.startsWith('http') ? BASE_PATH + '/' + url : url;

  // Create the link
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  const currentPath = location.pathname.endsWith('/')
    ? location.pathname
    : location.pathname + '/';
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  // Open external links in a new tab
  if (!url.startsWith(BASE_PATH) && !url.startsWith('/')) {
    a.target = '_blank';
  }

  // Add the link to the navigation
  nav.append(a);
}


// Add the theme switcher
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-selector">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`);

// Handle theme selection
const themeSelector = document.getElementById('theme-selector');
themeSelector.addEventListener('change', (event) => {
  document.documentElement.style.colorScheme = event.target.value;
  localStorage.setItem('theme', event.target.value);
});

// Load saved theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  themeSelector.value = savedTheme;
  document.documentElement.style.colorScheme = savedTheme;
}

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      // Check if the fetch was successful
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      console.log(response)

      // Parse the JSON response
      const data = await response.json();
      console.log('Fetched Data:', data);
      return data;

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {

  // Check if container is a valid instance

  if (!(containerElement instanceof HTMLElement)) {
      console.error('Invalid container element:', containerElement);
      return;
  }

  // Update project count in the header
  const projectsTitle = document.querySelector('.projects-title');
  if (projectsTitle) {
      projectsTitle.textContent = `${projects.length} Projects`;
  }
  
  // Clear existing content
  containerElement.innerHTML = '';

  // Validate the heading level (only allow h1-h6)
  if (!/^h[1-6]$/.test(headingLevel)) {
      console.warn(`Invalid heading level "${headingLevel}", defaulting to h2.`);
      headingLevel = 'h2';
  }
  
  // Loop through each project and create its article
  projects.forEach(project => {
      const article = document.createElement('article');

      // Create the heading dynamically
      const heading = document.createElement(headingLevel);
      heading.textContent = project.title;

      article.innerHTML = `
      <h3>${project.title}</h3>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
      `;

      // // Create the image element
      // const img = document.createElement('img');
      // img.src = project.image;
      // img.alt = project.title;

      // // Create the paragraph element
      // const description = document.createElement('p');
      // description.textContent = project.description;

      // // Append elements to the article
      // article.appendChild(heading);
      // article.appendChild(img);
      // article.appendChild(description);

      // Append the article to the container
      containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}