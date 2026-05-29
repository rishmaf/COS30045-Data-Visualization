// Exercise 6.1 — shared constants and helpers

const CSV_PATH = "./Ex6_TVdata.csv/Ex6_TVdata.csv";

const width = 960;
const height = 420;
const margin = { top: 36, right: 24, bottom: 48, left: 56 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const techColors = {
  LCD: "#76B6C2",
  LED: "#4CB8D9",
  OLED: "#ED7864"
};

const tooltip = d3.select("#chart-tooltip");

function showTooltip(html, event) {
  tooltip
    .html(html)
    .classed("visible", true)
    .style("left", `${event.clientX + 14}px`)
    .style("top", `${event.clientY - 12}px`);
}

function hideTooltip() {
  tooltip.classed("visible", false);
}

function parseRow(row) {
  return {
    brand: row.brand,
    model: row.model,
    screenSize: +row.screenSize,
    screenTech: row.screenTech,
    energyConsumption: +row.energyConsumption,
    star: +row.star
  };
}

function loadTvData() {
  if (location.protocol === "file:" && window.EMBEDDED_TV_DATA) {
    return Promise.resolve(d3.csvParse(window.EMBEDDED_TV_DATA, parseRow));
  }
  return d3.csv(CSV_PATH, parseRow);
}

function getFilterState() {
  const tech = document.getElementById("filter-tech").value;
  const minSize = +document.getElementById("filter-size-min").value;
  const maxSize = +document.getElementById("filter-size-max").value;
  return { tech, minSize, maxSize };
}

function filterData(data) {
  const { tech, minSize, maxSize } = getFilterState();
  return data.filter((d) => {
    if (tech !== "all" && d.screenTech !== tech) return false;
    if (d.screenSize < minSize || d.screenSize > maxSize) return false;
    return true;
  });
}

function updateFilterSummary(filtered, total) {
  d3.select("#filter-summary").text(
    `Showing ${filtered.length} of ${total} TV models`
  );
}
