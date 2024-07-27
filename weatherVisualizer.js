const Weather = require("./collections/weatherSchema");
const config = require("./config");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
// Register the time scale

class WeatherVisualizer {
  constructor() {
    this.width = 800;
    this.height = 400;
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: this.width,
      height: this.height,
    });
  }
  convertToUnit(temp) {
    temp = temp - 273.15;
    if (config.USER_PREFERENCE == "F") temp = (9 * temp) / 5 + 32;
    return temp;
  }
  async getWeatherConditionsData(city, startDate, endDate) {
    const data = await Weather.aggregate([
      { $match: { city, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$dominantCondition", count: { $sum: 1 } } },
    ]);

    return {
      conditions: data.map((d) => d._id),
      counts: data.map((d) => d.count),
    };
  }
  async getTemperatureTrendsData(city, startDate, endDate) {
    const data = await Weather.find({
      city,
      date: { $gte: startDate, $lte: endDate },
    }).sort("date");

    return {
      dates: data.map((d) => d.date.toISOString().split("T")[0]),
      avgTemps: data.map((d) => {
        return this.convertToUnit(d.avgTemp);
      }),
      maxTemps: data.map((d) => {
        return this.convertToUnit(d.maxTemp);
      }),
      minTemps: data.map((d) => {
        return this.convertToUnit(d.minTemp);
      }),
    };
  }

  async plotTemperatureTrends(city, startDate, endDate) {
    const data = await Weather.find({
      city,
      date: { $gte: startDate, $lte: endDate },
    }).sort("date");

    const dates = data.map((d) => d.date.toISOString().split("T")[0]);
    const avgTemps = data.map((d) => {
      return this.convertToUnit(d.avgTemp);
    });
    const maxTemps = data.map((d) => {
      return this.convertToUnit(d.maxTemp);
    });
    const minTemps = data.map((d) => {
      return this.convertToUnit(d.minTemp);
    });

    const configuration = {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Average Temperature",
            data: avgTemps,
            borderColor: "blue",
            fill: false,
          },
          {
            label: "Maximum Temperature",
            data: maxTemps,
            borderColor: "red",
            fill: false,
          },
          {
            label: "Minimum Temperature",
            data: minTemps,
            borderColor: "green",
            fill: false,
          },
        ],
      },
      options: {
        title: { display: true, text: `Temperature Trends for ${city}` },
        scales: { xAxes: [{ type: "time", time: { unit: "day" } }] },
      },
    };
    const image = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    return image;
  }

  async plotWeatherConditions(city, startDate, endDate) {
    const data = await Weather.aggregate([
      { $match: { city, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$dominantCondition", count: { $sum: 1 } } },
    ]);

    const conditions = data.map((d) => d._id);
    const counts = data.map((d) => d.count);

    const configuration = {
      type: "bar",
      data: {
        labels: conditions,
        datasets: [
          {
            label: "Number of Days",
            data: counts,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: `Dominant Weather Conditions for ${city}`,
        },
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
      },
    };

    const image = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    return image;
  }
}

module.exports = WeatherVisualizer;
