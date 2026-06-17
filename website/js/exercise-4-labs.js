/**
 * Exercise 4.1–4.6: lab picker + draw charts when a lab is selected
 */
(function () {
  const picker = document.getElementById("ex4-lab-picker");
  const panels = Array.from(document.querySelectorAll(".ex4-lab-panel"));
  const buttons = picker ? Array.from(picker.querySelectorAll("[data-lab]")) : [];
  const embeddedEl = document.getElementById("embedded-csv");
  const ENERGY_COL = "Mean(Labelled energy consumption (kWh/year))";
  const defaultLab = "4.1";
  const LAB_STORAGE_KEY = "ex4-lab";
  /** Same viewBox as Exercise 5 & 6 charts */
  const EX4_CHART_W = 1000;
  const EX4_CHART_H = 480;

  let csvData = null;

  function isRestrictedFileContext() {
    if (location.protocol === "file:") return true;
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
  const drawn = { "4.1": false, "4.3": false, "4.4": false, "4.5": false, "4.6": false };

  function chartRoot(containerId) {
    return d3.select(`#${containerId}`);
  }

  function loadRows() {
    if (!embeddedEl || typeof d3 === "undefined") {
      return Promise.reject(new Error("D3 or embedded CSV missing"));
    }
    const rows = d3.csvParse(embeddedEl.textContent.trim(), (d) => ({
      screen: d.Screen_Tech,
      energy: +d[ENERGY_COL]
    }));
    rows.sort((a, b) => d3.descending(a.energy, b.energy));
    return Promise.resolve(rows);
  }

  function drawLab43(data) {
    logChartConsole(
      "Exercise 4.3 — CSV load (chart in 4.4+)",
      data,
      "Mean labelled energy consumption (kWh/year)",
      [0, d3.max(data, (d) => d.energy)],
      "Screen type",
      data.map((d) => d.screen)
    );
  }

  function appendEx4ChartSvg(root) {
    return root
      .append("svg")
      .attr("viewBox", `0 0 ${EX4_CHART_W} ${EX4_CHART_H}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("width", EX4_CHART_W)
      .attr("height", EX4_CHART_H);
  }

  function getEx4TooltipEl() {
    let el = document.getElementById("chart-tooltip");
    if (!el) {
      el = document.createElement("div");
      el.id = "chart-tooltip";
      el.className = "chart-tooltip";
      el.setAttribute("role", "tooltip");
      document.body.appendChild(el);
    }
    return el;
  }

  function barTooltipHtml(d) {
    if (!d || d.screen == null || !Number.isFinite(d.energy)) return "";
    return `<strong>${d.screen}</strong>${d.energy.toFixed(1)} kWh/year`;
  }

  function showBarTooltip(event, d) {
    const html = barTooltipHtml(d);
    if (!html || !event) return;
    const tip = getEx4TooltipEl();
    tip.innerHTML = html;
    tip.classList.add("visible");
    tip.style.position = "fixed";
    tip.style.left = `${event.clientX + 14}px`;
    tip.style.top = `${event.clientY - 12}px`;
    tip.style.opacity = "1";
  }

  function moveBarTooltip(event) {
    if (!event) return;
    const tip = getEx4TooltipEl();
    tip.style.left = `${event.clientX + 14}px`;
    tip.style.top = `${event.clientY - 12}px`;
  }

  function hideBarTooltip() {
    const tip = getEx4TooltipEl();
    tip.classList.remove("visible");
    tip.style.removeProperty("opacity");
  }

  function highlightBar(node, on) {
    const target = node.tagName === "g" ? d3.select(node).select("rect") : d3.select(node);
    target.attr("fill", on ? "#1d4ed8" : "#2563eb");
  }

  function bindBarTooltip(selection) {
    selection
      .classed("bar-hit", true)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        highlightBar(this, true);
        showBarTooltip(event, d);
      })
      .on("mousemove", moveBarTooltip)
      .on("mouseleave", function () {
        highlightBar(this, false);
        hideBarTooltip();
      });
  }

  function drawLab44(data) {
    const root = chartRoot("ex4-chart-44");
    root.selectAll("*").remove();
    const top = data[0];
    const maxE = top ? top.energy * 1.1 : 400;
    const barW = top ? (top.energy / maxE) * (EX4_CHART_W - 200) : 0;
    const svg = appendEx4ChartSvg(root);
    bindBarTooltip(
      svg
        .selectAll("rect")
        .data([top])
        .join("rect")
        .attr("x", 100)
        .attr("y", EX4_CHART_H / 2 - 28)
        .attr("width", barW)
        .attr("height", 56)
        .attr("fill", "#2563eb")
        .attr("rx", 4)
    );
    logChartConsole(
      "Exercise 4.4 — single bar preview",
      data,
      "Mean labelled energy consumption (kWh/year)",
      [0, top ? top.energy : 0],
      "Screen type",
      data.map((d) => d.screen)
    );
  }

  function drawLab45(data) {
    const root = chartRoot("ex4-chart-45");
    root.selectAll("*").remove();
    const maxEnergy = d3.max(data, (d) => d.energy);
    const barHeight = 56;
    const barPadding = 24;
    const plotH = data.length * (barHeight + barPadding) - barPadding;
    const startY = (EX4_CHART_H - plotH) / 2;
    const maxBarW = EX4_CHART_W - 150;
    const svg = appendEx4ChartSvg(root);

    logChartConsole(
      "Exercise 4.5 — vertical bars",
      data,
      "Mean labelled energy consumption (kWh/year)",
      [0, maxEnergy],
      "Screen type (row order)",
      data.map((d) => d.screen)
    );

    bindBarTooltip(
      svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", 100)
        .attr("y", (_, i) => startY + i * (barHeight + barPadding))
        .attr("width", (d) => (d.energy / maxEnergy) * maxBarW)
        .attr("height", barHeight)
        .attr("fill", "#2563eb")
        .attr("rx", 4)
    );
  }

  function drawLab46(data) {
    const margin = { top: 50, right: 80, bottom: 55, left: 100 };
    const chartW = EX4_CHART_W - margin.left - margin.right;
    const chartH = EX4_CHART_H - margin.top - margin.bottom;
    const root = chartRoot("ex4-chart-46");
    root.selectAll("*").remove();

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.energy)])
      .range([0, chartW])
      .nice();
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.screen))
      .range([0, chartH])
      .padding(0.2);

    const svg = appendEx4ChartSvg(root);

    svg
      .append("text")
      .attr("x", margin.left + chartW / 2)
      .attr("y", 28)
      .attr("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", "15px")
      .style("font-weight", "bold")
      .text("55 inch TV energy by screen type");

    const chart = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    chart.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartH / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .text("Screen type");

    chart.append("g").attr("class", "x-axis").attr("transform", `translate(0, ${chartH})`).call(d3.axisBottom(xScale).ticks(6));
    chart
      .append("text")
      .attr("x", chartW / 2)
      .attr("y", chartH + 42)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .text("Mean labelled energy consumption (kWh/year)");

    const barAndLabel = chart
      .selectAll("g.bar-group")
      .data(data)
      .join("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(0, ${yScale(d.screen)})`);

    const bars = barAndLabel
      .append("rect")
      .attr("class", "bar-fill")
      .attr("width", (d) => xScale(d.energy))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#2563eb");

    bindBarTooltip(bars);

    barAndLabel
      .append("text")
      .text((d) => d.energy.toFixed(1))
      .attr("x", (d) => xScale(d.energy) + 6)
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "13px");

    logChartConsole(
      "Exercise 4.6 — 55″ TV energy by screen type",
      data,
      "Mean labelled energy consumption (kWh/year)",
      xScale.domain(),
      "Screen type",
      yScale.domain()
    );
  }

  function runLabDraw(labId) {
    if (labId === "4.1" && !drawn["4.1"] && typeof window.initExercise41 === "function") {
      window.initExercise41();
      drawn["4.1"] = true;
      return;
    }
    if (!csvData || typeof d3 === "undefined") return;
    if (labId === "4.3" && !drawn["4.3"]) {
      drawLab43(csvData);
      drawn["4.3"] = true;
    }
    if (labId === "4.4" && !drawn["4.4"]) {
      drawLab44(csvData);
      drawn["4.4"] = true;
    }
    if (labId === "4.5" && !drawn["4.5"]) {
      drawLab45(csvData);
      drawn["4.5"] = true;
    }
    if (labId === "4.6" && !drawn["4.6"]) {
      drawLab46(csvData);
      drawn["4.6"] = true;
    }
  }

  function getLabFromUrl() {
    if (isRestrictedFileContext()) {
      try {
        return sessionStorage.getItem(LAB_STORAGE_KEY);
      } catch (e) {
        return null;
      }
    }
    const fromQuery = new URLSearchParams(location.search).get("lab");
    if (fromQuery) return fromQuery;
    const hashMatch = location.hash.match(/^#lab-(.+)$/);
    return hashMatch ? hashMatch[1] : null;
  }

  function updateLabInUrl(labId) {
    if (isRestrictedFileContext()) {
      try {
        sessionStorage.setItem(LAB_STORAGE_KEY, labId);
      } catch (e) {
        /* ignore */
      }
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set("lab", labId);
    history.replaceState(null, "", url);
  }

  function showLab(labId) {
    buttons.forEach((btn) => {
      const active = btn.dataset.lab === labId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach((panel) => {
      const active = panel.dataset.lab === labId;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });

    runLabDraw(labId);
    updateLabInUrl(labId);
  }

  if (picker) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => showLab(btn.dataset.lab));
    });

    const initial = getLabFromUrl() || defaultLab;
    const valid = buttons.some((b) => b.dataset.lab === initial);
    showLab(valid ? initial : defaultLab);
  }

  loadRows()
    .then((data) => {
      csvData = data;
      const current =
        document.querySelector(".ex4-lab-panel.is-active")?.dataset.lab ||
        getLabFromUrl() ||
        defaultLab;
      runLabDraw(current);
    })
    .catch((err) => console.error("Exercise 4 labs:", err));
})();
