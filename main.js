const config = require("./config");
const WeatherDataFetcher = require("./weatherDataFetcher");
const WeatherDataProcessor = require("./weatherDataProcessor");
const WeatherAlertSystem = require("./weatherAlertSystem");
const WeatherVisualizer = require("./weatherVisualizer");
const fs = require("fs").promises;

async function main() {
  const fetcher = new WeatherDataFetcher();
  const processor = new WeatherDataProcessor();
  const alertSystem = new WeatherAlertSystem({
    highTemp: 35,
    conditions: ["Rain", "Snow", "Thunderstorm"],
  });
  const visualizer = new WeatherVisualizer();

  const dailyData = {};
  for (let city in config.CITIES) {
    dailyData[city] = [];
  }

  let currentDate = new Date().toISOString().split("T")[0];

  setInterval(async () => {
    const weatherData = await fetcher.fetchWeatherData();

    for (const [city, data] of Object.entries(weatherData)) {
      const alerts = alertSystem.checkAlerts(city, data);
      alerts.forEach((alert) => console.log(alert));

      // Process daily summary at the end of the day
      const dataDate = new Date(data.dt * 1000).toISOString().split("T")[0];

      await processor.processDailySummary(city, data);
      if (dataDate > currentDate) {
        dailyData[city] = [];
        currentDate = dataDate;

        // Generate visualizations for the past week
        const endDate = new Date(dataDate);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);

        const temperatureTrend = await visualizer.plotTemperatureTrends(
          city,
          startDate,
          endDate
        );
        await fs.writeFile(`${city}_temperature_trends.png`, temperatureTrend);

        const weatherConditions = await visualizer.plotWeatherConditions(
          city,
          startDate,
          endDate
        );
        await fs.writeFile(`${city}_weather_conditions.png`, weatherConditions);
      }
    }
  }, config.FETCH_INTERVAL);
}

module.exports = main;
