const palette = ["#22f0a4", "#42d4ff", "#9d6bff", "#ffd166", "#ff7ad6", "#5ce1e6"];
const ink = "#eaf0ff";
const muted = "#8693b8";
const gridLine = "rgba(255,255,255,.08)";

document.querySelectorAll(".nav a").forEach(a => {
  const file = location.pathname.split("/").pop() || "index.html";
  if (a.getAttribute("href") === file) a.classList.add("active");
});
const btn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
if (btn && nav) btn.addEventListener("click", () => nav.classList.toggle("open"));

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }), { threshold: .12 });
document.querySelectorAll(".card,.chart-card,.story-panel,.section-head").forEach(el => { el.classList.add("reveal"); io.observe(el); });

async function loadData() {
  const res = await fetch("data/tv-energy-data.json");
  return res.json();
}

function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

// "Nice" tick generator for y axis
function niceTicks(maxValue, count = 5) {
  if (maxValue <= 0) return [0, 1];
  const rough = maxValue / count;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  step *= pow;
  const niceMax = Math.ceil(maxValue / step) * step;
  const ticks = [];
  for (let v = 0; v <= niceMax + 1e-9; v += step) ticks.push(+v.toFixed(6));
  return ticks;
}

function fmt(n) {
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function drawAxes(ctx, w, h, pad, ticks, opts) {
  const { plotL, plotR, plotT, plotB } = pad;
  const min = 0;
  const max = ticks[ticks.length - 1];
  ctx.font = "11px 'Space Grotesk', sans-serif";
  ctx.fillStyle = muted;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  // horizontal grid + y ticks
  ticks.forEach(t => {
    const y = plotB - (t - min) / (max - min) * (plotB - plotT);
    ctx.strokeStyle = t === 0 ? "rgba(255,255,255,.18)" : gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotL, y);
    ctx.lineTo(plotR, y);
    ctx.stroke();
    ctx.fillStyle = muted;
    ctx.fillText(fmt(t), plotL - 8, y);
  });
  // axis lines
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.beginPath();
  ctx.moveTo(plotL, plotT);
  ctx.lineTo(plotL, plotB);
  ctx.stroke();
  // y-axis title
  if (opts.yTitle) {
    ctx.save();
    ctx.translate(16, (plotT + plotB) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = ink;
    ctx.font = "600 12px 'Sora', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(opts.yTitle, 0, 0);
    ctx.restore();
  }
  // x-axis title
  if (opts.xTitle) {
    ctx.fillStyle = ink;
    ctx.font = "600 12px 'Sora', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.xTitle, (plotL + plotR) / 2, h - 6);
  }
  return { min, max };
}

function gradFill(ctx, x, y, w, h, color) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, color);
  g.addColorStop(1, color + "55");
  return g;
}

