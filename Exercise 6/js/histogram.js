const drawHistogram = (data) => {
    d3.select("#histogram").selectAll("*").remove();

    const svg = d3.select("#histogram")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const innerChart = svg.append("g")
        .attr("class", "inner-chart")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const bins = binGenerator(data);

    const xMin = d3.min(bins, d => d.x0);
    const xMax = d3.max(bins, d => d.x1);
    const yMax = d3.max(bins, d => d.length);

    xScale.domain([xMin, xMax]);
    yScale.domain([0, yMax]).nice();

    innerChart.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0) + 1)
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", barColor)
        .attr("stroke", barStrokeColor);

    innerChart.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

    innerChart.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Labeled Energy Consumption (kWh/year)");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Frequency");
};
