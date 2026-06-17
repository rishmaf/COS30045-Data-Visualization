/** Pick chart mount node when multiple labs share one page (data-container on script tag) */
function d3ChartContainer(scriptEl) {
  const id = scriptEl && scriptEl.getAttribute("data-container");
  if (id) return d3.select(`#${id}`);
  return d3.select(".responsive-svg-container");
}

/** Log chart data and X/Y axis labels + domains (shared across exercises) */
function formatAxisDomain(domain) {
  if (!domain || domain.length === 0) return "—";
  if (typeof domain[0] === "string") {
    return domain.length <= 8
      ? domain.join(", ")
      : `${domain.slice(0, 4).join(", ")} … (${domain.length} categories)`;
  }
  const min = Number(domain[0]);
  const max = Number(domain[domain.length - 1]);
  const fmt = (v) => (Number.isInteger(v) ? v : Math.round(v * 100) / 100);
  return `${fmt(min)} → ${fmt(max)}`;
}

function logChartConsole(chartTitle, data, xLabel, xDomain, yLabel, yDomain, options) {
  const opts = options || {};
  console.group(chartTitle);
  console.log("Data:", data);
  if (Array.isArray(data)) console.log("Row count:", data.length);
  console.log(`X-axis: "${xLabel}" | range: ${formatAxisDomain(xDomain)}`);
  console.log(`Y-axis: "${yLabel}" | range: ${formatAxisDomain(yDomain)}`);
  if (opts.table && Array.isArray(data) && data.length > 0) {
    console.log("Elements (x & y axes):");
    console.table(data);
  }
  console.groupEnd();
}
