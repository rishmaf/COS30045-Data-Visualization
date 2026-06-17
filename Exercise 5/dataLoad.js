// W5 — Load TV energy data and run charts

const CSV_55 = "./Ex5_TV_energy_55inchtv_byScreenType.csv";
const CSV_ALL = "./Ex5_TV_energy_Allsizes_byScreenType.csv";

const ENERGY_COL = "Mean(Labelled energy consumption (kWh/year))";

function screenToId(screen) {
  const map = { LCD: "lcd", LED: "led", OLED: "oled" };
  return map[screen] || screen.toLowerCase();
}

function parseTvCsv(text) {
  return d3.csvParse(text, (row) => ({
    screen: row.Screen_Tech,
    energy: +row[ENERGY_COL]
  }));
}

function rowsToChartRow(rows, year) {
  const chartRow = { year, label: groupLabels[year] };
  rows.forEach((r) => {
    chartRow[screenToId(r.screen)] = r.energy;
  });
  return chartRow;
}

function loadTvDatasets() {
  if (window.EMBEDDED_TV_55 && window.EMBEDDED_TV_ALL) {
    return Promise.resolve({
      inch55: rowsToChartRow(parseTvCsv(window.EMBEDDED_TV_55), "55inch"),
      allSizes: rowsToChartRow(parseTvCsv(window.EMBEDDED_TV_ALL), "allsizes")
    });
  }

  return Promise.all([
    d3.csv(CSV_55, (row) => ({
      screen: row.Screen_Tech,
      energy: +row[ENERGY_COL]
    })),
    d3.csv(CSV_ALL, (row) => ({
      screen: row.Screen_Tech,
      energy: +row[ENERGY_COL]
    }))
  ]).then(([rows55, rowsAll]) => ({
    inch55: rowsToChartRow(rows55, "55inch"),
    allSizes: rowsToChartRow(rowsAll, "allsizes")
  }));
}

loadTvDatasets()
  .then((datasets) => {
    logEmbeddedStatus();
    return datasets;
  })
  .then(({ inch55, allSizes }) => {
    console.log("55″ TV data (bar chart):", inch55);
    console.log("All sizes TV data (donut chart):", allSizes);

    defineBarScales(inch55);
    drawTechComparisonBars(inch55);
    addLegend(".legend-container--bars");

    drawDonutChart(allSizes);
    addLegend(".legend-container--donut");
  })
  .catch((err) => console.error("Could not load TV energy data:", err));
