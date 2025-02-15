// Global variables
let data = [];
let commits = [];
let xScale, yScale;

// Function to load and parse the CSV file
async function loadData() {
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line), // Convert to number
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));

  displayStats();
  createScatterplot();
}

// Process commits and extract useful metadata
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];

      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: `https://github.com/YOUR_REPO/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60, 
        totalLines: lines.length, 
      };

      // Hide the original lines array
      Object.defineProperty(ret, "lines", {
        value: lines,
        enumerable: false,
        configurable: false,
        writable: false,
      });

      return ret;
    });
}

// Function to display summary statistics in the HTML
function displayStats() {
    // Process commits before displaying stats
    processCommits();
  
    // Create the <dl> element for displaying stats
    const dl = d3.select("#stats").append("dl").attr("class", "stats");

    // Add total commits
    dl.append("dt").text("Commits");
    dl.append("dd").text(commits.length);

    addStat(dl, "Files", d3.group(data, (d) => d.file).size);
  
    // Add total Lines of Code (LOC)
    dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append("dd").text(data.length);

    addStat(dl, "Max Lines", d3.max(data, (d) => d.line));
    // addStat(dl, "Longest file (lines)", d3.max(data, (d) => d.length));
    // addStat(dl, "Average file length (lines)", d3.mean(data, (d) => d.length).toFixed(2));
    // addStat(dl, "Average line length (characters)", d3.mean(data, (d) => d.length).toFixed(2));
    addStat(dl, "Max Depth", d3.max(data, (d) => d.depth));
    // addStat(dl, "Deepest line", d3.max(data, (d) => d.depth));
    // addStat(dl, "Average depth", d3.mean(data, (d) => d.depth).toFixed(2));
  
    // Calculate most active time of day (morning, afternoon, evening, night)
    const workByPeriod = d3.rollups(
      data,
      (v) => v.length,
      (d) => new Date(d.datetime).toLocaleString("en", { dayPeriod: "short" })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    // addStat(dl, "Most active time of day", maxPeriod);
  
    // Calculate most active day of the week
    const workByDay = d3.rollups(
      data,
      (v) => v.length,
      (d) => new Date(d.datetime).toLocaleString("en", { weekday: "long" })
    );
    const maxDay = d3.greatest(workByDay, (d) => d[1])?.[0];
    // addStat(dl, "Most active day of the week", maxDay);
  }
  
  function addStat(dl, label, value) {
    dl.append("dt").text(label);
    dl.append("dd").text(value);
  }

// Run loadData() once the page is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
});

function createScatterplot() {
    const width = window.innerWidth * 0.9;  
    const height = 800;

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  
    // Select the container and append an SVG
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%")  // Makes it responsive
        .style("overflow", "visible");
  
    // Define X and Y scales
    xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([0, width])
      .nice();
  
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
    .scaleSqrt() // Change only this line
    .domain([minLines, maxLines])
    .range([2, 30]);

    dots
    .selectAll('circle').data(sortedCommits).join('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', function (event, d, i) {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })
    
    .on('mouseleave', function (event, d) {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
        updateTooltipContent({});
        updateTooltipVisibility(false)
    
    });
      
    const margin = { top: 10, right: 0, bottom: 30, left: 30 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };
      
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append("g")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(xAxis) 
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .selectAll("text")  
    .attr("dy", "1em") 
    .attr("text-anchor", "middle");

    // Add Y axis with larger text and better spacing
    svg
    .append("g")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .call(yAxis)
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .selectAll("text")
    .attr("dx", "-0.5em") 
    .attr("text-anchor", "end");

    // Add gridlines BEFORE the axes
    const gridlines = svg
      .append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    brushSelector();    
  }

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines_edited = document.getElementById('commit-lines-edited');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.time;
  author.textContent = commit.author;
  lines_edited.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) {
    return false;
  }
  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        return;
    }

    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Clear existing content
    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        const langDiv = document.createElement('div'); // Wrap in a div
        langDiv.innerHTML = `
            <dt>${language}</dt>
            <dd>${count} lines</dd>
            <dd>(${formatted})</dd>
        `;
        container.appendChild(langDiv);
    }
}




