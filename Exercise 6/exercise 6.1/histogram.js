// Exercise 6.1 — Histogram with filter

let histogramRoot;

const drawHistogram = (allData) => {
  const svg = d3
    .select("#histogram")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  histogramRoot = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  updateHistogram(allData);
};

const updateHistogram = (allData) => {
  const data = filterData(allData);
  updateFilterSummary(data.length, allData.length);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.energyConsumption))
    .nice()
    .range([0, innerWidth]);

  const bins = d3
    .bin()
    .domain(x.domain())
    .thresholds(24)(data.map((d) => d.energyConsumption));

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (b) => b.length)])
    .nice()
    .range([innerHeight, 0]);

  histogramRoot.selectAll("*").remove();

  histogramRoot
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (d) => x(d.x0) + 1)
    .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 2))
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => innerHeight - y(d.length))
    .attr("fill", "#75485E")
    .attr("opacity", 0.85)
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("opacity", 1);
      showTooltip(
        `<strong>${d.length} models</strong><br>${Math.round(d.x0)} – ${Math.round(d.x1)} kWh/year`,
        event
      );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.clientX + 14}px`)
        .style("top", `${event.clientY - 12}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).attr("opacity", 0.85);
      hideTooltip();
    });

  histogramRoot
    .append("g")
    .attr("class", "axis-x")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).ticks(10));

  histogramRoot.append("g").attr("class", "axis-y").call(d3.axisLeft(y).ticks(6));

  d3.select("#histogram")
    .select("svg")
    .selectAll(".axis-label-hist")
    .data([null])
    .join("text")
    .attr("class", "axis-label-hist")
    .attr("x", margin.left)
    .attr("y", 18)
    .attr("fill", "#5c6b7a")
    .attr("font-size", 12)
    .attr("font-weight", 600)
    .text("Energy consumption (kWh/year)");
};
