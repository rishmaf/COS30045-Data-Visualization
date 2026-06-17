// Exercise 4.4 – horizontal bar chart (scaling + labelling)

const margin = { top: 50, right: 80, bottom: 55, left: 100 };
const chartW = 700;
const chartH = 200;
const CSV_PATH = "Ex5_TV_energy_55inchtv_byScreenType.csv";
const scriptEl = document.currentScript;

function loadCsvData() {
  const embedded = document.getElementById("embedded-csv");
  if (embedded) {
    return Promise.resolve(d3.csvParse(embedded.textContent.trim()));
  }
  return d3.csv(CSV_PATH);
}

function drawChart(rawData) {
  const data = rawData.map(d => ({
    screen: d.Screen_Tech,
    energy: +d["Mean(Labelled energy consumption (kWh/year))"]
  }));

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energy)])
    .range([0, chartW])
    .nice();

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.screen))
    .range([0, chartH])
    .padding(0.2);

  const totalW = chartW + margin.left + margin.right;
  const totalH = chartH + margin.top + margin.bottom;

  const root = d3ChartContainer(scriptEl);
  root.selectAll("*").remove();
  const svg = root
    .append("svg")
    .attr("viewBox", `0 0 ${totalW} ${totalH}`)
    .style("border", "1px solid black");

  svg.append("text")
    .attr("x", margin.left + chartW / 2)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "15px")
    .style("font-weight", "bold")
    .text("55 inch TV energy by screen type");

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  chart.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-family", "sans-serif")
    .style("font-size", "12px");

  chart.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartH / 2)
    .attr("y", -55)
    .attr("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .text("Screen type");

  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${chartH})`)
    .call(d3.axisBottom(xScale).ticks(6))
    .selectAll("text")
    .style("font-family", "sans-serif")
    .style("font-size", "12px");

  chart.append("text")
    .attr("class", "x-axis-label")
    .attr("x", chartW / 2)
    .attr("y", chartH + 42)
    .attr("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .text("Mean labelled energy consumption (kWh/year)");

  const barAndLabel = chart.selectAll("g.bar-group")
    .data(data)
    .join("g")
    .attr("class", "bar-group")
    .attr("transform", d => `translate(0, ${yScale(d.screen)})`);

  barAndLabel.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", d => xScale(d.energy))
    .attr("height", yScale.bandwidth())
    .attr("fill", "#2980b9");

  barAndLabel.append("text")
    .text(d => d.energy.toFixed(1))
    .attr("x", d => xScale(d.energy) + 6)
    .attr("y", yScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .style("font-family", "sans-serif")
    .style("font-size", "13px");

  logChartConsole(
    "Exercise 4.6 — 55″ TV energy by screen type",
    data,
    "Mean labelled energy consumption (kWh/year)",
    xScale.domain(),
    "Screen type",
    yScale.domain()
  );
}

loadCsvData()
  .then((data) => drawChart(data))
  .catch(() => {
    const embedded = document.getElementById("embedded-csv");
    if (embedded) {
      drawChart(d3.csvParse(embedded.textContent.trim()));
    }
  });
