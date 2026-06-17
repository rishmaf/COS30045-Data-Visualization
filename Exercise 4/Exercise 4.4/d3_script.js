// Exercise 4.4 – container, one bar, data in console

const CSV_PATH = "data/Ex5_TV_energy_55inchtv_byScreenType.csv";
const scriptEl = document.currentScript;

function parseRow(d) {
  return {
    screen: d.Screen_Tech,
    energy: +d["Mean(Labelled energy consumption (kWh/year))"]
  };
}

function loadCsvData() {
  const embedded = document.getElementById("embedded-csv");
  if (embedded) {
    return Promise.resolve(d3.csvParse(embedded.textContent.trim(), parseRow));
  }
  return d3.csv(CSV_PATH, parseRow);
}

function runWithData(data) {
  data.sort((a, b) => d3.descending(a.energy, b.energy));
  const top = data[0];
  const root = d3ChartContainer(scriptEl);
  root.selectAll("*").remove();
  const svg = root
    .append("svg")
    .attr("viewBox", "0 0 900 120")
    .style("border", "1px solid black");
  svg
    .append("rect")
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", top ? top.energy * 1.07 : 414)
    .attr("height", 16)
    .attr("fill", "#2563eb");
  logChartConsole(
    "Exercise 4.4 — single bar preview",
    data,
    "Mean labelled energy consumption (kWh/year)",
    [0, top ? top.energy : 0],
    "Screen type",
    data.map((d) => d.screen)
  );
}

loadCsvData()
  .then(runWithData)
  .catch(() => {
    runWithData(
      d3.csvParse(document.getElementById("embedded-csv").textContent.trim(), parseRow)
    );
  });
