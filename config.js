const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
config = {
  OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  CITIES: {
    Delhi: { lat: 28.704059, long: 77.10249 },
    Mumbai: { lat: 19.075984, long: 72.877656 },
    Chennai: { lat: 13.084301, long: 80.270462 },
    Banglore: { lat: 12.971599, long: 77.594563 },
    Kolkata: { lat: 22.574355, long: 88.362873 },
    Hyderabad: { lat: 17.406498, long: 78.477244 },
  },
  MONGODB_URL: process.env.MONGODB_URL,
  FETCH_INTERVAL: 300000, // 5 minutes in milliseconds
  USER_PREFERENCE: "C", // C for celsius and K for kelvin
};
module.exports = config;
