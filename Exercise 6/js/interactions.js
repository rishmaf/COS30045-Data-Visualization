const populateFilters = (data) => {
    const screenContainer = d3.select("#filters_screen");
    const sizeContainer = d3.select("#filters_size");

    screenContainer.selectAll("*").remove();
    sizeContainer.selectAll("*").remove();

    // Screen technology buttons
    screenContainer.selectAll("button")
        .data(filters_screen)
        .join("button")
        .attr("class", d => d.isActive ? "active" : null)
        .text(d => d.label)
        .on("click", (event, clickedFilter) => {
            filters_screen.forEach(filter => {
                filter.isActive = filter.id === clickedFilter.id;
            });

            screenContainer.selectAll("button")
                .attr("class", d => d.isActive ? "active" : null);

            updateHistogram(data);
        });

    // Screen size buttons
    sizeContainer.selectAll("button")
        .data(filters_size)
        .join("button")
        .attr("class", d => d.isActive ? "active" : null)
        .text(d => d.label)
        .on("click", (event, clickedFilter) => {
            filters_size.forEach(filter => {
                filter.isActive = filter.id === clickedFilter.id;
            });

            sizeContainer.selectAll("button")
                .attr("class", d => d.isActive ? "active" : null);

            updateHistogram(data);
        });
};

const updateHistogram = (originalData) => {
    const activeScreen = filters_screen.find(d => d.isActive).id;
    const activeSize = filters_size.find(d => d.isActive).id;

    let updatedData = originalData;

    if (activeScreen !== "all") {
        updatedData = updatedData.filter(d => d.screenTech === activeScreen);
    }

    if (activeSize !== "all") {
        updatedData = updatedData.filter(d => d.screenSize === activeSize);
    }

    const updatedBins = binGenerator(updatedData);

    const xMin = d3.min(updatedBins, d => d.x0) ?? 0;
    const xMax = d3.max(updatedBins, d => d.x1) ?? 1;
    const yMax = d3.max(updatedBins, d => d.length) ?? 1;

    xScale.domain([xMin, xMax]);
    yScale.domain([0, yMax]).nice();

    const innerChart = d3.select(".inner-chart");

    innerChart.selectAll("rect")
        .data(updatedBins)
        .join("rect")
        .attr("class", "bar")
        .transition()
        .duration(600)
        .attr("x", d => xScale(d.x0) + 1)
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", barColor)
        .attr("stroke", barStrokeColor);

    innerChart.select(".x-axis")
        .transition()
        .duration(600)
        .call(d3.axisBottom(xScale));

    innerChart.select(".y-axis")
        .transition()
        .duration(600)
        .call(d3.axisLeft(yScale));
};

/* =========================
   Tooltip functions
========================= */

const createTooltip = () => {
    const tooltip = innerChartS.append("g")
        .attr("class", "tooltip")
        .style("opacity", 0);

    tooltip.append("rect")
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", barColor)
        .attr("opacity", 0.9);

    tooltip.append("text")
        .attr("class", "tooltip-text")
        .attr("x", tooltipWidth / 2)
        .attr("y", tooltipHeight / 2 + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "12px");
};

const handleMouseEvents = () => {
    d3.select(".inner-chart-scatter")
        .selectAll("circle")
        .on("mouseenter", function (e, d) {
            const cx = +this.getAttribute("cx");
            const cy = +this.getAttribute("cy");

            d3.select(".tooltip-text")
                .text(`${d.screenSize}"`);

            d3.select(".tooltip")
                .attr("transform", `translate(${cx + 10}, ${cy - 40})`)
                .transition()
                .duration(150)
                .style("opacity", 1);
        })
        .on("mouseleave", function () {
            d3.select(".tooltip")
                .transition()
                .duration(150)
                .style("opacity", 0)
                .attr("transform", "translate(-100,-100)");
        });
};
