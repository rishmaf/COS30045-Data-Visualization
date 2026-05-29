/** Force identical chart SVG sizing on Exercise 4–6; fix tooltip/header overlap on scroll */
(function () {
  const FRAME_SEL =
    ".ex-chart-frame, .lab-chart.ex-chart-frame, #lab-4-1 .ex4-house-canvas";

  function normalizeChartSvgs() {
    document.querySelectorAll(FRAME_SEL).forEach((frame) => {
      const svg = frame.querySelector(":scope > svg");
      if (!svg) return;
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.setProperty("width", "100%", "important");
      svg.style.setProperty("height", "100%", "important");
      svg.style.setProperty("max-width", "100%", "important");
      svg.style.setProperty("max-height", "100%", "important");
      svg.style.setProperty("display", "block", "important");
    });
  }

  function hidePageTooltips() {
    document.querySelectorAll("#chart-tooltip").forEach((el) => {
      el.classList.remove("visible");
      el.style.removeProperty("opacity");
    });
  }

  let normalizeScheduled = false;
  function scheduleNormalize() {
    if (normalizeScheduled) return;
    normalizeScheduled = true;
    requestAnimationFrame(() => {
      normalizeScheduled = false;
      normalizeChartSvgs();
    });
  }

  function watch() {
    normalizeChartSvgs();
    document.querySelectorAll(".exercise-labs-main").forEach((root) => {
      new MutationObserver(scheduleNormalize).observe(root, {
        childList: true,
        subtree: true,
      });
    });
    window.addEventListener("scroll", hidePageTooltips, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }
  window.addEventListener("load", normalizeChartSvgs);
})();
