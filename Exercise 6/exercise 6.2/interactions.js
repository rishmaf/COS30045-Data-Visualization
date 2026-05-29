// W6.2 — Filter buttons inside each chart (synced)

const FILTER_CONTAINERS = ["#filters-histogram", "#filters-line"];

function filterButtonHtml(d) {
  const dot =
    d.id === "all"
      ? `<span class="filter-dot filter-dot--all"></span>`
      : `<span class="filter-dot" style="background:${techColors[d.id].main}"></span>`;
  return `${dot}<span>${d.label}</span>`;
}

function updateFilterButtons() {
  FILTER_CONTAINERS.forEach((selector) => {
    d3.select(selector)
      .selectAll(".filter")
      .attr("class", (f) => `filter filter--${f.id} ${f.isActive ? "active" : ""}`);
  });
}

function updateFilterSummaries(filterId, count) {
  const tag = filterId === "all" ? "All" : filterId;
  const html =
    `<strong>${count.toLocaleString()}</strong> models · ` +
    `<span class="filter-tag filter-tag--${filterId}">${tag}</span>`;

  d3.select("#filter-summary-histogram").html(html);
  d3.select("#filter-summary-line").html(html);
}

function applyFilter(filterId, data) {
  const filtered = filterById(data, filterId);
  console.log(`Filter: ${filterId} — ${filtered.length} models`);
  console.log("Filtered data (first 5):", filtered.slice(0, 5));

  updateFilterSummaries(filterId, filtered.length);
  updateHistogram(filterId, data);
  updateLineChart(filterId, data);
}

function bindFilterButtons(container, data) {
  container
    .selectAll(".filter")
    .data(filters)
    .join("button")
    .attr("type", "button")
    .attr("class", (d) => `filter filter--${d.id} ${d.isActive ? "active" : ""}`)
    .attr("data-tech", (d) => d.id)
    .html(filterButtonHtml)
    .on("click", (e, d) => {
      console.log("DOM event", e);
      console.log("Attached datum", d);

      if (!d.isActive) {
        filters.forEach((f) => {
          f.isActive = d.id === f.id;
        });
        updateFilterButtons();
        applyFilter(d.id, data);
      }
    });
}

const populateFilters = (data) => {
  FILTER_CONTAINERS.forEach((selector) => {
    bindFilterButtons(d3.select(selector), data);
  });
  updateFilterSummaries("all", data.length);
};
