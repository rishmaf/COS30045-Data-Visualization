// W5 — Colour legend

const addLegend = (containerSelector = ".legend-container") => {
  const host = d3.select(containerSelector);
  if (host.empty()) return;

  const legend = host.append("div").attr("class", "chart-legend chart-legend--pills");

  formatsInfo.forEach((f) => {
    const item = legend.append("div").attr("class", "chart-legend__item");
    item
      .append("span")
      .attr("class", "chart-legend__swatch")
      .style("background", `linear-gradient(135deg, ${f.light}, ${f.color})`)
      .style("box-shadow", `0 0 0 2px ${f.color}33`);
    item.append("span").text(f.label);
  });
};
