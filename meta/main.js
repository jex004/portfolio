// Global variables
let data = [];
let commits = [];

// Function to load and parse the CSV file
async function loadData() {
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: Number(row.line), // Convert to number
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone), // Convert to Date object
    datetime: new Date(row.datetime), // Convert full datetime
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

const width = 1000;
const height = 600;

function createScatterplot() {
  
    // Select the container and append an SVG
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");
  
    // Define X and Y scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([0, width])
      .nice();
  
    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  
    // Append circles for each commit
    svg
      .append("g")
      .attr("class", "dots")
      .selectAll("circle")
      .data(commits)
      .join("circle")
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr("r", 5)
      .attr("fill", "steelblue");
  }


