// W6.2 — SVG tooltip on scatter plot (Dufour & Meeks Ch 6)

const createTooltip = () => {
  const tooltip = lineInnerChart
    .append("g")
    .attr("class", "tooltip")
    .style("opacity", 0);

  tooltip
    .append("rect")
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", "#1a2332")
    .attr("fill-opacity", 0.92)
    .attr("filter", "url(#tooltip-shadow)");

  tooltip
    .append("text")
    .attr("class", "tooltip-title")
    .attr("x", tooltipWidth / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .style("font-size", "11px")
    .style("font-weight", 700);

  tooltip
    .append("text")
    .attr("class", "tooltip-value")
    .attr("x", tooltipWidth / 2)
    .attr("y", 32)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.85)")
    .style("font-size", "10px");
};

const handleMouseEvents = (filterId) => {
  lineInnerChart
    .selectAll("circle.data-point")
    .on("mouseenter", (e, d) => {
      const col = pointColor(d, filterId);

      d3.select(e.currentTarget)
        .attr("r", 7)
        .attr("fill-opacity", 1)
        .attr("stroke-width", 2)
        .attr("stroke", "#fff");

      d3.select(".tooltip .tooltip-title").text(`${d.brand} · ${d.model}`);
      d3.select(".tooltip .tooltip-value").text(
        `${d.star} stars · ${d.energyConsumption} kWh/yr · ${d.screenSize}" ${d.screenTech}`
      );

      const cx = +e.target.getAttribute("cx");
      const cy = +e.target.getAttribute("cy");

      d3.select(".tooltip")
        .raise()
        .attr(
          "transform",
          `translate(${cx - tooltipWidth / 2}, ${cy - tooltipHeight - 14})`
        )
        .transition()
        .duration(180)
        .style("opacity", 1);
    })
    .on("mouseleave", (e, d) => {
      d3.select(e.currentTarget)
        .attr("r", filterId === "all" ? 3.5 : 4.5)
        .attr("fill", pointColor(d, filterId))
        .attr("fill-opacity", filterId === "all" ? 0.55 : 0.75)
        .attr("stroke", pointColor(d, filterId))
        .attr("stroke-width", 0.5);

      d3.select(".tooltip")
        .transition()
        .duration(150)
        .style("opacity", 0);
    });
};
