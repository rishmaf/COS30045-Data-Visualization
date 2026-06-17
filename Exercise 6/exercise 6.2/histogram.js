// W6.2 — Histogram with filter animation

let histSvg;

function getHistBins(filterId, values) {
  const { thresholds } = histBinSettings[filterId] || histBinSettings.all;
  return d3.bin().domain(xScale.domain()).thresholds(thresholds)(values);
}

function histBarLayout(d, filterId) {
  const cfg = histBinSettings[filterId] || histBinSettings.all;
  const x0 = xScale(d.x0);
  const x1 = xScale(d.x1);
  const step = Math.max(0, x1 - x0);
  const inset = step * cfg.padding;

  return {
    x: x0 + inset / 2,
    width: Math.max(cfg.minWidth, step - inset),
    rx: cfg.rx
  };
}

const drawHistogram = () => {
  histSvg = d3
    .select("#histogram")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  innerChart = histSvg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  innerChart
    .append("g")
    .attr("class", "axis-x")
    .attr("transform", `translate(0, ${innerHeight})`);

  innerChart.append("g").attr("class", "axis-y");

  appendAxisLabels(innerChart, "histogram");

  updateHistogram("all", allData);
};

const updateHistogram = (filterId, data) => {
  const updatedData = filterById(data, filterId);
  const values = updatedData.map((d) => d.energyConsumption);
  const updatedBins = getHistBins(filterId, values);
  const maxCount = d3.max(updatedBins, (d) => d.length) || 1;
  const barColor = getFilterColor(filterId);

  yScale.domain([0, maxCount]).nice().range([innerHeight, 0]);

  logChartAxes("histogram", filterId, xScale.domain(), yScale.domain(), updatedData);

  ensureHistGradient(histSvg, filterId);

  innerChart.selectAll(".grid").remove();
  drawGrid(innerChart, xScale, yScale);

  innerChart.select(".axis-x").raise().call(d3.axisBottom(xScale).ticks(8));
  innerChart
    .select(".axis-y")
    .raise()
    .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format("d")));

  innerChart.selectAll(".axis-label").raise();

  const bars = innerChart
    .selectAll("rect.hist-bar")
    .data(updatedBins, (d) => `${d.x0}-${d.x1}`)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "hist-bar")
          .attr("x", (d) => histBarLayout(d, filterId).x)
          .attr("width", (d) => histBarLayout(d, filterId).width)
          .attr("rx", (d) => histBarLayout(d, filterId).rx)
          .attr("y", innerHeight)
          .attr("height", 0)
          .attr("fill", `url(#${histGradientId})`)
          .attr("stroke", barColor)
          .attr("stroke-width", 0)
          .attr("stroke-opacity", 0.35),
      (update) => update,
      (exit) => exit.transition().duration(300).attr("height", 0).attr("y", innerHeight).remove()
    );

  bars
    .transition()
    .duration(500)
    .ease(d3.easeCubicInOut)
    .attr("x", (d) => histBarLayout(d, filterId).x)
    .attr("width", (d) => histBarLayout(d, filterId).width)
    .attr("rx", (d) => histBarLayout(d, filterId).rx)
    .attr("y", (d) => yScale(d.length))
    .attr("height", (d) => Math.max(0, innerHeight - yScale(d.length)))
    .attr("fill", `url(#${histGradientId})`)
    .attr("stroke", barColor);

  bars
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("opacity", 1).attr("stroke-width", 1.5);
      showHtmlTooltip(
        `<strong>${d.length} models</strong><br>${Math.round(d.x0)} – ${Math.round(d.x1)} kWh/year`,
        event
      );
    })
    .on("mousemove", (event) => {
      htmlTooltip
        .style("left", `${event.clientX + 16}px`)
        .style("top", `${event.clientY - 14}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("opacity", null).attr("stroke-width", 0);
      hideHtmlTooltip();
    });
};
