// W6.2 — Scatter plot: star rating vs energy (colour by screen technology)

let scatterSvg;

function pointColor(d, filterId) {
  if (filterId === "all") {
    return (techColors[d.screenTech] || techColors.all).main;
  }
  return getFilterColor(filterId);
}

const drawScatterLegend = (filterId) => {
  const legend = d3.select("#scatter-legend");
  legend.selectAll("*").remove();

  if (filterId !== "all") {
    legend.style("display", "none");
    return;
  }

  legend.style("display", "flex");
  Object.entries(techColors)
    .filter(([key]) => key !== "all")
    .forEach(([tech, colors]) => {
      const item = legend.append("div").attr("class", "legend-item");
      item.append("span").attr("class", "legend-swatch").style("background", colors.main);
      item.append("span").text(tech);
    });
};

const drawLineChart = () => {
  scatterSvg = d3
    .select("#line-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  lineInnerChart = scatterSvg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  scatterSvg
    .append("defs")
    .append("filter")
    .attr("id", "tooltip-shadow")
    .append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 2)
    .attr("stdDeviation", 3)
    .attr("flood-opacity", 0.25);

  lineInnerChart
    .append("g")
    .attr("class", "line-axis-x")
    .attr("transform", `translate(0, ${innerHeight})`);

  lineInnerChart.append("g").attr("class", "line-axis-y");

  appendAxisLabels(lineInnerChart, "scatter");

  createTooltip();
  updateLineChart("all", allData);
};

const updateLineChart = (filterId, data) => {
  const updatedData = filterById(data, filterId);

  const maxStar = d3.max(updatedData, (d) => d.star);
  const starTicks = [...new Set([0, ...updatedData.map((d) => d.star)])].sort(d3.ascending);

  lineXScale.domain([0, maxStar]).range([0, innerWidth]);

  lineYScale
    .domain(d3.extent(updatedData, (d) => d.energyConsumption))
    .nice()
    .range([innerHeight, 0]);

  logChartAxes("scatter", filterId, lineXScale.domain(), lineYScale.domain(), updatedData);

  lineInnerChart.selectAll(".grid").remove();
  drawGrid(lineInnerChart, lineXScale, lineYScale);

  lineInnerChart
    .select(".line-axis-x")
    .raise()
    .call(d3.axisBottom(lineXScale).tickValues(starTicks).tickFormat((d) => d));
  lineInnerChart.select(".line-axis-y").raise().call(d3.axisLeft(lineYScale).ticks(6));

  lineInnerChart.selectAll(".axis-label").raise();

  lineInnerChart.selectAll(".energy-area, .energy-line").remove();

  drawScatterLegend(filterId);

  const points = lineInnerChart
    .selectAll("circle.data-point")
    .data(updatedData, (d) => `${d.brand}-${d.model}`)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "data-point")
          .attr("r", 0)
          .attr("cx", (d) => lineXScale(d.star))
          .attr("cy", (d) => lineYScale(d.energyConsumption)),
      (update) => update,
      (exit) => exit.transition().duration(300).attr("r", 0).remove()
    );

  points
    .transition()
    .duration(500)
    .ease(d3.easeCubicInOut)
    .attr("cx", (d) => lineXScale(d.star))
    .attr("cy", (d) => lineYScale(d.energyConsumption))
    .attr("r", filterId === "all" ? 3.5 : 4.5)
    .attr("fill", (d) => pointColor(d, filterId))
    .attr("fill-opacity", filterId === "all" ? 0.55 : 0.75)
    .attr("stroke", (d) => pointColor(d, filterId))
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.9);

  handleMouseEvents(filterId);
};
