// W5 — Shared chart styling helpers

const chartTooltip = d3.select("#chart-tooltip");

function showChartTooltip(html, event) {
  chartTooltip
    .html(html)
    .classed("visible", true)
    .style("left", `${event.clientX + 14}px`)
    .style("top", `${event.clientY - 12}px`);
}

function hideChartTooltip() {
  chartTooltip.classed("visible", false);
}

function formatAxisValue(value) {
  return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
}

function formatDomainRange(domain) {
  if (domain[0] instanceof Date) {
    return `${domain[0].getFullYear()} → ${domain[1].getFullYear()}`;
  }
  return `${formatAxisValue(domain[0])} → ${formatAxisValue(domain[1])}`;
}

let embeddedStatusLogged = false;

function logChartAxes(chartTitle, xLabel, xDomain, yLabel, yDomain, data) {
  console.group(chartTitle);
  if (data !== undefined) {
    console.log("Data:", data);
    if (Array.isArray(data)) console.log("Row count:", data.length);
  }
  console.log(`X-axis: "${xLabel}" | range: ${formatDomainRange(xDomain)}`);
  console.log(`Y-axis: "${yLabel}" | range: ${formatDomainRange(yDomain)}`);
  console.groupEnd();
}

function logEmbeddedStatus() {
  if (embeddedStatusLogged) return;
  embeddedStatusLogged = true;

  console.log("Embedded data available:", {
    spotPrices: Boolean(window.EMBEDDED_PRICES_CSV),
    tv55inch: Boolean(window.EMBEDDED_TV_55),
    tvAllSizes: Boolean(window.EMBEDDED_TV_ALL),
    tvModelsScatter: Boolean(window.EMBEDDED_TV_DATA)
  });
  if (location.protocol === "file:") {
    console.info(
      "Note: file:// security message in console is normal. Charts use embeddedData.js — data and axes below confirm load."
    );
  }
}

function styleAxis(g) {
  g.call((sel) =>
    sel.select(".domain").attr("stroke", chartTheme.border).attr("stroke-width", 1.25)
  )
    .call((sel) =>
      sel.selectAll(".tick line").attr("stroke", chartTheme.border).attr("stroke-width", 1)
    )
    .call((sel) =>
      sel
        .selectAll(".tick text")
        .attr("fill", chartTheme.muted)
        .attr("font-size", "11px")
        .attr("font-family", chartTheme.font)
    );
}

function drawPlotBackground(parent, w, h, radius = 10) {
  const svg = d3.select(parent.node().ownerSVGElement);
  let defsSel = svg.select("defs");
  if (defsSel.empty()) {
    defsSel = svg.append("defs");
  }

  if (defsSel.select("#plot-area-gradient").empty()) {
    const grad = defsSel
      .append("linearGradient")
      .attr("id", "plot-area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", chartTheme.plotBg);
    grad.append("stop").attr("offset", "100%").attr("stop-color", chartTheme.plotBgEnd);
  }

  return parent
    .insert("rect", ":first-child")
    .attr("class", "plot-bg")
    .attr("width", w)
    .attr("height", h)
    .attr("rx", radius)
    .attr("ry", radius)
    .attr("fill", "url(#plot-area-gradient)")
    .attr("stroke", chartTheme.border);
}

function drawDashedGrid(chart, xScale, yScale, xTickFn, yTicks = 6) {
  chart
    .append("g")
    .attr("class", "grid grid-x")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(
      (xTickFn || d3.axisBottom(xScale).ticks(8))
        .tickSize(-innerHeight)
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g.selectAll(".tick line").attr("stroke", chartTheme.grid).attr("stroke-dasharray", "4 5")
    );

  chart
    .append("g")
    .attr("class", "grid grid-y")
    .call(
      d3
        .axisLeft(yScale)
        .ticks(yTicks)
        .tickSize(-innerWidth)
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g.selectAll(".tick line").attr("stroke", chartTheme.grid).attr("stroke-dasharray", "4 5")
    );
}

function appendAxisLabelSvg(svg, text, margin, innerH, side = "y") {
  if (side === "y") {
    svg
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + innerH / 2))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", chartTheme.text)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("font-family", chartTheme.font)
      .text(text);
  } else {
    svg
      .append("text")
      .attr("class", "axis-label axis-label--x")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", margin.top + innerH + 52)
      .attr("text-anchor", "middle")
      .attr("fill", chartTheme.text)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("font-family", chartTheme.font)
      .text(text);
  }
}

function appendInnerAxisLabel(chart, text, innerH) {
  chart
    .append("text")
    .attr("class", "axis-label axis-label--x")
    .attr("x", innerWidth / 2)
    .attr("y", innerH + 48)
    .attr("text-anchor", "middle")
    .attr("fill", chartTheme.text)
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("font-family", chartTheme.font)
    .text(text);
}
