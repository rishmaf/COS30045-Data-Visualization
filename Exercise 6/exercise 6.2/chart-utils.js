// W6.2 — Shared chart helpers

const htmlTooltip = d3.select("#chart-tooltip");

function showHtmlTooltip(html, event) {
  htmlTooltip
    .html(html)
    .classed("visible", true)
    .style("left", `${event.clientX + 16}px`)
    .style("top", `${event.clientY - 14}px`);
}

function hideHtmlTooltip() {
  htmlTooltip.classed("visible", false);
}

function formatAxisValue(value) {
  return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
}

function formatDomainRange(domain) {
  const min = formatAxisValue(domain[0]);
  const max = formatAxisValue(domain[1]);
  return `${min} → ${max}`;
}

function logChartAxes(chartKey, filterId, xDomain, yDomain, data) {
  const labels = axisLabels[chartKey];
  if (!labels) return;

  const chartTitle = chartKey === "histogram" ? "Energy consumption" : "Energy vs star rating";

  console.group(`${chartTitle} — axes (filter: ${filterId})`);
  if (data !== undefined) {
    console.log("Data:", data);
    if (Array.isArray(data)) console.log("Row count:", data.length);
  }
  console.log("X-axis label:", labels.x);
  console.log("X-axis range:", formatDomainRange(xDomain));
  console.log("Y-axis label:", labels.y);
  console.log("Y-axis range:", formatDomainRange(yDomain));
  console.groupEnd();
}

function logDataLoadSummary(data) {
  const row = data[0];
  console.group("W6.2 — TV data loaded");
  console.log("Total rows:", data.length);
  console.log(
    "Sample row:",
    `${row.brand} | ${row.model} | ${row.screenSize}" | ${row.screenTech} | ${row.energyConsumption} kWh/yr | ${row.star} stars`
  );
  console.log("Histogram — X:", axisLabels.histogram.x);
  console.log("Histogram — Y:", axisLabels.histogram.y);
  console.log("Scatter — X:", axisLabels.scatter.x);
  console.log("Scatter — Y:", axisLabels.scatter.y);
  console.log(
    "Data source:",
    window.EMBEDDED_TV_DATA ? "embeddedData.js (parsed in memory, no CSV file fetch)" : "CSV via HTTP"
  );
  console.groupEnd();
}

function appendAxisLabels(chart, chartKey) {
  const labels = axisLabels[chartKey];
  if (!labels) return;

  chart
    .append("text")
    .attr("class", "axis-label axis-label--x")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 48)
    .attr("text-anchor", "middle")
    .text(labels.x);

  chart
    .append("text")
    .attr("class", "axis-label axis-label--y")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -48)
    .attr("text-anchor", "middle")
    .text(labels.y);
}

function drawGrid(chart, xScale, yScale) {
  chart
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(8)
        .tickSize(-innerHeight)
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove());

  chart
    .append("g")
    .attr("class", "grid")
    .call(
      d3
        .axisLeft(yScale)
        .ticks(6)
        .tickSize(-innerWidth)
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove());
}

function ensureHistGradient(svg, filterId) {
  const colors = techColors[filterId] || techColors.all;
  histGradientId = `hist-gradient-${filterId}`;

  let defs = svg.select("defs");
  if (defs.empty()) defs = svg.append("defs");

  defs.select(`#${histGradientId}`).remove();

  const grad = defs
    .append("linearGradient")
    .attr("id", histGradientId)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  grad.append("stop").attr("offset", "0%").attr("stop-color", colors.light);
  grad.append("stop").attr("offset", "100%").attr("stop-color", colors.main);

  return histGradientId;
}
