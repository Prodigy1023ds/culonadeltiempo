require('dotenv').config();
const axios = require('axios');

const CITY = process.env.WEATHER_CITY || 'Buenos Aires';
const INTERVAL = parseInt(process.env.WEATHER_UPDATE_INTERVAL_MS) || 600000; // Default 10 mins

async function updateWeather() {
  try {
    // 1. Get coordinates for the city (Open-Meteo Geocoding - No Key Required)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(CITY)}&count=1&language=es&format=json`;
    const geoResponse = await axios.get(geoUrl);

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      console.error(`City '${CITY}' not found.`);
      return;
    }

    const { latitude, longitude, name, country } = geoResponse.data.results[0];

    // 2. Get weather for coordinates (Open-Meteo Weather - No Key Required)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`;
    const weatherResponse = await axios.get(weatherUrl);

    const tempCelsius = weatherResponse.data.current_weather.temperature;
    
    console.log(`[${new Date().toLocaleTimeString()}] Weather update for ${name}, ${country}: ${tempCelsius}°C`);
    
    // TODO: Add logic here to pass 'tempCelsius' to your Twitter/Instagram bot functions

  } catch (error) {
    console.error('Failed to fetch weather:', error.message);
  }
}

// Run immediately on start, then every 10 minutes
updateWeather();
setInterval(updateWeather, INTERVAL);