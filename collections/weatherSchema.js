const mongoose = require("mongoose");

const dailySummarySchema = new mongoose.Schema({
  date: Date,
  city: String,
  avgTemp: { type: Number, default: 0 },
  maxTemp: { type: Number, default: 0 },
  minTemp: { type: Number, default: 400 },
  dominantCondition: String,
  count: { type: Number, default: 1 },
});

dailySummarySchema.index({ date: 1, city: 1 }, { unique: true });

const Weather = mongoose.model("WeatherData", dailySummarySchema);

module.exports = Weather;
