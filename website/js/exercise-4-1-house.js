/** Exercise 4.1 — one SVG scene at a time (no stacked scroll) */
(function () {
  const TOP_H = 400;
  const SCENE_H = 500;
  const SVG_WIDTH = 900;
  /** Match Exercise 5 & 6 chart frame (1000×480) */
  const EX_VIEW_W = 1000;
  const EX_VIEW_H = 480;
  const GROUND_Y = 320;
  const COORD_COLOR = "#2980b9";

  const SCENE1_MARKS = [
    { name: "Sun", x: 750, y: 55 },
    { name: "Cloud 1", x: 140, y: 45 },
    { name: "Cloud 2", x: 480, y: 35 },
    { name: "Cloud 3", x: 650, y: 55 },
    { name: "Tree 1", x: 90, y: 320 },
    { name: "Tree 2", x: 780, y: 320 },
    { name: "Road (centre)", x: 420, y: 332 },
    { name: "House (group origin)", x: 360, y: 155 },
    { name: "House (roof peak)", x: 420, y: 160 },
    { name: "House (wall top-left)", x: 360, y: 205 },
    { name: "House (door)", x: 408, y: 280 },
    { name: "House (window left)", x: 378, y: 223 },
    { name: "House (window right)", x: 436, y: 223 },
  ];

  /** Scenes 2 & 3 share one palette (distinct from Scene 1’s classic look) */
  const GARDEN_THEME = {
    canvas: "#f7f4ef",
    sky: "#b8daf0",
    grass: "#68a85c",
    sun: { fill: "#ffcc80", stroke: "#ef6c00" },
    house: {
      wall: "#f2e2c4",
      stroke: "#c4a574",
      roof: "#c65d3b",
      roofStroke: "#a3472f",
      door: "#5d4037",
    },
    window: "#cce7f5",
    fence: { fill: "#e6d4b8", stroke: "#b8956a" },
    pond: { shore: "#9a8b78", water: "#6ec6d9" },
  };
  const CLOUD_COLOR = "#ffffff";
  const TREE_COLORS = "#6b4220 (trunk), #27ae60 / #2ecc71 / #3ddc84 (leaves)";

  const GARDEN_FLOWERS = [
    { name: "Flower 1", x: 88, y: 355, color: "#e74c3c" },
    { name: "Flower 2", x: 118, y: 365, color: "#f1c40f" },
    { name: "Flower 3", x: 92, y: 378, color: "#e91e63" },
    { name: "Flower 4", x: 145, y: 358, color: "#3498db" },
    { name: "Flower 5", x: 168, y: 372, color: "#9b59b6" },
    { name: "Flower 6", x: 135, y: 388, color: "#e67e22" },
    { name: "Flower 7", x: 105, y: 392, color: "#f39c12" },
    { name: "Flower 8", x: 532, y: 368, color: "#e67e22" },
    { name: "Flower 9", x: 548, y: 376, color: "#e91e63" },
    { name: "Flower 10", x: 702, y: 392, color: "#e74c3c" },
    { name: "Flower 11", x: 728, y: 378, color: "#f1c40f" },
    { name: "Flower 12", x: 755, y: 385, color: "#9b59b6" },
    { name: "Flower 13", x: 778, y: 395, color: "#3498db" },
  ];

  const SCENE3_MARKS = [
    { name: "Origin", x: 0, y: 0, color: COORD_COLOR },
    { name: "Sun", x: 780, y: 70, color: `${GARDEN_THEME.sun.fill} (fill), ${GARDEN_THEME.sun.stroke} (stroke)` },
    { name: "Cloud 1", x: 120, y: 70, color: CLOUD_COLOR },
    { name: "Cloud 2", x: 320, y: 50, color: CLOUD_COLOR },
    { name: "Cloud 3", x: 500, y: 85, color: CLOUD_COLOR },
    { name: "Cloud 4", x: 680, y: 60, color: CLOUD_COLOR },
    { name: "Cloud 5", x: 820, y: 100, color: CLOUD_COLOR },
    { name: "Tree 1", x: 70, y: GROUND_Y, color: TREE_COLORS },
    { name: "Tree 2", x: 180, y: GROUND_Y, color: TREE_COLORS },
    { name: "Tree 3", x: 520, y: GROUND_Y, color: TREE_COLORS },
    { name: "Tree 4", x: 620, y: GROUND_Y, color: TREE_COLORS },
    { name: "Tree 5", x: 750, y: GROUND_Y, color: TREE_COLORS },
    { name: "Tree 6", x: 850, y: GROUND_Y, color: TREE_COLORS },
    {
      name: "Pond",
      x: 620,
      y: 432,
      color: `${GARDEN_THEME.pond.shore} (shore), ${GARDEN_THEME.pond.water} (water)`,
    },
    ...GARDEN_FLOWERS,
    { name: "House (wall corner)", x: 300, y: 260, color: GARDEN_THEME.house.wall },
    { name: "House (roof peak)", x: 400, y: 190, color: GARDEN_THEME.house.roof },
    { name: "House (door)", x: 400, y: 345, color: GARDEN_THEME.house.door },
    { name: "House (window left)", x: 345, y: 302, color: GARDEN_THEME.window },
    { name: "House (window right)", x: 455, y: 302, color: GARDEN_THEME.window },
    {
      name: "Fence post 1",
      x: 80,
      y: 300,
      color: `${GARDEN_THEME.fence.fill} (fill), ${GARDEN_THEME.fence.stroke} (stroke)`,
    },
    {
      name: "Fence post 2",
      x: 320,
      y: 280,
      color: `${GARDEN_THEME.fence.fill} (fill), ${GARDEN_THEME.fence.stroke} (stroke)`,
    },
    {
      name: "Fence post 3",
      x: 430,
      y: 280,
      color: `${GARDEN_THEME.fence.fill} (fill), ${GARDEN_THEME.fence.stroke} (stroke)`,
    },
    {
      name: "Fence post 4",
      x: 380,
      y: 310,
      color: `${GARDEN_THEME.fence.fill} (fill), ${GARDEN_THEME.fence.stroke} (stroke)`,
    },
  ];
  const DASH = { stroke: COORD_COLOR, "stroke-width": 1.5, "stroke-dasharray": "5,4" };

  function gardenPaletteTable() {
    const t = GARDEN_THEME;
    return [
      { part: "Canvas background", color: t.canvas },
      { part: "Sky", color: t.sky },
      { part: "Grass", color: t.grass },
      { part: "Sun", color: `${t.sun.fill} (fill), ${t.sun.stroke} (stroke)` },
      { part: "Clouds", color: CLOUD_COLOR },
      { part: "Trees", color: TREE_COLORS },
      { part: "Pond shore", color: t.pond.shore },
      { part: "Pond water", color: t.pond.water },
      { part: "House wall", color: t.house.wall },
      { part: "House outline", color: t.house.stroke },
      { part: "House roof", color: `${t.house.roof} (fill), ${t.house.roofStroke} (stroke)` },
      { part: "House door", color: t.house.door },
      { part: "House windows", color: t.window },
      { part: "Fence", color: `${t.fence.fill} (fill), ${t.fence.stroke} (stroke)` },
      { part: "Flower stems / leaves", color: "#2d6b1a, #3d9b2e" },
      { part: "Flower centre", color: "#f4d03f, #e67e22" },
      { part: "Coordinate guides (Scene 3)", color: COORD_COLOR },
    ];
  }

  function marksToRows(marks, withColor) {
    return marks.map(({ name, x, y, color }) => {
      const row = {
        element: name,
        x,
        y,
        "x-axis (0 → x)": `0 → ${x}`,
        "y-axis (0 → y)": `0 → ${y}`,
      };
      if (withColor) row.color = color || "—";
      return row;
    });
  }

  function logExercise41Scene(sceneNum, height) {
    if (typeof logChartConsole !== "function") return;
    const titles = {
      1: "Exercise 4.1 — Scene 1 (Simple house)",
      2: "Exercise 4.1 — Scene 2 (Full garden)",
      3: "Exercise 4.1 — Scene 3 (Coordinates)",
    };
    const title = titles[sceneNum] || `Exercise 4.1 — Scene ${sceneNum}`;
    const xLabel = "x (pixels, → right)";
    const yLabel = "y (pixels, ↓ down)";
    const xDomain = [0, EX_VIEW_W];
    const yDomain = [0, EX_VIEW_H];
    const marks =
      sceneNum === 1 ? SCENE1_MARKS : sceneNum === 2 || sceneNum === 3 ? SCENE3_MARKS : null;
    const withColor = sceneNum === 2 || sceneNum === 3;

    if (marks) {
      logChartConsole(title, marksToRows(marks, withColor), xLabel, xDomain, yLabel, yDomain, {
        table: true,
      });
      if (withColor) {
        console.group(`${title} — Scene 2 & 3 colour palette`);
        console.table(gardenPaletteTable());
        console.groupEnd();
      }
      return;
    }

    logChartConsole(title, [], xLabel, xDomain, yLabel, yDomain);
  }

  function drawCloud(parent, x, y) {
    const g = parent.append("g").attr("transform", `translate(${x},${y})`);
    g.append("circle").attr("cx", 0).attr("cy", 15).attr("r", 28).attr("fill", "white");
    g.append("circle").attr("cx", -28).attr("cy", 20).attr("r", 22).attr("fill", "white");
    g.append("circle").attr("cx", 28).attr("cy", 20).attr("r", 22).attr("fill", "white");
    g.append("circle").attr("cx", -14).attr("cy", 0).attr("r", 24).attr("fill", "white");
    g.append("circle").attr("cx", 20).attr("cy", 2).attr("r", 26).attr("fill", "white");
  }

  function drawTree(parent, x, groundY) {
    const TRUNK_H = 35;
    const g = parent.append("g").attr("transform", `translate(${x}, ${groundY - TRUNK_H})`);
    g.append("rect").attr("x", -5).attr("y", 0).attr("width", 10).attr("height", TRUNK_H).attr("fill", "#6b4220");
    g.append("circle").attr("cx", 0).attr("cy", -14).attr("r", 30).attr("fill", "#27ae60");
    g.append("circle").attr("cx", 0).attr("cy", -40).attr("r", 24).attr("fill", "#2ecc71");
    g.append("circle").attr("cx", 0).attr("cy", -60).attr("r", 18).attr("fill", "#3ddc84");
  }

  function drawFlower(parent, x, y, color) {
    const g = parent.append("g").attr("transform", `translate(${x},${y})`);
    g.append("line").attr("x1", 0).attr("y1", 6).attr("x2", 0).attr("y2", 38)
      .attr("stroke", "#2d6b1a").attr("stroke-width", 2.5).attr("stroke-linecap", "round");
    g.append("rect").attr("x", -15).attr("y", 14).attr("width", 11).attr("height", 5)
      .attr("fill", "#3d9b2e").attr("rx", 2);
    g.append("rect").attr("x", 5).attr("y", 22).attr("width", 11).attr("height", 5)
      .attr("fill", "#3d9b2e").attr("rx", 2);
    [[0, -13], [12, -4], [8, 11], [-8, 11], [-12, -4]].forEach(([px, py]) => {
      g.append("circle").attr("cx", px).attr("cy", py).attr("r", 7).attr("fill", color);
    });
    g.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 6).attr("fill", "#f4d03f");
    g.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 3).attr("fill", "#e67e22");
  }

  function drawCoordinateAxes(parent, width, height) {
    const g = parent.append("g").attr("class", "coord-axes");
    const axis = {
      stroke: COORD_COLOR,
      "stroke-width": 2.5,
      "stroke-linecap": "round",
    };
    g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", width).attr("y2", 0).attr(axis);
    g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", height).attr(axis);
    g.append("text")
      .attr("x", width - 6)
      .attr("y", 18)
      .attr("text-anchor", "end")
      .attr("font-family", "Verdana")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("fill", COORD_COLOR)
      .text("x");
    g.append("text")
      .attr("x", 14)
      .attr("y", 22)
      .attr("font-family", "Verdana")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("fill", COORD_COLOR)
      .text("y");
  }

  function markPoint(parent, x, y) {
    const g = parent.append("g");
    if (x === 0 && y === 0) {
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", COORD_COLOR)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
      g.append("text")
        .attr("x", 14)
        .attr("y", 22)
        .attr("font-family", "Verdana")
        .attr("font-size", 11)
        .attr("font-weight", "bold")
        .attr("fill", COORD_COLOR)
        .text("(0,0)");
      return;
    }
    g.append("line").attr("x1", 0).attr("y1", y).attr("x2", x).attr("y2", y).attr(DASH);
    g.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", y).attr(DASH);
    g.append("circle").attr("cx", x).attr("cy", y).attr("r", 5)
      .attr("fill", COORD_COLOR).attr("stroke", "#fff").attr("stroke-width", 1.5);
    g.append("text").attr("x", x).attr("y", y - 8).attr("text-anchor", "middle")
      .attr("font-family", "Verdana").attr("font-size", 11).attr("font-weight", "bold")
      .attr("fill", COORD_COLOR).text(`(${x},${y})`);
  }

  function drawGarden(svg, sceneNum) {
    const showCoords = sceneNum === 3;
    const t = GARDEN_THEME;
    svg.append("rect").attr("width", SVG_WIDTH).attr("height", SCENE_H).attr("fill", t.canvas);
    svg.append("rect").attr("width", SVG_WIDTH).attr("height", 320).attr("fill", t.sky);
    svg.append("rect").attr("y", 320).attr("width", SVG_WIDTH).attr("height", 180).attr("fill", t.grass);
    svg.append("circle").attr("cx", 780).attr("cy", 70).attr("r", 40)
      .attr("fill", t.sun.fill).attr("stroke", t.sun.stroke).attr("stroke-width", 2);
    drawCloud(svg, 120, 70);
    drawCloud(svg, 320, 50);
    drawCloud(svg, 500, 85);
    drawCloud(svg, 680, 60);
    drawCloud(svg, 820, 100);
    [70, 180, 520, 620, 750, 850].forEach((x) => drawTree(svg, x, GROUND_Y));
    svg.append("ellipse").attr("cx", 620).attr("cy", 435).attr("rx", 75).attr("ry", 30).attr("fill", t.pond.shore);
    svg.append("ellipse").attr("cx", 620).attr("cy", 432).attr("rx", 65).attr("ry", 24).attr("fill", t.pond.water);
    GARDEN_FLOWERS.forEach(({ x, y, color }) => drawFlower(svg, x, y, color));
    const house = svg.append("g").attr("transform", "translate(300, 180)");
    house.append("rect").attr("x", 0).attr("y", 80).attr("width", 200).attr("height", 120)
      .attr("fill", t.house.wall).attr("stroke", t.house.stroke).attr("stroke-width", 2);
    house.append("path").attr("d", "M-10,85 L100,10 L210,85 Z")
      .attr("fill", t.house.roof).attr("stroke", t.house.roofStroke).attr("stroke-width", 2);
    house.append("rect").attr("x", 80).attr("y", 130).attr("width", 40).attr("height", 70).attr("fill", t.house.door);
    const winL = house.append("g").attr("transform", "translate(20, 100)");
    winL.append("rect").attr("width", 50).attr("height", 45).attr("fill", t.window).attr("stroke", "#555").attr("stroke-width", 1.5);
    const winR = house.append("g").attr("transform", "translate(130, 100)");
    winR.append("rect").attr("width", 50).attr("height", 45).attr("fill", t.window).attr("stroke", "#555").attr("stroke-width", 1.5);
    for (let x = 80; x < 260; x += 25) {
      svg.append("rect").attr("x", x).attr("y", 300).attr("width", 10).attr("height", 35)
        .attr("fill", t.fence.fill).attr("stroke", t.fence.stroke);
    }
    if (showCoords) {
      drawCoordinateAxes(svg, SVG_WIDTH, SCENE_H);
      const marks = svg.append("g").attr("class", "coord-marks");
      SCENE3_MARKS.forEach(({ x, y }) => markPoint(marks, x, y));
    }
  }

  /** Scene 1 — classic course colours (simple house) */
  function drawHouse1(svg) {
    svg.append("rect").attr("width", SVG_WIDTH).attr("height", TOP_H).attr("fill", "#fafafa");
    svg.append("rect").attr("width", SVG_WIDTH).attr("height", 260).attr("fill", "#87ceeb");
    svg.append("rect").attr("y", 260).attr("width", SVG_WIDTH).attr("height", TOP_H - 260).attr("fill", "#6abf45");
    svg.append("circle").attr("cx", 750).attr("cy", 55).attr("r", 35)
      .attr("fill", "yellow").attr("stroke", "orange").attr("stroke-width", 2);
    drawCloud(svg, 140, 45);
    drawCloud(svg, 480, 35);
    drawCloud(svg, 650, 55);
    drawTree(svg, 90, 320);
    drawTree(svg, 780, 320);
    svg.append("path").attr("d", "M406,280 L434,280 L452,385 L388,385 Z")
      .attr("fill", "#d5b882").attr("stroke", "#b8975a").attr("stroke-width", 1.5);
    const simple = svg.append("g").attr("transform", "translate(360, 155)");
    simple.append("rect").attr("x", 0).attr("y", 50).attr("width", 120).attr("height", 75)
      .attr("fill", "#f4d9a0").attr("stroke", "#c8a060").attr("stroke-width", 2);
    simple.append("path").attr("d", "M-8,55 L60,5 L128,55 Z").attr("fill", "#c0392b");
    simple.append("rect").attr("x", 48).attr("y", 88).attr("width", 24).attr("height", 37).attr("fill", "#7d4e1f");
    simple.append("rect").attr("x", 18).attr("y", 68).attr("width", 26).attr("height", 22).attr("fill", "#aed6f1");
    simple.append("rect").attr("x", 76).attr("y", 68).attr("width", 26).attr("height", 22).attr("fill", "#aed6f1");
  }

  function mountSvg(container, contentH) {
    d3.select(container).selectAll("*").remove();
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${EX_VIEW_W} ${EX_VIEW_H}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("width", EX_VIEW_W)
      .attr("height", EX_VIEW_H);
    const scale = Math.min(EX_VIEW_W / SVG_WIDTH, EX_VIEW_H / contentH);
    const tx = (EX_VIEW_W - SVG_WIDTH * scale) / 2;
    const ty = (EX_VIEW_H - contentH * scale) / 2;
    return svg
      .append("g")
      .attr("transform", `translate(${tx},${ty}) scale(${scale})`);
  }

  window.initExercise41 = function () {
    const mount = document.getElementById("ex4-canvas-41");
    const picker = document.querySelector("#lab-4-1 .ex4-scene-picker");
    if (!mount || typeof d3 === "undefined") return;

    function showScene(n) {
      picker?.querySelectorAll("[data-scene]").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.scene === String(n));
      });
      const height = n === 1 ? TOP_H : SCENE_H;
      const svg = mountSvg(mount, height);
      if (n === 1) drawHouse1(svg);
      else drawGarden(svg, n);
      logExercise41Scene(n, height);
    }

    picker?.querySelectorAll("[data-scene]").forEach((btn) => {
      btn.addEventListener("click", () => showScene(+btn.dataset.scene));
    });

    showScene(1);
  };
})();
