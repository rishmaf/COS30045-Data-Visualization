const drawScatterplot = (data) => {
    d3.select("#scatterplot").selectAll("*").remove();

    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    innerChartS = svg.append("g")
        .attr("class", "inner-chart-scatter")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // scales
    xScaleS
        .domain(d3.extent(data, d => d.star))
        .nice()
        .range([0, innerWidth]);

    yScaleS
        .domain([0, d3.max(data, d => d.energyConsumption)])
        .nice()
        .range([innerHeight, 0]);

    // circles
    innerChartS.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScaleS(d.star))
        .attr("cy", d => yScaleS(d.energyConsumption))
        .attr("r", 4)
        .attr("fill", d => colorScale(d.screenTech))
        .attr("opacity", 0.45);

    // x-axis
    innerChartS.append("g")
        .attr("class", "axis x-axis-scatter")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScaleS));

    // y-axis
    innerChartS.append("g")
        .attr("class", "axis y-axis-scatter")
        .call(d3.axisLeft(yScaleS));

    // x label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Star Rating");

    // y label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Labeled Energy Consumption (kWh/year)");

    // legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 60)`);

    const legendItems = colorScale.domain();

    legend.selectAll("rect")
        .data(legendItems)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 28)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", d => colorScale(d));

    legend.selectAll("text")
        .data(legendItems)
        .join("text")
        .attr("x", 22)
        .attr("y", (d, i) => i * 28 + 12)
        .attr("font-size", "13px")
        .attr("fill", "#5a3e2b")
        .text(d => d);

    createTooltip();
    handleMouseEvents();
};
