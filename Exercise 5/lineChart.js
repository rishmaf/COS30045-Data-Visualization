// W5.1 — Line chart with area (redesigned)

const PRICE_CSV = "./Ex5_ARE_Spot_Prices.csv";
const PRIMARY = chartTheme.primary;

function parsePriceRow(d) {
  const statePrices = [
    d["Queensland ($ per megawatt hour)"],
    d["New South Wales ($ per megawatt hour)"],
    d["Victoria ($ per megawatt hour)"],
    d["South Australia ($ per megawatt hour)"]
  ]
    .map(Number)
    .filter((v) => !Number.isNaN(v));

  const year = +d.Year;
  return {
    date: new Date(year, 0, 1),
    year,
    min_temp: d3.min(statePrices),
    max_temp: d3.max(statePrices),
    ave_temp: +d["Victoria ($ per megawatt hour)"]
  };
}

function loadPriceData() {
  if (location.protocol === "file:" && window.EMBEDDED_PRICES_CSV) {
    return Promise.resolve(d3.csvParse(window.EMBEDDED_PRICES_CSV, parsePriceRow));
  }
  return d3.csv(PRICE_CSV, parsePriceRow);
}

const drawLineChart = (data) => {
  const m = { top: 36, right: 120, bottom: 56, left: 64 };
  const w = 1000;
  const h = 480;
  const iw = w - m.left - m.right;
  const ih = h - m.top - m.bottom;

  const svg = d3
    .select("#line-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("role", "img")
    .attr("aria-label", "Spot power prices 1998 to 2024");

  const defs = svg.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", "area-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
  gradient.append("stop").attr("offset", "0%").attr("stop-color", PRIMARY).attr("stop-opacity", 0.4);
  gradient.append("stop").attr("offset", "100%").attr("stop-color", PRIMARY).attr("stop-opacity", 0.05);

  const innerChart = svg.append("g").attr("transform", `translate(${m.left}, ${m.top})`);

  drawPlotBackground(innerChart, iw, ih);

  const firstDate = new Date(data[0].date.getFullYear(), 0, 1);
  const lastDate = d3.max(data, (d) => d.date);
  const yMax = d3.max(data, (d) => d.max_temp);

  const xScale = d3.scaleTime().domain([firstDate, lastDate]).range([0, iw]);
  const yScale = d3.scaleLinear().domain([0, yMax * 1.06]).nice().range([ih, 0]);

  const yearStep = Math.max(1, Math.ceil(data.length / 8));
  const yearTicks = d3.timeYear.every(yearStep).range(firstDate, d3.timeYear.offset(lastDate, 1));

  drawDashedGrid(
    innerChart,
    xScale,
    yScale,
    d3.axisBottom(xScale).tickValues(yearTicks)
  );

  const areaGenerator = d3
    .area()
    .x((d) => xScale(d.date))
    .y0((d) => yScale(d.min_temp))
    .y1((d) => yScale(d.max_temp))
    .curve(d3.curveCatmullRom);

  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.ave_temp))
    .curve(d3.curveCatmullRom);

  innerChart
    .append("path")
    .datum(data)
    .attr("class", "area-path")
    .attr("d", areaGenerator)
    .attr("opacity", 0)
    .transition()
    .duration(700)
    .attr("opacity", 1);

  const linePath = innerChart.append("path").datum(data).attr("class", "line-path").attr("d", lineGenerator);

  const totalLength = linePath.node().getTotalLength();
  linePath
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(900)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0);

  styleAxis(
    innerChart
      .append("g")
      .attr("class", "axis-x")
      .attr("transform", `translate(0, ${ih})`)
      .call(d3.axisBottom(xScale).tickValues(yearTicks).tickFormat(d3.timeFormat("%Y")))
  );

  styleAxis(innerChart.append("g").attr("class", "axis-y").call(d3.axisLeft(yScale).ticks(6).tickFormat((d) => `$${d}`)));

  appendInnerAxisLabel(innerChart, "Year (1998–2024)", ih);
  appendAxisLabelSvg(svg, "Price ($/MWh)", m, ih, "y");

  const legend = svg
    .append("g")
    .attr("class", "chart-legend-svg")
    .attr("transform", `translate(${w - m.right - 108}, ${m.top - 8})`);

  legend
    .append("rect")
    .attr("width", 108)
    .attr("height", 52)
    .attr("rx", 8)
    .attr("fill", "#fff")
    .attr("stroke", chartTheme.border)
    .attr("opacity", 0.95);

  [
    { label: "Victoria (avg)", type: "line" },
    { label: "Regional band", type: "area" }
  ].forEach((item, i) => {
    const row = legend.append("g").attr("transform", `translate(10, ${12 + i * 22})`);
    if (item.type === "line") {
      row.append("line").attr("x1", 0).attr("x2", 18).attr("y1", 6).attr("y2", 6).attr("stroke", PRIMARY).attr("stroke-width", 2.5);
      row.append("circle").attr("cx", 9).attr("cy", 6).attr("r", 3.5).attr("fill", "#fff").attr("stroke", PRIMARY).attr("stroke-width", 2);
    } else {
      row.append("rect").attr("width", 18).attr("height", 10).attr("y", 1).attr("rx", 2).attr("fill", PRIMARY).attr("fill-opacity", 0.3);
    }
    row
      .append("text")
      .attr("x", 24)
      .attr("y", 7)
      .attr("fill", chartTheme.muted)
      .style("font-size", "10px")
      .style("font-family", chartTheme.font)
      .text(item.label);
  });

  innerChart
    .selectAll(".data-point")
    .data(data)
    .join("circle")
    .attr("class", "data-point")
    .attr("r", 5)
    .attr("cx", (d) => xScale(d.date))
    .attr("cy", (d) => yScale(d.ave_temp))
    .attr("opacity", 0)
    .on("mouseenter", function (event, d) {
      d3.select(this).classed("data-point--active", true);
      showChartTooltip(
        `<strong>${d.year}</strong><br>Victoria: $${d.ave_temp}/MWh<br>Range: $${d.min_temp} – $${d.max_temp}`,
        event
      );
    })
    .on("mousemove", (event) => {
      chartTooltip.style("left", `${event.clientX + 14}px`).style("top", `${event.clientY - 12}px`);
    })
    .on("mouseleave", function () {
      d3.select(this).classed("data-point--active", false);
      hideChartTooltip();
    })
    .transition()
    .delay((_, i) => 400 + i * 20)
    .duration(300)
    .attr("opacity", 1);

  const last = data[data.length - 1];
  const highlight = innerChart.append("g").attr("class", "highlight-label").attr("opacity", 0);
  highlight
    .append("line")
    .attr("x1", xScale(last.date))
    .attr("y1", yScale(last.ave_temp))
    .attr("x2", xScale(last.date) + 40)
    .attr("y2", yScale(last.ave_temp) - 16)
    .attr("stroke", PRIMARY)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4,3");
  highlight
    .append("text")
    .attr("x", xScale(last.date) + 44)
    .attr("y", yScale(last.ave_temp) - 18)
    .attr("fill", PRIMARY)
    .attr("font-size", 12)
    .attr("font-weight", 700)
    .text(`2024 · $${last.ave_temp}`);
  highlight.transition().delay(1000).duration(400).attr("opacity", 1);

  logChartAxes(
    "Spot power prices (1998–2024)",
    axisLabels.line.x,
    xScale.domain(),
    axisLabels.line.y,
    yScale.domain(),
    data
  );
};

loadPriceData()
  .then((data) => {
    logEmbeddedStatus();
    data.sort((a, b) => a.date - b.date);
    drawLineChart(data);
  })
  .catch((err) => console.error("Could not load price data:", err));
