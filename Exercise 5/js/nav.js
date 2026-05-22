const navButtons = document.querySelectorAll(".nav-btn");
const chartPanels = document.querySelectorAll(".chart-panel");

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;

    navButtons.forEach(btn => btn.classList.remove("active"));
    chartPanels.forEach(panel => panel.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(targetId).classList.add("active");
  });
});