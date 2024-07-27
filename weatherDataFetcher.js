const axios = require("axios");
const config = require("./config");

class WeatherDataFetcher {
  constructor() {
    this.baseUrl = "http://api.openweathermap.org/data/2.5/weather";
  }

  async fetchWeatherData() {
    const weatherData = {};
    for (const city in config.CITIES) {
      try {
        const response = await axios.get(this.baseUrl, {
          params: {
            lat: config.CITIES[city].lat,
            lon: config.CITIES[city].long,
            appid: config.OPENWEATHERMAP_API_KEY,
          },
        });
        const data = response.data;
        weatherData[city] = {
          main: data.weather[0].main,
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          dt: data.dt,
        };
      } catch (error) {
        console.error(`Error fetching data for ${city}:`, error.message);
      }
    }
    return weatherData;
  }
}

module.exports = WeatherDataFetcher;
