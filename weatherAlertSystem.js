const config = require("./config");
class WeatherAlertSystem {
  constructor(thresholds) {
    this.thresholds = thresholds;
    this.consecutiveAlerts = {};
  }

  checkAlerts(city, weatherData) {
    let { temp, main: condition } = weatherData;
    const alerts = [];
    temp = temp - 273.15;
    if (config.USER_PREFERENCE == "F") temp = (9 * temp) / 5 + 32;

    if (temp > this.thresholds.highTemp) {
      this.consecutiveAlerts[city] = (this.consecutiveAlerts[city] || 0) + 1;
      if (this.consecutiveAlerts[city] >= 2) {
        alerts.push(
          `High temperature alert for ${city}: ${temp}°${config.USER_PREFERENCE}`
        );
      }
    } else {
      this.consecutiveAlerts[city] = 0;
    }

    if (this.thresholds.conditions.includes(condition)) {
      alerts.push(`Weather condition alert for ${city}: ${condition}`);
    }

    return alerts;
  }
}

module.exports = WeatherAlertSystem;
