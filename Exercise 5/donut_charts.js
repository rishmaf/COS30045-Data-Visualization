// W5 — Donut: energy consumption by screen technology (all sizes)

function formatPieData(row) {
  return formatKeys.map((key) => ({
    format: key,
    production: row[key]
  }));
}

const drawDonutChart = (rowAllSizes) => {
  const svg = d3
    .select("#donut")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const root = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawPlotBackground(root, innerWidth, innerHeight);

  const cx = innerWidth / 2;
  const cy = innerHeight / 2;

  const group = root.append("g").attr("class", "donut-group--allsizes").attr("transform", `translate(${cx}, ${cy})`);

  group
    .append("circle")
    .attr("r", 118)
    .attr("fill", "#fff")
    .attr("stroke", chartTheme.border)
    .attr("opacity", 0.85);

  const pieGenerator = d3.pie().value((d) => d.production).sort(null);
  const arcGenerator = d3
    .arc()
    .innerRadius(62)
    .outerRadius(108)
    .padAngle(0.025)
    .cornerRadius(6);

  const colorScaleDonut = d3
    .scaleOrdinal()
    .domain(formatKeys)
    .range(formatsInfo.map((f) => f.color));

  const formattedData = formatPieData(rowAllSizes);
  const totalKwhForLog = d3.sum(formattedData, (d) => d.production);

  console.group("Energy consumption by screen technology (all sizes) — donut");
  console.log("Data (mean kWh/yr):", rowAllSizes);
  formattedData.forEach((d) => {
    const tech = formatsInfo.find((f) => f.id === d.format);
    const pct = d.production / totalKwhForLog;
    console.log(`  ${tech.label}: ${Math.round(d.production)} kWh/yr (${d3.format(".1%")(pct)})`);
  });
  console.log("Chart type: pie/donut (share by technology, not X–Y axes)");
  console.groupEnd();

  const annotatedData = pieGenerator(formattedData);

  const arcs = group.selectAll(".arc-slice").data(annotatedData).join("g").attr("class", "arc-slice");

  arcs
    .append("path")
    .attr("fill", (d) => colorScaleDonut(d.data.format))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .attr("d", arcGenerator)
    .attr("opacity", 0)
    .transition()
    .duration(550)
    .delay((_, i) => i * 80)
    .attr("opacity", 1);

  arcs.each(function (d) {
    const pct = (d.endAngle - d.startAngle) / (2 * Math.PI);
    if (pct < 0.04) return;

    const tech = formatsInfo.find((f) => f.id === d.data.format);
    const [x, y] = arcGenerator.centroid(d);

    const label = d3
      .select(this)
      .append("text")
      .attr("class", "arc-label")
      .attr("transform", `translate(${x}, ${y})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("pointer-events", "none");

    label
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "-0.2em")
      .attr("font-size", pct >= 0.12 ? 13 : 11)
      .attr("font-weight", 700)
      .text(tech.label);

    label
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "1.25em")
      .attr("font-size", pct >= 0.12 ? 12 : 10)
      .attr("font-weight", 600)
      .text(d3.format(".1%")(pct));
  });

  const totalKwh = d3.sum(formattedData, (d) => d.production);

  group
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8)
    .attr("fill", chartTheme.text)
    .style("font-size", "14px")
    .style("font-weight", 700)
    .text("All screen sizes");

  group
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", 12)
    .attr("fill", chartTheme.muted)
    .style("font-size", "12px")
    .text(`${Math.round(totalKwh)} kWh/yr`);

  group
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", 30)
    .attr("fill", chartTheme.muted)
    .style("font-size", "10px")
    .text("combined mean");
};
