// W6.2 — Load data and initialise charts

function setLoadStatus(message, ok) {
  const el = document.getElementById("load-status");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("load-status--ok", ok);
  el.classList.toggle("load-status--error", !ok);
}

function bootCharts() {
  if (typeof d3 === "undefined") {
    setLoadStatus("D3 failed to load. Check your internet connection or use Live Server.", false);
    return;
  }

  if (!window.EMBEDDED_TV_DATA) {
    const msg =
      location.protocol === "file:"
        ? "Missing embeddedData.js — run: python build_embedded.py then refresh"
        : "Could not find TV data. Run build_embedded.py or check CSV path.";
    setLoadStatus(msg, false);
    console.error(msg);
    return;
  }

  loadTvData()
    .then((data) => {
      allData = data;
      logDataLoadSummary(data);

      defineScales(allData);
      drawHistogram();
      drawLineChart();
      populateFilters(allData);

      setLoadStatus(`Ready — ${data.length.toLocaleString()} TV models loaded from embedded data.`, true);
    })
    .catch((err) => {
      console.error("Could not load TV data:", err);
      setLoadStatus("Could not load TV data. See browser console for details.", false);
    });
}

bootCharts();
