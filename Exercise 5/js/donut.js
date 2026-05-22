
  const donutWidth = 520;
  const donutHeight = 420;
  const donutRadius = Math.min(donutWidth, donutHeight) / 2 - 40;

  const donutSvg = d3
    .select("#donut-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${donutWidth} ${donutHeight}`);

  const donutG = donutSvg
    .append("g")
    .attr("transform", `translate(${donutWidth / 2}, ${donutHeight / 2})`);

  const _donutCSV = `"Screen_Tech","Mean(Labelled energy consumption (kWh/year))"
"LCD",306.49623867952073
"LED",355.67927199496165
"OLED",533.0641742418338
`;

  (function() {
    const data = d3.csvParse(_donutCSV, d => ({
      screenTech: d.Screen_Tech,
      energy: +d["Mean(Labelled energy consumption (kWh/year))"]
    }));

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.screenTech))
      .range(d3.schemeTableau10);

    const pie = d3.pie()
      .sort(null)
      .value(d => d.energy);

    const arc = d3.arc()
      .innerRadius(70)
      .outerRadius(donutRadius);

    const labelArc = d3.arc()
      .innerRadius(95)
      .outerRadius(donutRadius);

    donutG.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.screenTech))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    donutG.selectAll("text.lbl")
      .data(pie(data))
      .join("text")
      .attr("class", "lbl")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .text(d => d.data.screenTech);

    donutG.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("font-size", 15)
      .attr("font-weight", "bold")
      .text("All");

    donutG.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.1em")
      .attr("font-size", 15)
      .text("Sizes");
  })();
  