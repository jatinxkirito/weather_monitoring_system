# Weather Monitoring System

A web application that allows users to get the real-time weather data of metro cities of India. The application also provides alerts for weather conditions and temperature thresholds. It uses the OpenWeatherMap API to get the weather data. The application also provides historical weather data chart for the selected city. The application also provides a summary of the weather data.

## Database schema

Following is schema for weather data

```bash
{
  "date": date,
  "city": string,
  "avgTemp": number,
  "maxTemp": number,
  "minTemp": number,
  "dominantCondition": string,
  "count": number,
}
```

### Index:

{date,city}

## Features

Some features of the Weather monitoring system:

1. Persisted the data in database after every interval instead of storing it locally, so that even if for some reason whole system crashes
   data is not lost, but only persisted most frequent weather condition at the end of the day because persisting every update will cause overhead so I made a tradeoff there.
2. Customizable alert for extreme conditions including high temperature and weather condition
3. Generate graph for weekly temperature trends.
4. Ability to choose between celsius and fahrenheit

## Usage

1.  Run git clone in terminal

    ```bash
     git clone REPO_LINK
    ```

2.  Create config.env file with following content
    ```bash
     MONGODB_URL="Your mongoDb url"
     OPENWEATHERMAP_API_KEY="Your open weather map api key"
    ```
    Get your OpenWeatherMap API key from [https://openweathermap.org/]()
3.  In config.js set following
    ```bash
      {
         FETCH_INTERVAL: "Interval between two api calls in milliseconds"
         USER_PREFERENCE:"C for celsius F or fahrenheit"
      }
    ```
4.  Run following in terminal

         npm install
         npm start

5.  To run tests, run following command in terminal

    ```bash
     mocha --file test/testSetup.js test/**/*.test.js
    ```
