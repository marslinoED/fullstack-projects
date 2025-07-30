
async function fetchCoordinates() {
    const city = document.getElementById('cityInput').value.trim();
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
        document.getElementById("weather").innerHTML = "City not found.";
        return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    fetchWeather(latitude, longitude, name, country);

}

async function fetchWeather(lat, lon, cityName, country) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const current = weatherData.current_weather;

    const output = `
      <h2>Weather in ${cityName}, ${country}</h2>
      <p>🌡️ Temperature: ${current.temperature} °C</p>
      <p>💨 Wind Speed: ${current.windspeed} km/h</p>
      <p>⏰ Time: ${current.time}</p>
    `;
    document.getElementById("weather").innerHTML = output;

}
