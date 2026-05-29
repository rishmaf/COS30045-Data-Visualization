// Exercise 6.1 — Load data and wire filters

let allTvData = [];

function bindFilters() {
  const minInput = document.getElementById("filter-size-min");
  const maxInput = document.getElementById("filter-size-max");
  const minVal = document.getElementById("filter-size-min-val");
  const maxVal = document.getElementById("filter-size-max-val");

  const refresh = () => {
    const min = +minInput.value;
    const max = +maxInput.value;
    if (min > max) {
      if (document.activeElement === minInput) maxInput.value = min;
      else minInput.value = max;
    }
    minVal.textContent = minInput.value;
    maxVal.textContent = maxInput.value;
    updateHistogram(allTvData);
    updateScatter(allTvData);
  };

  document.getElementById("filter-tech").addEventListener("change", refresh);
  minInput.addEventListener("input", refresh);
  maxInput.addEventListener("input", refresh);
}

loadTvData()
  .then((data) => {
    allTvData = data;
    console.log("TV data loaded:", data.length, "rows");
    drawHistogram(allTvData);
    drawScatter(allTvData);
    bindFilters();
    updateFilterSummary(allTvData.length, allTvData.length);
  })
  .catch((err) => console.error("Could not load TV data:", err));
