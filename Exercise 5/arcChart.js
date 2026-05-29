// W5.1 — Donut arc chart (redesigned)

const TV_CSV = "./Ex5_TV_energy.csv";
const HIGH_ENERGY_THRESHOLD = 400;

const ARC_COLORS = {
  high: chartTheme.arcHigh,
  low: chartTheme.arcLow,
  inactive: chartTheme.arcTrack
};

function parseTvRow(d) {
  return {
    energy_consumpt: +d.energy_consumpt,
    count: +d.count
  };
}

function loadTvData() {
  if (location.protocol === "file:" && window.EMBEDDED_TV_CSV) {
    return Promise.resolve(d3.csvParse(window.EMBEDDED_TV_CSV, parseTvRow));
  }
  return d3.csv(TV_CSV, parseTvRow);
}

const drawArc = (data) => {
  const size = 340;
  const innerR = 82;
  const outerR = 124;

  const total = data.length;
  const highCount = data.filter((d) => d.energy_consumpt >= HIGH_ENERGY_THRESHOLD).length;
  const lowCount = total - highCount;
  const highPct = Math.round((highCount / total) * 100);
  const lowPct = 100 - highPct;
  const angleHigh = (highPct / 100) * 2 * Math.PI;

  const segments = [
    {
      id: "low",
      start: angleHigh,
      end: 2 * Math.PI,
      fill: ARC_COLORS.low,
      label: "Lower energy",
      count: lowCount,
      pct: lowPct,
      detail: `< ${HIGH_ENERGY_THRESHOLD} kWh/yr`
    },
    {
      id: "high",
      start: 0,
      end: angleHigh,
      fill: ARC_COLORS.high,
      label: "High energy",
      count: highCount,
      pct: highPct,
      detail: `≥ ${HIGH_ENERGY_THRESHOLD} kWh/yr`
    }
  ];

  let selectedId = null;

  const svg = d3.select("#arc").append("svg").attr("viewBox", [0, 0, size, size]);

  const defs = svg.append("defs");
  defs
    .append("filter")
    .attr("id", "arc-shadow")
    .append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 2)
    .attr("stdDeviation", 3)
    .attr("flood-opacity", 0.15);

  const g = svg.append("g").attr("transform", `translate(${size / 2}, ${size / 2})`);

  const arcGen = d3
    .arc()
    .innerRadius(innerR)
    .outerRadius(outerR)
    .padAngle(0.03)
    .cornerRadius(10);

  g.append("circle")
    .attr("r", outerR + 8)
    .attr("fill", chartTheme.plotBg)
    .attr("stroke", chartTheme.border);

  g.append("path")
    .attr("class", "donut-track")
    .attr("d", arcGen({ startAngle: 0, endAngle: 2 * Math.PI }))
    .attr("fill", ARC_COLORS.inactive);

  const paths = g
    .selectAll(".donut-segment")
    .data(segments)
    .join("path")
    .attr("class", (d) => `donut-segment donut-segment--${d.id}`)
    .attr("fill", (d) => d.fill)
    .attr("stroke", "#fff")
    .attr("stroke-width", 2.5)
    .attr("cursor", "pointer")
    .attr("filter", "url(#arc-shadow)")
    .attr("d", (d) => arcGen({ startAngle: d.start, endAngle: d.end }))
    .attr("opacity", 0)
    .transition()
    .duration(500)
    .delay((_, i) => i * 120)
    .attr("opacity", 1);

  g.selectAll(".donut-arc-label")
    .data(segments)
    .join("text")
    .attr("class", (d) => `donut-arc-label donut-arc-label--${d.id}`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#fff")
    .attr("font-size", 15)
    .attr("font-weight", 700)
    .attr("pointer-events", "none")
    .attr("transform", (d) => {
      const [x, y] = arcGen.startAngle(d.start).endAngle(d.end).centroid();
      return `translate(${x}, ${y})`;
    })
    .text((d) => `${d.pct}%`);

  const center = g.append("g").attr("class", "donut-center");
  const centerPct = center
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8)
    .attr("fill", chartTheme.text)
    .attr("font-size", 28)
    .attr("font-weight", 700);
  const centerDetail = center
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", 16)
    .attr("fill", chartTheme.muted)
    .attr("font-size", 11);
  const centerCount = center
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", 32)
    .attr("fill", chartTheme.muted)
    .attr("font-size", 10);

  function centerTextFor(id) {
    if (id === null) {
      return {
        pct: `${highPct}% / ${lowPct}%`,
        detail: "Click a segment to focus",
        count: `${total.toLocaleString()} TV models`
      };
    }
    const seg = segments.find((s) => s.id === id);
    return {
      pct: `${seg.pct}%`,
      detail: seg.detail,
      count: `${seg.count.toLocaleString()} of ${total.toLocaleString()} models`
    };
  }

  function applySelection(focusId) {
    selectedId = focusId;

    g.selectAll(".donut-segment")
      .attr("fill", (d) => (focusId === null || d.id === focusId ? d.fill : ARC_COLORS.inactive))
      .attr("fill-opacity", (d) => (focusId === null || d.id === focusId ? 1 : 0.4))
      .classed("donut-segment--selected", (d) => d.id === focusId);

    g.selectAll(".donut-arc-label").attr("opacity", (d) =>
      focusId === null || d.id === focusId ? 1 : 0
    );

    const text = centerTextFor(focusId);
    centerPct.text(text.pct);
    centerDetail.text(text.detail);
    centerCount.text(text.count);

    d3.selectAll(".donut-legend__item")
      .classed("donut-legend__item--active", (_, i, nodes) => {
        const el = nodes[i];
        return focusId !== null && el.classList.contains(`donut-legend__item--${focusId}`);
      })
      .classed("donut-legend__item--muted", (_, i, nodes) => {
        const el = nodes[i];
        return focusId !== null && !el.classList.contains(`donut-legend__item--${focusId}`);
      });

    d3.select("#donut-reset").classed("visible", focusId !== null);
  }

  function toggleSelection(id) {
    applySelection(selectedId === id ? null : id);
  }

  g.selectAll(".donut-segment").on("click", (_, d) => toggleSelection(d.id));

  d3.select("#donut-legend")
    .attr("aria-hidden", "false")
    .html(
      `<button type="button" class="donut-reset" id="donut-reset">Show both segments</button>` +
        [...segments].reverse().map(
          (d) => `
        <button type="button" class="donut-legend__item donut-legend__item--${d.id}" data-id="${d.id}">
          <span class="donut-legend__swatch donut-legend__swatch--${d.id}"></span>
          <span><strong>${d.label}</strong> — ${d.count.toLocaleString()} models (${d.pct}%)</span>
        </button>`
        ).join("")
    );

  d3.select("#donut-reset").on("click", () => applySelection(null));
  d3.selectAll(".donut-legend__item").on("click", function () {
    toggleSelection(this.getAttribute("data-id"));
  });

  applySelection(null);
};

loadTvData()
  .then((data) => drawArc(data))
  .catch((err) => console.error("Could not load TV data:", err));
