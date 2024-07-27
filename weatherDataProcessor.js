const Weather = require("./collections/weatherSchema");
const config = require("./config");

class WeatherDataProcessor {
  constructor() {
    this.conditions = {};
    for (let city in config.CITIES) this.conditions[city] = [];
    // city wise list to store dominant conditions for each request
  }

  async processDailySummary(city, data) {
    try {
      const date = new Date(data.dt * 1000).toISOString().split("T")[0];
      const findData = await Weather.findOne({ city, date });
      if (!findData) {
        let n = new Date(date);
        n.setDate(n.getDate() - 1);
        if (this.conditions[city]) {
          const dominantCondition = this.getMostFrequent(city);
          // since we have new date, update dominant condition for previous date
          await Weather.findOneAndUpdate(
            { date: n, city },
            { dominantCondition }
          );
        }
        this.conditions[city] = [data.main];
        // add data for new date
        await Weather.create({
          date,
          city,
          avgTemp: data.temp,
          maxTemp: data.temp,
          minTemp: data.temp,
          dominantCondition: data.main,
        });

        return;
      }
      const avgTemp =
        (findData.avgTemp * findData.count + data.temp) / (findData.count + 1);

      const maxTemp = Math.max(findData.maxTemp, data.temp);
      const minTemp = Math.min(findData.minTemp, data.temp);
      this.conditions[city].push(data.main);

      const nd = await Weather.findOneAndUpdate(
        { city, date },
        { avgTemp, maxTemp, minTemp, count: findData.count + 1 },
        { new: true }
      );
    } catch (err) {
      console.log(err);
    }
    return;
  }

  getMostFrequent(city) {
    return this.conditions[city]
      .sort(
        (a, b) =>
          this.conditions[city].filter((v) => v === a).length -
          this.conditions[city].filter((v) => v === b).length
      )
      .pop();
  }

  async getDailySummary(city, date) {
    return await Weather.findOne({ city, date });
  }
}

module.exports = WeatherDataProcessor;
