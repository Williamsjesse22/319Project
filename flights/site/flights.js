import {setCountryName} from "../../globeTraveler/script.js";

let dest = document.getElementById("dest").addEventListener("click", () => {
    const inputValue = document.getElementById('from').value;
    console.log(inputValue);
    setCountryName(inputValue);
})

// Function to fetch and display flights
const loadFlights = async () => {
    try {
        const response = await fetch('./data.json'); // Fetch the JSON file
        const data = await response.json();
        displayFlights(data.flights); // Call the function to display the flights
    } catch (error) {
        console.error("Error fetching flight data: ", error);
    }
};

// Function to dynamically display flights using the data
const displayFlights = (flights) => {
    const flightsContainer = document.querySelector('.flights-container');
    flightsContainer.innerHTML = ''; // Clear the container first

    flights.forEach(flight => {
        const flightCard = document.createElement('div');
        flightCard.classList.add('flight-card');
        flightCard.innerHTML = `
            <img src="${flight.image}" alt="${flight.from} to ${flight.to}">
            <h3>${flight.from} to ${flight.to}</h3>
            <p>Price: ${flight.price}</p>
        `;
        flightsContainer.appendChild(flightCard); // Add the flight card to the container
    });
};

// Initialize the function when the page loads
document.addEventListener('DOMContentLoaded', loadFlights);