function bars(id, data, label, value, opts = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const pad = { plotL: 64, plotR: w - 16, plotT: 16, plotB: h - 56 };
  const max = Math.max(...data.map(value));
  const ticks = niceTicks(max);
  const { min, max: maxY } = drawAxes(ctx, w, h, pad, ticks, opts);
  const slot = (pad.plotR - pad.plotL) / data.length;
  const bw = Math.min(slot * 0.6, 80);
  data.forEach((d, i) => {
    const v = value(d);
    const x = pad.plotL + slot * i + (slot - bw) / 2;
    const bh = (v - min) / (maxY - min) * (pad.plotB - pad.plotT);
    const y = pad.plotB - bh;
    const color = palette[i % palette.length];
    ctx.shadowColor = color + "88";
    ctx.shadowBlur = 18;
    ctx.fillStyle = gradFill(ctx, x, y, bw, bh, color);
    roundRect(ctx, x, y, bw, bh, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    // x-axis category label
    ctx.fillStyle = muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.fillText(label(d), x + bw / 2, pad.plotB + 18);
    // value above bar
    ctx.fillStyle = ink;
    ctx.font = "700 12px 'Sora', sans-serif";
    ctx.fillText(opts.valueFmt ? opts.valueFmt(v) : fmt(v), x + bw / 2, y - 8);
  });
}

function horizontalBars(id, data, label, value, opts = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const labelW = 110;
  const pad = { plotL: labelW + 16, plotR: w - 70, plotT: 16, plotB: h - 44 };
  const max = Math.max(...data.map(value));
  const ticks = niceTicks(max);
  const maxV = ticks[ticks.length - 1];
  // x-axis grid + tick labels
  ctx.font = "11px 'Space Grotesk', sans-serif";
  ctx.fillStyle = muted;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ticks.forEach(t => {
    const x = pad.plotL + (t / maxV) * (pad.plotR - pad.plotL);
    ctx.strokeStyle = t === 0 ? "rgba(255,255,255,.18)" : gridLine;
    ctx.beginPath();
    ctx.moveTo(x, pad.plotT);
    ctx.lineTo(x, pad.plotB);
    ctx.stroke();
    ctx.fillStyle = muted;
    ctx.fillText(fmt(t), x, pad.plotB + 6);
  });
  // x axis title
  if (opts.xTitle) {
    ctx.fillStyle = ink;
    ctx.font = "600 12px 'Sora', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.xTitle, (pad.plotL + pad.plotR) / 2, h - 6);
  }
  // y axis title
  if (opts.yTitle) {
    ctx.save();
    ctx.translate(14, (pad.plotT + pad.plotB) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = ink;
    ctx.font = "600 12px 'Sora', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(opts.yTitle, 0, 0);
    ctx.restore();
  }
  // rows
  const row = (pad.plotB - pad.plotT) / data.length;
  data.forEach((d, i) => {
    const v = value(d);
    const y = pad.plotT + i * row;
    const bw = (pad.plotR - pad.plotL) * (v / maxV);
    ctx.fillStyle = ink;
    ctx.font = "600 13px 'Space Grotesk', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label(d), 16, y + row * 0.5);
    const color = palette[i % palette.length];
    ctx.shadowColor = color + "88";
    ctx.shadowBlur = 16;
    ctx.fillStyle = gradFill(ctx, pad.plotL, y + row * 0.25, bw, row * 0.5, color);
    roundRect(ctx, pad.plotL, y + row * 0.28, Math.max(bw, 4), row * 0.44, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = ink;
    ctx.font = "700 13px 'Sora', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(opts.valueFmt ? opts.valueFmt(v) : fmt(v), pad.plotL + bw + 8, y + row * 0.5);
  });
}

function scatter(id, data, xv, yv, opts = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const pad = { plotL: 64, plotR: w - 16, plotT: 16, plotB: h - 56 };
  const xs = data.map(xv), ys = data.map(yv);
  const xMaxRaw = Math.max(...xs);
  const xMinRaw = Math.min(...xs);
  const yTicks = niceTicks(Math.max(...ys));
  const yMax = yTicks[yTicks.length - 1];
  // y axis grid + labels
  drawAxes(ctx, w, h, pad, yTicks, opts);
  // x axis ticks (5)
  const xTicks = niceTicks(xMaxRaw, 5);
  const xMax = xTicks[xTicks.length - 1];
  const xMin = 0;
  ctx.font = "11px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  xTicks.forEach(t => {
    const x = pad.plotL + (t - xMin) / (xMax - xMin) * (pad.plotR - pad.plotL);
    ctx.strokeStyle = t === 0 ? "rgba(255,255,255,.18)" : gridLine;
    ctx.beginPath();
    ctx.moveTo(x, pad.plotT);
    ctx.lineTo(x, pad.plotB);
    ctx.stroke();
    ctx.fillStyle = muted;
    ctx.fillText(opts.xFmt ? opts.xFmt(t) : fmt(t), x, pad.plotB + 6);
  });
  // points
  data.forEach((d, i) => {
    const x = pad.plotL + (xv(d) - xMin) / (xMax - xMin) * (pad.plotR - pad.plotL);
    const y = pad.plotB - (yv(d) / yMax) * (pad.plotB - pad.plotT);
    const color = palette[i % palette.length];
    const grad = ctx.createRadialGradient(x, y, 1, x, y, 22);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + "00");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.shadowColor = color; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (opts.pointLabel) {
      ctx.fillStyle = ink;
      ctx.font = "600 11px 'Sora', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(opts.pointLabel(d), x, y - 12);
    }
  });
}

