// W5 — Scales for 55″ bar chart

const xScale = d3.scaleBand();
const yScale = d3.scaleLinear();
const colorScale = d3.scaleOrdinal();

const defineBarScales = (row55) => {
  xScale.domain(formatKeys).range([0, innerWidth]).padding(0.38);

  const maxEnergy = d3.max(formatKeys, (key) => row55[key]);
  yScale.domain([0, maxEnergy]).nice().range([innerHeight, 0]);

  colorScale.domain(formatKeys).range(formatsInfo.map((f) => f.color));
};
