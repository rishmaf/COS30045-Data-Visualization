// Set up dimensions and margins
const margin = { top: 40, right: 30, bottom: 60, left: 70 };
const width = 1000;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Colours
const bodyBackgroundColor = "#f4efe6";
const barColor = "#6c6f70";
const barStrokeColor = bodyBackgroundColor;

// Histogram scales
const xScale = d3.scaleLinear().range([0, innerWidth]);
const yScale = d3.scaleLinear().range([innerHeight, 0]);

// Bin generator
const binGenerator = d3.bin()
    .value(d => d.energyConsumption)
    .thresholds(10);

// Screen technology filters
const filters_screen = [
    { id: "all", label: "All", isActive: true },
    { id: "LED", label: "LED", isActive: false },
    { id: "LCD", label: "LCD", isActive: false },
    { id: "OLED", label: "OLED", isActive: false }
];

// Screen size filters
const filters_size = [
    { id: "all", label: "All Sizes", isActive: true },
    { id: 24, label: '24"', isActive: false },
    { id: 32, label: '32"', isActive: false },
    { id: 55, label: '55"', isActive: false },
    { id: 65, label: '65"', isActive: false },
    { id: 98, label: '98"', isActive: false }
];

/* =========================
   Scatterplot constants
========================= */

// separate inner chart for scatterplot
let innerChartS;

// separate scales for scatterplot
const xScaleS = d3.scaleLinear().range([0, innerWidth]);
const yScaleS = d3.scaleLinear().range([innerHeight, 0]);

// tooltip size
const tooltipWidth = 90;
const tooltipHeight = 34;

// colour scale for screen technology
const colorScale = d3.scaleOrdinal()
    .domain(["LED", "LCD", "OLED"])
    .range(["#d76f1a", "#5f8fc2", "#8a4fb3"]);
