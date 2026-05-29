// Scatter plot — SVG tooltip

const scatterTooltipW = 148;
const scatterTooltipH = 44;

function createScatterTooltip() {
  const tooltip = scatterInnerChart
    .append("g")
    .attr("class", "scatter-tooltip")
    .style("opacity", 0);

  tooltip
    .append("rect")
    .attr("width", scatterTooltipW)
    .attr("height", scatterTooltipH)
    .attr("rx", 8)
    .attr("fill", "#1a2332")
    .attr("fill-opacity", 0.92)
    .attr("filter", "url(#scatter-tooltip-shadow)");

  tooltip
    .append("text")
    .attr("class", "scatter-tooltip-title")
    .attr("x", scatterTooltipW / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .style("font-size", "11px")
    .style("font-weight", 700);

  tooltip
    .append("text")
    .attr("class", "scatter-tooltip-value")
    .attr("x", scatterTooltipW / 2)
    .attr("y", 32)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.85)")
    .style("font-size", "10px");
}

function handleScatterMouseEvents() {
  scatterInnerChart
    .selectAll("circle.scatter-point")
    .on("mouseenter", (e, d) => {
      d3.select(e.currentTarget)
        .attr("r", 7)
        .attr("fill-opacity", 1)
        .attr("stroke-width", 2)
        .attr("stroke", "#fff");

      d3.select(".scatter-tooltip .scatter-tooltip-title").text(`${d.brand} · ${d.model}`);
      d3.select(".scatter-tooltip .scatter-tooltip-value").text(
        `${d.star} stars · ${d.energyConsumption} kWh/yr · ${d.screenSize}" ${d.screenTech}`
      );

      const cx = +e.target.getAttribute("cx");
      const cy = +e.target.getAttribute("cy");

      d3.select(".scatter-tooltip")
        .raise()
        .attr(
          "transform",
          `translate(${cx - scatterTooltipW / 2}, ${cy - scatterTooltipH - 14})`
        )
        .transition()
        .duration(180)
        .style("opacity", 1);
    })
    .on("mouseleave", (e, d) => {
      d3.select(e.currentTarget)
        .attr("r", 3.5)
        .attr("fill", scatterPointColor(d))
        .attr("fill-opacity", 0.6)
        .attr("stroke-width", 0.6);

      d3.select(".scatter-tooltip").transition().duration(150).style("opacity", 0);
    });
}
