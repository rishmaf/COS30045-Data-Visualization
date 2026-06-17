// Exercise 6.1 — Scatter plot with colour coding and tooltips

let scatterRoot;

const drawScatterLegend = () => {
  const legend = d3.select("#scatter-legend");
  legend.selectAll("*").remove();
  Object.entries(techColors).forEach(([tech, color]) => {
    const item = legend.append("div").attr("class", "legend-item");
    item.append("span").attr("class", "legend-swatch").style("background", color);
    item.append("span").text(tech);
  });
};

const drawScatter = (allData) => {
  drawScatterLegend();

  const svg = d3
    .select("#scatter")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  scatterRoot = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  updateScatter(allData);
};

const updateScatter = (allData) => {
  const data = filterData(allData);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.screenSize))
    .nice()
    .range([0, innerWidth]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.energyConsumption))
    .nice()
    .range([innerHeight, 0]);

  scatterRoot.selectAll("*").remove();

  scatterRoot
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => x(d.screenSize))
    .attr("cy", (d) => y(d.energyConsumption))
    .attr("r", 4)
    .attr("fill", (d) => techColors[d.screenTech] || "#999")
    .attr("fill-opacity", 0.65)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.8)
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("r", 7).attr("fill-opacity", 1);
      showTooltip(
        `<strong>${d.brand} ${d.model}</strong><br>
         Screen: ${d.screenSize}" ${d.screenTech}<br>
         Energy: ${d.energyConsumption} kWh/year<br>
         Star rating: ${d.star}`,
        event
      );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.clientX + 14}px`)
        .style("top", `${event.clientY - 12}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("r", 4).attr("fill-opacity", 0.65);
      hideTooltip();
    });

  scatterRoot
    .append("g")
    .attr("class", "axis-x")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).ticks(10));

  scatterRoot.append("g").attr("class", "axis-y").call(d3.axisLeft(y).ticks(6));

  d3.select("#scatter")
    .select("svg")
    .selectAll(".axis-label-scatter-x")
    .data([null])
    .join("text")
    .attr("class", "axis-label-scatter-x")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 8)
    .attr("text-anchor", "middle")
    .attr("fill", "#5c6b7a")
    .attr("font-size", 12)
    .text("Screen size (inches)");

  d3.select("#scatter")
    .select("svg")
    .selectAll(".axis-label-scatter-y")
    .data([null])
    .join("text")
    .attr("class", "axis-label-scatter-y")
    .attr("transform", "rotate(-90)")
    .attr("x", -(margin.top + innerHeight / 2))
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("fill", "#5c6b7a")
    .attr("font-size", 12)
    .text("Energy (kWh/year)");
};
