// W5 — Grouped bar chart: 55″ TV technology comparison

const drawTechComparisonBars = (row55) => {
  const barData = formatKeys.map((key) => ({
    id: key,
    label: formatsInfo.find((f) => f.id === key).label,
    energy: row55[key]
  }));

  const svg = d3.select("#bars").append("svg").attr("viewBox", [0, 0, width, height]);

  const innerChart = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

  drawPlotBackground(innerChart, innerWidth, innerHeight);

  drawDashedGrid(innerChart, xScale, yScale, d3.axisBottom(xScale), 6);

  innerChart
    .selectAll(".tech-bar")
    .data(barData)
    .join("rect")
    .attr("class", (d) => `tech-bar tech-bar--${d.id}`)
    .attr("x", (d) => xScale(d.id))
    .attr("width", xScale.bandwidth())
    .attr("y", innerHeight)
    .attr("height", 0)
    .attr("fill", (d) => colorScale(d.id))
    .attr("rx", 6)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .transition()
    .duration(650)
    .delay((_, i) => i * 100)
    .ease(d3.easeCubicOut)
    .attr("y", (d) => yScale(d.energy))
    .attr("height", (d) => innerHeight - yScale(d.energy));

  innerChart
    .selectAll(".tech-bar-label")
    .data(barData)
    .join("text")
    .attr("class", "tech-bar-label")
    .attr("x", (d) => xScale(d.id) + xScale.bandwidth() / 2)
    .attr("y", (d) => yScale(d.energy) - 8)
    .attr("text-anchor", "middle")
    .attr("fill", chartTheme.text)
    .attr("font-size", 11)
    .attr("font-weight", 600)
    .attr("opacity", 0)
    .text((d) => `${Math.round(d.energy)}`)
    .transition()
    .delay((_, i) => 400 + i * 100)
    .attr("opacity", 1);

  styleAxis(
    innerChart
      .append("g")
      .attr("class", "axis-x")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((id) => formatsInfo.find((f) => f.id === id).label))
  );

  styleAxis(
    innerChart.append("g").attr("class", "axis-y").call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format("d")))
  );

  appendInnerAxisLabel(innerChart, "Screen technology", innerHeight);
  appendAxisLabelSvg(svg, "Mean energy (kWh/year)", margin, innerHeight, "y");

  logChartAxes(
    "55″ TV technology comparison",
    axisLabels.bar.x,
    xScale.domain(),
    axisLabels.bar.y,
    yScale.domain(),
    barData
  );

  innerChart
    .selectAll(".tech-bar")
    .on("mouseenter", function (event, d) {
      showChartTooltip(
        `<strong>55″ ${d.label}</strong><br>${Math.round(d.energy)} kWh/year (mean labelled)`,
        event
      );
      d3.select(this).attr("opacity", 0.85);
    })
    .on("mousemove", (event) => {
      chartTooltip.style("left", `${event.clientX + 14}px`).style("top", `${event.clientY - 12}px`);
    })
    .on("mouseleave", function () {
      hideChartTooltip();
      d3.select(this).attr("opacity", 1);
    });
};
