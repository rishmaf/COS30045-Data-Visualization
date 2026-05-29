// Exercise 4.3 – load and format CSV data for D3 (Steps 1–3)

// Step 3 (next exercise): build the bar chart from typed data
const createBarChart = (data) => {
  // Visualisation is built in Exercise 4.4 (scaling and labelling)
};

const CSV_PATH = "data/Ex5_TV_energy_55inchtv_byScreenType.csv";

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
  logChartConsole(
    "Exercise 4.3 — CSV load (chart in 4.4+)",
    data,
    "Mean labelled energy consumption (kWh/year)",
    [0, d3.max(data, (d) => d.energy)],
    "Screen type",
    data.map((d) => d.screen)
  );
  createBarChart(data);
}

loadCsvData()
  .then(runWithData)
  .catch(() => {
    runWithData(
      d3.csvParse(document.getElementById("embedded-csv").textContent.trim(), parseRow)
    );
  });
