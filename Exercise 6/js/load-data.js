// Uses embedded tvData variable from js/tv-data.js (works with file:// locally)
// Falls back to fetching the CSV if served from a web server
(function () {
    function init(data) {
        drawHistogram(data);
        populateFilters(data);
        drawScatterplot(data);
    }

    if (typeof tvData !== "undefined") {
        // Data is embedded — works offline / file:// 
        init(tvData);
    } else {
        // Fallback: fetch CSV (requires a web server)
        d3.csv("data/Ex6_TVdata.csv", d => ({
            brand: d.brand,
            model: d.model,
            screenSize: +d.screenSize,
            screenTech: d.screenTech,
            energyConsumption: +d.energyConsumption,
            star: +d.star
        }))
        .then(init)
        .catch(error => console.error("Error loading CSV:", error));
    }
})();
