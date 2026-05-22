
  const lineMargin = { top: 20, right: 20, bottom: 55, left: 90 };
  const lineWidth = 1000;
  const lineHeight = 430;

  const lineSvg = d3
    .select("#line-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${lineWidth} ${lineHeight}`);

  const lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  const lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  const lineG = lineSvg
    .append("g")
    .attr("transform", `translate(${lineMargin.left}, ${lineMargin.top})`);

  const _lineCSV = `"Year","Queensland (\$ per megawatt hour)","New South Wales (\$ per megawatt hour)","Victoria (\$ per megawatt hour)","South Australia (\$ per megawatt hour)","Tasmania (\$ per megawatt hour)","Snowy (\$ per megawatt hour)","Average Price (notTas-Snowy)"
"1998",60,25,27,54,,19,41.5
"1999",49,30,28,69,,24,44
"2000",45,41,49,67,,35,50.5
"2001",38,38,33,34,,27,35.75
"2002",41,37,30,33,,27,35.25
"2003",31,37,27,39,,22,33.5
"2004",31,46,29,39,,26,36.25
"2005",31,43,36,44,59,29,38.5
"2006",57,67,61,59,51,38,61
"2007",58,44,51,101,57,31,63.5
"2008",36,43,49,69,62,,49.25
"2009",37,52,42,83,30,,53.5
"2010",34,43,29,42,31,,37
"2011",30,31,28,32,33,,30.25
"2012",70,56,61,74,49,,65.25
"2013",61,53,54,68,42,,59
"2014",61,36,32,42,37,,42.75
"2015",64,54,50,67,97,,58.75
"2016",103,88,70,123,76,,96
"2017",75,85,99,109,88,,92
"2018",83,92,124,128,88,,106.75
"2019",56,79,84,73,56,,73
"2020",66,72,51,53,45,,60.5
"2021",178,144,104,125,90,,137.75
"2022",157,157,114,150,117,,144.5
"2023",101,114,77,103,72,,98.75
"2024",132,155,95,148,99,,132.5
`;

  (function() {
    const data = d3.csvParse(_lineCSV, d => ({
      year: +d.Year,
      averagePrice: +d["Average Price (notTas-Snowy)"]
    }));

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, lineInnerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.averagePrice)])
      .nice()
      .range([lineInnerHeight, 0]);

    lineG.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0, ${lineInnerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    lineG.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));

    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.averagePrice));

    lineG.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    lineG.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.averagePrice))
      .attr("r", 3)
      .attr("fill", "tomato");

    lineSvg.append("text")
      .attr("x", lineWidth / 2)
      .attr("y", lineHeight - 10)
      .attr("text-anchor", "middle")
      .text("Year");

    lineSvg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -lineHeight / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Average Spot Price ($ per megawatt hour)");
  })();
  