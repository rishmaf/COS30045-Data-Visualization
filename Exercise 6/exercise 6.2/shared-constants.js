// W6.2 — Shared constants (Dufour & Meeks Ch 6)

const margin = { top: 44, right: 28, bottom: 64, left: 72 };

const axisLabels = {
  histogram: {
    x: "Energy consumption (kWh/year)",
    y: "Number of TV models"
  },
  scatter: {
    x: "Star rating",
    y: "Annual energy consumption (kWh/year)"
  }
};
const width = 1000;
const height = 480;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const tooltipWidth = 148;
const tooltipHeight = 44;

const CSV_PATH = "./Ex6_TVdata.csv/Ex6_TVdata.csv";

const techColors = {
  all: { main: "#2563eb", light: "#60a5fa", pale: "#eaf2ff" },
  LCD: { main: "#4a8f9c", light: "#76b6c2", pale: "#e8f4f6" },
  LED: { main: "#2a9cb8", light: "#5ec9e8", pale: "#e6f6fb" },
  OLED: { main: "#c94a38", light: "#ed7864", pale: "#fdf0ee" }
};

let filters = [
  { id: "all", label: "All technologies", isActive: true },
  { id: "LCD", label: "LCD", isActive: false },
  { id: "LED", label: "LED", isActive: false },
  { id: "OLED", label: "OLED", isActive: false }
];

let allData = [];
let innerChart;
let lineInnerChart;
let histGradientId = "hist-gradient";
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();
const lineXScale = d3.scaleLinear();
const lineYScale = d3.scaleLinear();

/** Bin count and bar inset per filter (wider bars when fewer models) */
const histBinSettings = {
  all: { thresholds: 16, padding: 0.1, minWidth: 8, rx: 5 },
  LCD: { thresholds: 14, padding: 0.12, minWidth: 10, rx: 5 },
  LED: { thresholds: 14, padding: 0.12, minWidth: 10, rx: 5 },
  OLED: { thresholds: 12, padding: 0.14, minWidth: 12, rx: 6 }
};

function getFilterColor(filterId) {
  return (techColors[filterId] || techColors.all).main;
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
  if (window.EMBEDDED_TV_DATA) {
    return Promise.resolve(d3.csvParse(window.EMBEDDED_TV_DATA, parseRow));
  }
  if (location.protocol === "file:") {
    return Promise.reject(
      new Error("No embedded data. Run: python build_embedded.py")
    );
  }
  return d3.csv(CSV_PATH, parseRow);
}

function filterById(data, filterId) {
  return filterId === "all"
    ? data
    : data.filter((d) => d.screenTech === filterId);
}

function aggregateByScreenSize(data) {
  return Array.from(
    d3.rollup(
      data,
      (v) => d3.mean(v, (d) => d.energyConsumption),
      (d) => d.screenSize
    ),
    ([screenSize, avgEnergy]) => ({ screenSize, avgEnergy })
  ).sort((a, b) => a.screenSize - b.screenSize);
}

const defineScales = (data) => {
  const [minEnergy, maxEnergy] = d3.extent(data, (d) => d.energyConsumption);
  xScale.domain([minEnergy, maxEnergy]).range([0, innerWidth]);

  const maxStar = d3.max(data, (d) => d.star);
  lineXScale.domain([0, maxStar]).range([0, innerWidth]);
  lineYScale
    .domain(d3.extent(data, (d) => d.energyConsumption))
    .nice()
    .range([innerHeight, 0]);
};
