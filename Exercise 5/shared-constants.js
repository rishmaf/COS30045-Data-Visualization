// W5 — Shared layout and theme (5.1 + 5.2)

const chartTheme = {
  primary: "#2563eb",
  primaryLight: "#93c5fd",
  primaryPale: "#eaf2ff",
  text: "#1a2332",
  muted: "#5c6b7a",
  border: "#d4dde6",
  grid: "#e2e8f0",
  plotBg: "#fafcfe",
  plotBgEnd: "#f0f4f8",
  font: '"Segoe UI", system-ui, sans-serif',
  arcHigh: "#c96b7f",
  arcLow: "#7fa392",
  arcTrack: "#eef2f6"
};

const width = 1000;
const height = 520;
const margin = { top: 40, right: 32, bottom: 64, left: 72 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const formatsInfo = [
  { id: "lcd", label: "LCD", color: "#5a9baa", light: "#8ec4d0" },
  { id: "led", label: "LED", color: "#2e9bb8", light: "#6ec9e3" },
  { id: "oled", label: "OLED", color: "#d4634f", light: "#f0998a" }
];

const formatKeys = formatsInfo.map((f) => f.id);

const groupLabels = {
  "55inch": "55 inch TVs",
  allsizes: "All screen sizes"
};

const axisLabels = {
  line: { x: "Year (1998–2024)", y: "Price ($/MWh)" },
  bar: { x: "Screen technology", y: "Mean energy (kWh/year)" },
  scatter: { x: "Star rating", y: "Energy consumption (kWh/year)" }
};
