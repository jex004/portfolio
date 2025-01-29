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

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  if (!project || typeof project !== 'object') {
      console.error('Invalid project data:', project);
      return;
  }

  if (!(containerElement instanceof HTMLElement)) {
      console.error('Invalid container element:', containerElement);
      return;
  }

  // Clear existing content to avoid duplication
  containerElement.innerHTML = '';

  // Validate the heading level (only allow h1-h6)
  if (!/^h[1-6]$/.test(headingLevel)) {
      console.warn(`Invalid heading level "${headingLevel}", defaulting to h2.`);
      headingLevel = 'h2';
  }

  // Create the article element
  const article = document.createElement('article');

  // Populate article content dynamically
  article.innerHTML = `
    <h3>${project.title}</h3>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
`;

  // Append the article to the container
  containerElement.appendChild(article);
}

// export function renderProjects(project, containerElement, headingLevel = 'h2') {
//   // Validate containerElement
//   if (!(containerElement instanceof HTMLElement)) {
//       console.error('Invalid container element');
//       return;
//   }
  
//   // Validate headingLevel to ensure it's a valid HTML heading tag
//   const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
//   if (!validHeadingLevels.includes(headingLevel)) {
//       console.warn(`Invalid heading level: ${headingLevel}. Defaulting to h2.`);
//       headingLevel = 'h2';
//   }
  
//   // Clear existing content
//   containerElement.innerHTML = '';
  
//   // Create an article element
//   const article = document.createElement('article');
  
//   // Handle missing or invalid project properties
//   const title = project.title || 'Untitled Project';
//   const imageSrc = project.image || 'default-image.jpg'; // Provide a fallback image
//   const description = project.description || 'No description available.';
  
//   // Populate the article with dynamic content
//   article.innerHTML = `
//       <${headingLevel}>${title}</${headingLevel}>
//       <img src="${imageSrc}" alt="${title}">
//       <p>${description}</p>
//   `;
  
//   // Append the article to the container
//   containerElement.appendChild(article);
// }
