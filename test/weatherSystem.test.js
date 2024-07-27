const assert = require("assert");
const sinon = require("sinon");
const axios = require("axios");
const WeatherDataFetcher = require("../weatherDataFetcher");
const WeatherDataProcessor = require("../weatherDataProcessor");
const WeatherAlertSystem = require("../weatherAlertSystem");
const WeatherVisualizer = require("../weatherVisualizer");
const Weather = require("../collections/weatherSchema");
const mongoose = require("mongoose");
const config = require("../config");
const dotenv = require("dotenv");
const fs = require("fs").promises;
dotenv.config({ path: "../config.env" });

describe("Weather System Tests", () => {
  describe("WeatherDataFetcher", () => {
    let fetcher;

    beforeEach(() => {
      fetcher = new WeatherDataFetcher();
    });

    it("should fetch weather data successfully", async () => {
      const stub = sinon.stub(axios, "get").resolves({
        data: {
          weather: [{ main: "Clear" }],
          main: { temp: 25, feels_like: 26 },
          dt: Math.floor(Date.now() / 1000),
        },
      });

      const data = await fetcher.fetchWeatherData();
      assert(data["Delhi"]);
      assert.strictEqual(data["Delhi"].main, "Clear");
      assert.strictEqual(data["Delhi"].temp, 25);

      stub.restore();
    });
  });

  describe("WeatherDataProcessor", () => {
    let processor;

    beforeEach(async () => {
      processor = new WeatherDataProcessor();
      await Weather.deleteMany({ city: "TestCity" });
    });

    it("should process daily summary correctly", async () => {
      const testData = [
        { temp: 20, main: "Clear", dt: Math.floor(Date.now() / 1000) },
        { temp: 22, main: "Cloudy", dt: Math.floor(Date.now() / 1000) },
        { temp: 18, main: "Cloudy", dt: Math.floor(Date.now() / 1000) },
        {
          temp: 18,
          main: "Cloudy",
          dt: Math.floor(Date.now() / 1000 + 86400),
        },
      ];
      for (let data of testData) {
        try {
          await processor.processDailySummary("TestCity", data);
        } catch (err) {
          console.log(err);
        }
      }

      const savedData = await Weather.findOne({ city: "TestCity" });

      assert(savedData);
      assert.strictEqual(savedData.avgTemp, 20);
      assert.strictEqual(savedData.maxTemp, 22);
      assert.strictEqual(savedData.minTemp, 18);
      assert.strictEqual(savedData.dominantCondition, "Cloudy");
    }).timeout(20000);
  });

  describe("WeatherAlertSystem", () => {
    let alertSystem;

    beforeEach(() => {
      alertSystem = new WeatherAlertSystem({
        highTemp: 35,
        conditions: ["Rain"],
      });
    });

    it("should trigger high temperature alert after two consecutive occurrences", () => {
      let alerts = alertSystem.checkAlerts("TestCity", {
        temp: 309.15,
        main: "Clear",
      });

      assert.strictEqual(alerts.length, 0);

      alerts = alertSystem.checkAlerts("TestCity", {
        temp: 309.15,
        main: "Clear",
      });
      console.log(alerts);
      assert.strictEqual(alerts.length, 1);

      assert(alerts[0].includes("High temperature alert"));
    });

    it("should trigger condition alert", () => {
      const alerts = alertSystem.checkAlerts("TestCity", {
        temp: 25,
        main: "Rain",
      });
      assert.strictEqual(alerts.length, 1);
      assert(alerts[0].includes("Weather condition alert"));
    });
  });
  describe("WeatherVisualizer", function () {
    let visualizer;
    const testCity = "TestCity";
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    before(async function () {
      visualizer = new WeatherVisualizer();

      // Prepare test data
      await Weather.deleteMany({ city: testCity });
      const testData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        testData.push({
          date,
          city: testCity,
          avgTemp: 20 + i + 273.15,
          maxTemp: 25 + i + 273.15,
          minTemp: 15 + i + 273.15,
          dominantCondition: i % 2 === 0 ? "Sunny" : "Cloudy",
        });
      }
      await Weather.insertMany(testData);
    });

    after(async function () {
      await Weather.deleteMany({ city: testCity });
    });

    it("should generate temperature trends data", async function () {
      const data = await visualizer.getTemperatureTrendsData(
        testCity,
        startDate,
        endDate
      );

      assert(data.dates.length === 7);
      assert(data.avgTemps.length === 7);
      assert(data.maxTemps.length === 7);
      assert(data.minTemps.length === 7);

      assert(data.avgTemps[0] === 20);
      assert(data.maxTemps[0] === 25);
      assert(data.minTemps[0] === 15);
    });

    it("should generate weather conditions data", async function () {
      const data = await visualizer.getWeatherConditionsData(
        testCity,
        startDate,
        endDate
      );

      assert(data.conditions.length === 2);
      assert(data.counts.length === 2);
      assert(data.conditions.includes("Sunny"));
      assert(data.conditions.includes("Cloudy"));
    });

    it("should plot temperature trends", async function () {
      const buffer = await visualizer.plotTemperatureTrends(
        testCity,
        startDate,
        endDate
      );
      await fs.writeFile(`TestCity_temperature_trends.png`, buffer);
      assert(buffer instanceof Buffer);
      assert(buffer.length > 0);
    });

    it("should plot weather conditions", async function () {
      const buffer = await visualizer.plotWeatherConditions(
        testCity,
        startDate,
        endDate
      );
      await fs.writeFile(`TestCity_weather_conditions.png`, buffer);
      assert(buffer instanceof Buffer);
      assert(buffer.length > 0);
    });
  });
});
