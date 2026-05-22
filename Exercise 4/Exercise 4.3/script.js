/* ── COS30045 · Week 4 · script.js ────────────────────────────
   Exercises 4.1 – 4.7: tab switching + all D3 visualisations
──────────────────────────────────────────────────────────────── */

/* ── Tab switching ──────────────────────────────────────────── */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    // Update buttons
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Update panels
    document.querySelectorAll(".ex-panel").forEach(p => p.classList.remove("active"));
    const panel = document.getElementById(target);
    if (panel) {
      panel.classList.add("active");
      // Run D3 for the newly shown panel (lazy init)
      initPanel(target);
    }
  });
});

/* ── Track which panels have been initialised ─────────────────── */
const initialised = new Set();

function initPanel(id) {
  if (initialised.has(id)) return;
  initialised.add(id);
  switch (id) {
    case "ex42": initEx42(); break;
    case "ex43": initEx43(); break;
    case "ex44": initEx44(); break;
    case "ex45": initEx45(); break;
    case "ex46": initEx46(); break;
    case "ex47": initEx47(); break;
  }
}

// Init visible panel on load (ex41 has no D3, ex42 runs on load)
initPanel("ex41");
initEx42(); // run immediately — panel is shown at start via tab, not by click

/* ── Exercise 4.2 — D3 Manipulation ─────────────────────────── */
function initEx42() {
  // Step 2: change colour of heading
  d3.select("#d3-h3-demo").style("color", "#c8f060");

  // Step 3: append paragraph
  const div = document.getElementById("d3-append-div");
  if (div && !div.querySelector("p.d3-p")) {
    d3.select("#d3-append-div")
      .append("p")
      .attr("class", "d3-p")
      .style("color", "#60d4f0")
      .style("font-family", "Space Mono, monospace")
      .style("font-size", "13px")
      .style("margin-top", "0.5rem")
      .text("Purchasing a low energy consumption TV will help with your energy bills!");
  }

  // Step 4: append SVG rect
  const svg = d3.select("#d3-manipulate-svg");
  if (svg.select("rect").empty()) {
    svg.append("rect")
      .attr("x", 50).attr("y", 25).attr("width", 180).attr("height", 50)
      .attr("rx", 4).style("fill", "#c8f060");
    svg.append("text")
      .attr("x", 140).attr("y", 57).attr("text-anchor", "middle")
      .style("font-family", "Space Mono, monospace")
      .style("font-size", "11px").style("fill", "#0d0d0d").style("font-weight", "700")
      .text("D3-appended rect");
  }
}

/* ── Exercise 4.3 — D3 Setup ─────────────────────────────────── */
function initEx43() {
  const container = document.getElementById("ex43-container");
  if (!container) return;
  d3.select(container).selectAll("svg").remove();

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", "0 0 1200 600")
    .style("width", "100%").style("display", "block").style("background", "#080808");

  svg.append("rect")
    .attr("x", 10).attr("y", 10).attr("width", 414).attr("height", 16)
    .attr("fill", "#c8f060").attr("rx", 3);

  svg.append("text")
    .attr("x", 10 + 414 / 2).attr("y", 10 + 16 / 2 + 4)
    .attr("text-anchor", "middle").attr("font-family", "Space Mono, monospace")
    .attr("font-size", "10").attr("fill", "#0d0d0d").attr("font-weight", "700")
    .text("test rect — x:10  y:10  width:414  height:16  fill:#c8f060");

  svg.append("text")
    .attr("x", 600).attr("y", 580)
    .attr("text-anchor", "middle").attr("font-family", "Space Mono, monospace")
    .attr("font-size", "11").attr("fill", "#555")
    .text("viewBox: 0 0 1200 600  ·  responsive via .responsive-svg-container");
}

/* ── Shared: load CSV once ───────────────────────────────────── */
let csvData = null;

function loadCsv(callback) {
  if (csvData) { callback(csvData); return; }
  d3.csv("data/tvScreenTechCount.csv", d => ({
    screen_tech: d["Screen_Tech"],
    count: +d["Count(Brand)"]
  })).then(data => {
    csvData = data.sort((a, b) => b.count - a.count);
    callback(csvData);
  }).catch(err => {
    console.warn("CSV load failed — make sure data/tvScreenTechCount.csv exists and you are using a local server.", err);
  });
}

