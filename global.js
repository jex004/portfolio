console.log("IT'S ALIVE!");

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'CV/', title: 'CV' },
  { url: 'https://github.com/jex004', title: 'GitHub' }
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create and prepend the nav element
let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust URLs for non-home pages
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Create the link
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  // Add the link to the navigation
  nav.append(a);
}