function line(id, data, label, value, opts = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const { ctx, w, h } = setupCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const pad = { plotL: 64, plotR: w - 16, plotT: 16, plotB: h - 56 };
  const yMaxRaw = Math.max(...data.map(value));
  const yTicks = niceTicks(yMaxRaw);
  const yMax = yTicks[yTicks.length - 1];
  drawAxes(ctx, w, h, pad, yTicks, opts);
  const pts = data.map((d, i) => ({
    x: pad.plotL + i * (pad.plotR - pad.plotL) / (data.length - 1),
    y: pad.plotB - (value(d) / yMax) * (pad.plotB - pad.plotT),
    d
  }));
  // area
  const areaGrad = ctx.createLinearGradient(0, pad.plotT, 0, pad.plotB);
  areaGrad.addColorStop(0, "rgba(255,209,102,.45)");
  areaGrad.addColorStop(1, "rgba(255,209,102,0)");
  ctx.fillStyle = areaGrad;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pad.plotB);
  pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.lineTo(pts[pts.length - 1].x, pad.plotB);
  ctx.closePath();
  ctx.fill();
  // line
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#ffd16699";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
  ctx.stroke();
  ctx.shadowBlur = 0;
  pts.forEach(pt => {
    ctx.fillStyle = "#0c1326";
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffd166";
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill();
    // x label
    ctx.fillStyle = muted;
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label(pt.d), pt.x, pad.plotB + 6);
    // value above point
    ctx.fillStyle = ink;
    ctx.font = "700 11px 'Sora', sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.valueFmt ? opts.valueFmt(value(pt.d)) : fmt(value(pt.d)), pt.x, pt.y - 10);
  });
}

function roundRect(ctx, x, y, w, h, r) {
  if (h < 0) { y += h; h = -h; }
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function renderAll(data) {
  bars("energyTrend", data.energyTrend, d => d.year, d => d.consumption,
    { xTitle: "Year", yTitle: "Consumption (TWh)", valueFmt: v => v + " TWh" });

  bars("techChart", data.technologies, d => d.name, d => d.count,
    { xTitle: "Screen Technology", yTitle: "Number of Models" });

  bars("sizeChart", data.screenSizes, d => d.size + '"', d => d.count,
    { xTitle: "Screen Size (inches)", yTitle: "Number of Models" });

  horizontalBars("brandChart", data.brands, d => d.brand, d => d.models,
    { xTitle: "Number of Models", yTitle: "Brand" });

  bars("powerTechChart", data.powerByTech, d => d.name, d => d.avgWatts,
    { xTitle: "Screen Technology", yTitle: "Average Active Power (W)", valueFmt: v => v + " W" });

  scatter("sizePowerChart", data.screenSizes, d => +d.size, d => d.watts,
    { xTitle: "Screen Size (inches)", yTitle: "Active Power (W)",
      pointLabel: d => d.size + '"', xFmt: t => t + '"' });

  line("starChart", data.screenSizes, d => d.size + '"', d => d.stars,
    { xTitle: "Screen Size (inches)", yTitle: "Energy Star Rating",
      valueFmt: v => v.toFixed(1) + "★" });

  horizontalBars("brandPowerChart", data.brands, d => d.brand, d => d.watts,
    { xTitle: "Average Active Power (W)", yTitle: "Brand", valueFmt: v => v + " W" });

  bars("storyTechChart", data.powerByTech, d => d.name, d => d.avgWatts,
    { xTitle: "Screen Technology", yTitle: "Average Active Power (W)", valueFmt: v => v + " W" });

  scatter("storyCostChart", data.cost, d => d.watts, d => d.cost,
    { xTitle: "Active Power (W)", yTitle: "Estimated Annual Cost (AUD)",
      xFmt: t => t + " W" });
}

let cached = null;
loadData().then(d => { cached = d; renderAll(d); });
let resizeT;
window.addEventListener("resize", () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => { if (cached) renderAll(cached); }, 120);
});
