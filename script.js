// Wait for amCharts to be ready
am4core.ready(function() {
    // Use themes
    am4core.useTheme(am4themes_animated);

    // Create map instance
    const chart = am4core.create("chartdiv", am4maps.MapChart);

    // Set map definition
    chart.geodata = am4geodata_worldLow;

    // Set projection
    chart.projection = new am4maps.projections.Orthographic();
    chart.panBehavior = "rotateLongLat"; // Enable drag to rotate

    // Auto-Rotation Variables
    const autoRotateSpeed = 0.3; // degrees per frame
    let isAutoRotating = true;

    // Set initial angles
    chart.deltaLongitude = 0;
    chart.deltaLatitude = -20;

    // Limit vertical rotation (avoid extreme polar angles)
    chart.adapter.add("deltaLatitude", function(deltaLatitude) {
        return am4core.math.fitToRange(deltaLatitude, -70, 70); // Limit between -70 and 70 degrees
    });

    // Create background series
    chart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#00d2ff");
    chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;

    // Create main polygon series
    const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;

    // Configure main polygon series
    const polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}";
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.stroke = am4core.color("#c8b097");
    polygonTemplate.strokeWidth = 0.5;
    polygonTemplate.fill = am4core.color("#f9e3ce");

    // Hover state
    const hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#deb7ad");

    // Click event
    polygonTemplate.events.on("hit", function(ev) {
        console.log(ev.target.dataItem.dataContext.name + " was clicked.");
    });

    // Mask the poles by adding invisible "cutout" polygons over them
    const poleMaskSeries = chart.series.push(new am4maps.MapPolygonSeries());
    poleMaskSeries.useGeodata = false;
    poleMaskSeries.tooltip.fillOpacity = 0;

    const northPole = poleMaskSeries.mapPolygons.create();
    northPole.multiPolygon = am4maps.getCircle(0, 90, 5); // Center at (0, 90) with radius of 30
    northPole.fill = am4core.color("#000"); // Set the fill to the same as the background
    northPole.strokeOpacity = 0; // Remove stroke

    // Add auto-rotation
    chart.events.on("ready", function() {
        rotateGlobe();
    });

    function rotateGlobe() {
        if (isAutoRotating) {
            chart.deltaLongitude += autoRotateSpeed;
        }
        requestAnimationFrame(rotateGlobe);
    }

    // Handle window resize
    window.addEventListener("resize", function() {
        chart.invalidateSize();
    });
}); // end am4core.ready()
