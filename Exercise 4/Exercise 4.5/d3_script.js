// Exercise 4.5 – D3 binding and drawing with data (Dufour & Meeks Ch 3)

const barHeight = 25;
const barPadding = 5;
const CSV_PATH = "data/Ex5_TV_energy_55inchtv_byScreenType.csv";
const scriptEl = document.currentScript;

const createBarChart = data => {
  const maxEnergy = d3.max(data, (d) => d.count);
  const root = d3ChartContainer(scriptEl);
  root.selectAll("*").remove();
  const svg = root
    .append("svg")
    .attr("viewBox", "0 0 900 120")
    .style("border", "1px solid black");
  logChartConsole(
    "Exercise 4.5 — vertical bars",
    data,
    "Mean labelled energy consumption (kWh/year)",
    [0, maxEnergy],
    "Screen type (row order)",
    data.map((d) => d.screen)
  );

  svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("class", d => `bar bar-${d.count}`)
    .attr("x", 0)
    .attr("y", (d, i) => i * (barHeight + barPadding))
    .attr("width", d => d.count)
    .attr("height", barHeight)
    .attr("fill", "#2980b9");
};

function parseRow(d) {
  return {
    screen: d.Screen_Tech,
    count: +d["Mean(Labelled energy consumption (kWh/year))"]
  };
}

function loadCsvData() {
  const embedded = document.getElementById("embedded-csv");
  if (embedded) {
    return Promise.resolve(d3.csvParse(embedded.textContent.trim(), parseRow));
  }
  return d3.csv(CSV_PATH, parseRow);
}

loadCsvData()
  .then(data => {
    data.sort((a, b) => d3.descending(a.count, b.count));
    createBarChart(data);
  })
  .catch(() => {
    createBarChart(
      d3.csvParse(document.getElementById("embedded-csv").textContent.trim(), parseRow)
    );
  });