/* ── Exercise 4.4 — Load CSV Data ───────────────────────────── */
function initEx44() {
  loadCsv(data => {
    // Table
    const wrap = document.getElementById("ex44-table-wrap");
    if (wrap) {
      wrap.innerHTML = `
        <table class="data-table">
          <thead><tr><th>screen_tech</th><th>count</th><th>type</th></tr></thead>
          <tbody>
            ${data.map(d => `<tr>
              <td class="td-cat">${d.screen_tech}</td>
              <td class="td-num">${d.count}</td>
              <td class="td-type">number ✓</td>
            </tr>`).join("")}
          </tbody>
        </table>`;
    }

    // Stats
    const statsEl = document.getElementById("ex44-stats");
    if (statsEl) {
      const max = d3.max(data, d => d.count);
      const min = d3.min(data, d => d.count);
      const ext = d3.extent(data, d => d.count);
      statsEl.style.display = "grid";
      statsEl.innerHTML = [
        { label: "data.length",    value: data.length },
        { label: "d3.max(count)",  value: max.toLocaleString() },
        { label: "d3.min(count)",  value: min.toLocaleString() },
        { label: "d3.extent",      value: `[${ext[0]}, ${ext[1]}]` },
      ].map(s => `<div class="stat-box"><div class="stat-lbl">${s.label}</div><div class="stat-val">${s.value}</div></div>`).join("");
    }
  });
}

/* ── Exercise 4.5 — Bind & Draw ──────────────────────────────── */
function initEx45() {
  loadCsv(data => {
    const container = document.getElementById("ex45-container");
    if (!container) return;
    d3.select(container).selectAll("svg").remove();

    const BAR_H = 36, GAP = 10;
    const totalH = data.length * (BAR_H + GAP) + 20;

    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 900 ${totalH}`)
      .style("width", "100%").style("display", "block").style("background", "#080808");

    svg.selectAll("g.bar")
      .data(data).join("g")
      .attr("class", d => `bar bar-${d.count}`)
      .attr("transform", (_, i) => `translate(10, ${i * (BAR_H + GAP) + 10})`)
      .append("rect")
        .attr("width", d => d.count / 4)
        .attr("height", BAR_H)
        .attr("fill", "#c8f060")
        .attr("rx", 3);
  });
}

/* ── Exercise 4.6 — Scaling ──────────────────────────────────── */
function initEx46() {
  loadCsv(data => {
    const container = document.getElementById("ex46-container");
    if (!container) return;
    d3.select(container).selectAll("svg").remove();

    const W = 800, H = 300;
    const ml = 20, mr = 30, mt = 20, mb = 20;
    const iW = W - ml - mr, iH = H - mt - mb;

    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("width", "100%").style("display", "block").style("background", "#080808");

    const g = svg.append("g").attr("transform", `translate(${ml},${mt})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).range([0, iW]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.screen_tech)).range([0, iH]).padding(0.3);

    // Grid
    g.append("g").selectAll("line.grid")
      .data(xScale.ticks(5)).join("line")
      .attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
      .attr("y1", 0).attr("y2", iH)
      .attr("stroke", "#272727").attr("stroke-dasharray", "3 3");

    // Bars
    g.selectAll("rect.bar").data(data).join("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yScale(d.screen_tech))
      .attr("width", d => xScale(d.count))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#c8f060").attr("rx", 3);
  });
}

/* ── Exercise 4.7 — Labels ───────────────────────────────────── */
function initEx47() {
  loadCsv(data => {
    const container = document.getElementById("ex47-container");
    if (!container) return;
    d3.select(container).selectAll("svg").remove();

    const W = 800, H = 320;
    const ml = 120, mr = 80, mt = 20, mb = 20;
    const iW = W - ml - mr, iH = H - mt - mb;

    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .style("width", "100%").style("display", "block").style("background", "#080808");

    const g = svg.append("g").attr("transform", `translate(${ml},${mt})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).range([0, iW]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.screen_tech)).range([0, iH]).padding(0.35);

    // Grid
    g.append("g").selectAll("line.grid")
      .data(xScale.ticks(4)).join("line")
      .attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
      .attr("y1", 0).attr("y2", iH)
      .attr("stroke", "#272727").attr("stroke-dasharray", "3 3");

    // Groups: bar + labels
    const barAndLabel = g.selectAll("g.bar-group")
      .data(data).join("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(0, ${yScale(d.screen_tech)})`);

    barAndLabel.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", d => xScale(d.count))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#c8f060").attr("rx", 3);

    barAndLabel.append("text")
      .text(d => d.screen_tech)
      .attr("x", -8).attr("y", yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .style("font-family", "Space Mono, monospace")
      .style("font-size", "12px").style("fill", "#f0ede8");

    barAndLabel.append("text")
      .text(d => d.count.toLocaleString())
      .attr("x", d => xScale(d.count) + 6)
      .attr("y", yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "start")
      .style("font-family", "Space Mono, monospace")
      .style("font-size", "11px").style("fill", "#777");
  });
}

console.log("COS30045 Week 4 — script.js loaded. Open a tab to run each exercise.");
