// Wait for amCharts to be ready
am4core.ready(function () {
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
    chart.adapter.add("deltaLatitude", function (deltaLatitude) {
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

    // Click event for polygons
    polygonTemplate.events.on("hit", function (ev) {
        const countryName = ev.target.dataItem.dataContext.name;
        console.log(countryName + " was clicked.");
        fetchPhotos(countryName); // Fetch photos based on the clicked country
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
    chart.events.on("ready", function () {
        rotateGlobe();
    });

    function rotateGlobe() {
        if (isAutoRotating) {
            chart.deltaLongitude += autoRotateSpeed;
        }
        requestAnimationFrame(rotateGlobe);
    }

    // Handle window resize
    window.addEventListener("resize", function () {
        chart.invalidateSize();
    });

    // Fetch photos from Unsplash API based on the country name
    function fetchPhotos(countryName) {
        const accessKey = 'tJ09kKCBN7Cj2lrA_wNNOdGoAdL093PEtcTZRrVVVeM'; // Replace with your Unsplash access key
        const url = `https://api.unsplash.com/search/photos?query=${countryName}&client_id=${accessKey}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                displayGallery(data.results); // Pass results to displayGallery function
            })
            .catch(error => console.error('Error fetching photos:', error));
    }

    // Display gallery on the left side
    function displayGallery(photos) {
        const galleryContainer = document.getElementById('gallery'); // Ensure this element exists in your HTML
        galleryContainer.innerHTML = ''; // Clear previous gallery content
        galleryContainer.style.display = 'block'; // Show the gallery

        photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.urls.small; // Use the small URL for thumbnails
            img.alt = photo.description || 'Image'; // Alt text for accessibility
            img.style.width = '100px'; // Set desired width for images
            img.style.margin = '5px';
            galleryContainer.appendChild(img); // Append image to gallery
        });

        // Shift the globe
        chart.deltaLongitude -= 20; // Shift left when gallery is displayed
    }

    // Close the gallery
    function closeGallery() {
        const galleryContainer = document.getElementById('gallery');
        galleryContainer.style.display = 'none'; // Hide the gallery
        chart.deltaLongitude += 20; // Shift globe back to center
    }

    // Create close button for gallery
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close Gallery';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.left = '20px';
    closeButton.onclick = closeGallery; // Attach click event to close function
    document.body.appendChild(closeButton); // Add button to the body

}); // end am4core.ready()
