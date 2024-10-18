let importedCountryName = null;

function setCountryName(param) {
	importedCountryName = param;
}

am4core.ready(function () {
	// Use themes
	am4core.useTheme(am4themes_animated);

	// Create map instance
	const chart = am4core.create('chartdiv', am4maps.MapChart);

	// Set map definition
	chart.geodata = am4geodata_worldLow;

	// Set projection
	chart.projection = new am4maps.projections.Orthographic();
	chart.panBehavior = 'rotateLongLat'; // Enable drag to rotate

	// Auto-Rotation Variables
	const autoRotateSpeed = 0.3; // degrees per frame
	let isAutoRotating = true;

	// Set initial angles
	chart.deltaLongitude = 0;
	chart.deltaLatitude = -20;

	// Limit vertical rotation (avoid extreme polar angles)
	chart.adapter.add('deltaLatitude', function (deltaLatitude) {
		return am4core.math.fitToRange(deltaLatitude, -70, 70); // Limit between -70 and 70 degrees
	});

	// Create background series
	chart.backgroundSeries.mapPolygons.template.polygon.fill =
		am4core.color('#00d2ff');
	chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;

	// Create main polygon series
	const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
	polygonSeries.useGeodata = true;

	// Configure main polygon series
	const polygonTemplate = polygonSeries.mapPolygons.template;
	polygonTemplate.tooltipText = '{name}';
	polygonTemplate.nonScalingStroke = true;
	polygonTemplate.stroke = am4core.color('#c8b097');
	polygonTemplate.strokeWidth = 0.5;
	polygonTemplate.fill = am4core.color('#f9e3ce');

	// Hover state
	const hs = polygonTemplate.states.create('hover');
	hs.properties.fill = am4core.color('#deb7ad');

	// Click event for polygons
	polygonTemplate.events.on('hit', function (ev) {
		const countryName = ev.target.dataItem.dataContext.name;
		console.log(countryName + ' was clicked.');
		fetchCountryData(countryName); // Fetch country description based on the country clicked
		fetchPhotos(countryName); // Fetch country photos for the gallery
	});

	// Mask the poles by adding invisible "cutout" polygons over them
	const poleMaskSeries = chart.series.push(new am4maps.MapPolygonSeries());
	poleMaskSeries.useGeodata = false;
	poleMaskSeries.tooltip.fillOpacity = 0;

	const northPole = poleMaskSeries.mapPolygons.create();
	northPole.multiPolygon = am4maps.getCircle(0, 90, 5); // Center at (0, 90) with radius of 30
	northPole.fill = am4core.color('#000'); // Set the fill to the same as the background
	northPole.strokeOpacity = 0; // Remove stroke

	// Add auto-rotation
	chart.events.on('ready', function () {
		rotateGlobe();
	});
	chart.events.on('down', function () {
		isAutoRotating = false; // Stop auto-rotation when dragging starts
	});

	chart.events.on('up', function () {
		isAutoRotating = true; // Resume auto-rotation when dragging stops
	});

	function rotateGlobe() {
		if (isAutoRotating) {
			chart.deltaLongitude += autoRotateSpeed;
		}
		requestAnimationFrame(rotateGlobe);
	}

	// Handle window resize
	window.addEventListener('resize', function () {
		chart.invalidateSize();
	});

	// Fetch country description from the RESTCountries API based on the country name
	function fetchCountryData(countryName) {
		const descUrl = `https://restcountries.com/v3.1/name/${countryName}`;

		fetch(descUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				console.log(data);
				displayInformation(data[0], countryName); // Pass results to displayInformation function
			})
			.catch((error) =>
				console.error('Error fetching country information:', error)
			);
	}

	function fetchPhotos(countryName) {
		const accessKey = 'tJ09kKCBN7Cj2lrA_wNNOdGoAdL093PEtcTZRrVVVeM'; // Replace with your Unsplash access key
		const imageUrl = `https://api.unsplash.com/search/photos?query=${countryName}&client_id=${accessKey}`;

		fetch(imageUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				console.log(data);
				displayGallery(data.results);
			})
			.catch((error) => console.error('Error fetching photos:', error));
	}

	let currentCardIndex = 0; // Track the current card index

	function createCard(imageUrl) {
		const subDiv = document.createElement('div');
		subDiv.className = 'card';

		const img = document.createElement('img');
		img.className = 'card-img';
		img.src = imageUrl;
		subDiv.appendChild(img);

		return subDiv;
	}

	function displayGallery(photos) {
		const imageStack = document.getElementById('stack');
		imageStack.className = 'stack';
		imageStack.innerHTML = ''; // Clear existing cards

		photos.forEach((photo) => {
			const cardElement = createCard(photo.urls.small);
			imageStack.appendChild(cardElement);
		});

		// Start autoplay movement of cards after displaying
		autoplayCards();
	}

	function autoplayCards() {
		const stack = document.querySelector('.stack');
		const cards = Array.from(stack.children)
			.reverse()
			.filter((child) => child.classList.contains('card'));

		cards.forEach((card) => stack.appendChild(card));

		let autoplayInterval = setInterval(moveCard, 4000);

		function moveCard() {
			const lastCard = stack.lastElementChild;
			if (lastCard && lastCard.classList.contains('card')) {
				lastCard.classList.add('swap');

				setTimeout(() => {
					lastCard.classList.remove('swap');
					stack.insertBefore(lastCard, stack.firstElementChild);
				}, 1200);
			}
		}

		stack.addEventListener('click', function (e) {
			const card = e.target.closest('.card');
			if (card && card === stack.lastElementChild) {
				card.classList.add('swap');

				setTimeout(() => {
					card.classList.remove('swap');
					stack.insertBefore(card, stack.firstElementChild);
				}, 1200);
			}
		});
	}

	function displayInformation(countryData, countryName) {
		const countryNameElement = document.getElementById('country-name');
		countryNameElement.innerText = countryName;

		const capital = document.createElement('p');
		capital.innerHTML = `<strong>Capital:</strong> ${countryData.capital}`;

		const population = document.createElement('p');
		population.innerHTML = `<strong>Population:</strong> ${countryData.population.toLocaleString()}`;

		const region = document.createElement('p');
		region.innerHTML = `<strong>Region:</strong> ${countryData.region}`;

		const subregion = document.createElement('p');
		subregion.innerHTML = `<strong>Subregion:</strong> ${countryData.subregion}`;

		const languages = document.createElement('p');
		const languageList = Object.values(countryData.languages).join(', ');
		languages.innerHTML = `<strong>Languages:</strong> ${languageList}`;

		const galleryContainer = document.getElementById('galleryContent');
		galleryContainer.innerHTML = '';
		galleryContainer.appendChild(capital);
		galleryContainer.appendChild(population);
		galleryContainer.appendChild(region);
		galleryContainer.appendChild(subregion);
		galleryContainer.appendChild(languages);
	}

	if (importedCountryName !== '') {
		const url = `https://restcountries.com/v3.1/name/${importedCountryName}`;

		// Fetch country data based on the country name
		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				if (data && data.length > 0) {
					const countryData = data[0];
					const latlng = countryData.latlng; // Get latitude and longitude
					if (latlng) {
						const [latitude, longitude] = latlng;
						console.log(
							`Latitude: ${latitude}, Longitude: ${longitude} for ${importedCountryName}`
						);
						placeMarker(latitude, longitude); // Place the marker on the globe
					} else {
						console.log(
							`Latitude and Longitude not available for ${importedCountryName}`
						);
					}
				} else {
					console.log(`No data found for ${importedCountryName}`);
				}
			})
			.catch((error) =>
				console.error(
					`Error fetching latitude and longitude for ${importedCountryName}:`,
					error
				)
			);
	}

	// Function to place a marker at the specified latitude and longitude
	function placeMarker(longitude, latitude) {
		// Convert geographic coordinates to pixel coordinates
		const point = chart.projection.convert({
			longitude: longitude,
			latitude: latitude,
		});

		// Define your SVG marker
		const svgMarker = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30">
            <circle cx="10" cy="10" r="10" fill="blue" />
        </svg>
    `;

		// Create marker element
		const marker = document.createElement('div');
		marker.id = 'bounce-marker'; // Use the same ID as in your existing animation code
		marker.className = 'float'; // Apply CSS class for animations
		marker.style.position = 'absolute'; // Positioning
		marker.style.transform = `translate(${point.x}px, ${point.y}px)`; // Position based on converted coordinates

		// Set the inner HTML to your SVG marker
		marker.innerHTML = svgMarker;

		// Append the marker to the chart container
		chart.chartContainer.htmlContainer.appendChild(marker);

		// Apply animations (you can keep your existing animation code)
		TweenMax.fromTo(
			'#bounce-marker',
			2.4,
			{
				opacity: 0,
				y: `-1000px`,
				scaleY: 2,
			},
			{
				y: '0px',
				opacity: 1,
				scaleY: 1,
				ease: Bounce.easeOut,
			}
		);
	}
});
