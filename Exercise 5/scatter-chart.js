// W5 / W6 — Scatter plot: energy vs star rating

const scatterLayout = {
  width: 1000,
  height: 480,
  margin: { top: 40, right: 28, bottom: 64, left: 72 }
};
scatterLayout.innerWidth =
  scatterLayout.width - scatterLayout.margin.left - scatterLayout.margin.right;
scatterLayout.innerHeight =
  scatterLayout.height - scatterLayout.margin.top - scatterLayout.margin.bottom;

const scatterTechColors = {
  LCD: "#5a9baa",
  LED: "#2e9bb8",
  OLED: "#d4634f"
};

let scatterInnerChart;
let scatterXScale;
let scatterYScale;

function parseTvModelRow(row) {
  return {
    brand: row.brand,
    model: row.model,
    screenSize: +row.screenSize,
    screenTech: row.screenTech,
    energyConsumption: +row.energyConsumption,
    star: +row.star
  };
}

function loadTvModelData() {
  if (window.EMBEDDED_TV_DATA) {
    return Promise.resolve(d3.csvParse(window.EMBEDDED_TV_DATA, parseTvModelRow));
  }
  const csvPath = "../exercise 6.2/Ex6_TVdata.csv/Ex6_TVdata.csv";
  return d3.csv(csvPath, parseTvModelRow);
}

function scatterPointColor(d) {
  return scatterTechColors[d.screenTech] || chartTheme.primary;
}

function drawScatterPlot(data) {
  scatterXScale = d3.scaleLinear();
  scatterYScale = d3.scaleLinear();

  const svg = d3
    .select("#scatter-plot")
    .append("svg")
    .attr("viewBox", `0 0 ${scatterLayout.width} ${scatterLayout.height}`);

  svg
    .append("defs")
    .append("filter")
    .attr("id", "scatter-tooltip-shadow")
    .append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 2)
    .attr("stdDeviation", 3)
    .attr("flood-opacity", 0.25);

  scatterInnerChart = svg
    .append("g")
    .attr("transform", `translate(${scatterLayout.margin.left}, ${scatterLayout.margin.top})`);

  drawPlotBackground(scatterInnerChart, scatterLayout.innerWidth, scatterLayout.innerHeight);

  scatterInnerChart
    .append("g")
    .attr("class", "scatter-axis-x")
    .attr("transform", `translate(0, ${scatterLayout.innerHeight})`);
  scatterInnerChart.append("g").attr("class", "scatter-axis-y");

  updateScatterPlot(data);
  createScatterTooltip();
}

function updateScatterPlot(data) {
  const maxStar = d3.max(data, (d) => d.star);
  const starTicks = [...new Set([0, ...data.map((d) => d.star)])].sort(d3.ascending);

  scatterXScale.domain([0, maxStar]).range([0, scatterLayout.innerWidth]);
  scatterYScale
    .domain(d3.extent(data, (d) => d.energyConsumption))
    .nice()
    .range([scatterLayout.innerHeight, 0]);

  const ih = scatterLayout.innerHeight;
  const iw = scatterLayout.innerWidth;

  scatterInnerChart.selectAll(".grid").remove();
  scatterInnerChart
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0, ${ih})`)
    .call(
      d3
        .axisBottom(scatterXScale)
        .tickValues(starTicks)
        .tickSize(-ih)
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g.selectAll(".tick line").attr("stroke", chartTheme.grid).attr("stroke-dasharray", "4 5")
    );
  scatterInnerChart
    .append("g")
    .attr("class", "grid")
    .call(
      d3.axisLeft(scatterYScale).ticks(6).tickSize(-iw).tickFormat("")
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g.selectAll(".tick line").attr("stroke", chartTheme.grid).attr("stroke-dasharray", "4 5")
    );

  styleAxis(
    scatterInnerChart
      .select(".scatter-axis-x")
      .raise()
      .call(d3.axisBottom(scatterXScale).tickValues(starTicks).tickFormat((d) => d))
  );
  styleAxis(
    scatterInnerChart.select(".scatter-axis-y").raise().call(d3.axisLeft(scatterYScale).ticks(6))
  );

  scatterInnerChart.selectAll(".scatter-axis-label").remove();
  scatterInnerChart
    .append("text")
    .attr("class", "scatter-axis-label")
    .attr("x", scatterLayout.innerWidth / 2)
    .attr("y", scatterLayout.innerHeight + 48)
    .attr("text-anchor", "middle")
    .attr("fill", chartTheme.text)
    .style("font-size", "12px")
    .style("font-weight", "600")
    .text("Star rating");

  scatterInnerChart
    .append("text")
    .attr("class", "scatter-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -scatterLayout.innerHeight / 2)
    .attr("y", -48)
    .attr("text-anchor", "middle")
    .attr("fill", chartTheme.text)
    .style("font-size", "12px")
    .style("font-weight", "600")
    .text("Energy consumption (kWh/year)");

  const legend = d3.select("#scatter-legend");
  legend.selectAll("*").remove();
  legend.style("display", "flex");
  Object.entries(scatterTechColors).forEach(([tech, color]) => {
    const item = legend.append("div").attr("class", "scatter-legend__item");
    item.append("span").attr("class", "scatter-legend__swatch").style("background", color);
    item.append("span").text(tech);
  });

  scatterInnerChart
    .selectAll("circle.scatter-point")
    .data(data, (d) => `${d.brand}-${d.model}`)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "scatter-point")
          .attr("r", 0)
          .attr("cx", (d) => scatterXScale(d.star))
          .attr("cy", (d) => scatterYScale(d.energyConsumption)),
      (update) => update,
      (exit) => exit.remove()
    )
    .transition()
    .duration(400)
    .attr("cx", (d) => scatterXScale(d.star))
    .attr("cy", (d) => scatterYScale(d.energyConsumption))
    .attr("r", 3.5)
    .attr("fill", (d) => scatterPointColor(d))
    .attr("fill-opacity", 0.6)
    .attr("stroke", (d) => scatterPointColor(d))
    .attr("stroke-width", 0.6);

  logChartAxes(
    "Energy vs star rating (scatter)",
    axisLabels.scatter.x,
    scatterXScale.domain(),
    axisLabels.scatter.y,
    scatterYScale.domain(),
    data
  );

  handleScatterMouseEvents();
}

function initScatterPlot() {
  loadTvModelData()
    .then((data) => {
      console.log("Scatter plot rows:", data.length);
      console.log("Sample TV model:", {
        brand: data[0].brand,
        model: data[0].model,
        star: data[0].star,
        energyConsumption: data[0].energyConsumption,
        screenTech: data[0].screenTech
      });

      drawScatterPlot(data);

      const status = document.getElementById("scatter-status");
      if (status) status.textContent = `${data.length.toLocaleString()} TV models loaded`;
    })
    .catch((err) => {
      console.error("Could not load scatter data:", err);
      const status = document.getElementById("scatter-status");
      if (status) {
        status.textContent = "Scatter data missing — run: python build_embedded.py";
        status.classList.add("scatter-status--error");
      }
    });
}
