const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast";

// =====================================================
// WORLD WEATHER LOCATIONS
// =====================================================

const WEATHER_LOCATIONS = [
  { id: "DEL", city: "New Delhi", country: "India", lat: 28.6139, lon: 77.2090 },
  { id: "BOM", city: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
  { id: "NYC", city: "New York", country: "USA", lat: 40.7128, lon: -74.0060 },
  { id: "WDC", city: "Washington", country: "USA", lat: 38.9072, lon: -77.0369 },
  { id: "LON", city: "London", country: "UK", lat: 51.5072, lon: -0.1276 },
  { id: "BER", city: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
  { id: "PAR", city: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { id: "MOS", city: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { id: "BEI", city: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { id: "SHA", city: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737 },
  { id: "TOK", city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { id: "SEO", city: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780 },
  { id: "SIN", city: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { id: "DXB", city: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { id: "RUH", city: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
  { id: "SYD", city: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { id: "JNB", city: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473 },
  { id: "CAI", city: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { id: "SAO", city: "Sao Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { id: "MEX", city: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
];

// =====================================================
// WEATHER CODE
// =====================================================

function getWeatherDescription(code) {
  const weatherCode =
    Number(code);

  if (weatherCode === 0) {
    return "Clear";
  }

  if ([1, 2].includes(weatherCode)) {
    return "Partly Cloudy";
  }

  if (weatherCode === 3) {
    return "Cloudy";
  }

  if ([45, 48].includes(weatherCode)) {
    return "Fog";
  }

  if (
    [51, 53, 55, 56, 57].includes(
      weatherCode
    )
  ) {
    return "Drizzle";
  }

  if (
    [61, 63, 65, 66, 67, 80, 81, 82].includes(
      weatherCode
    )
  ) {
    return "Rain";
  }

  if (
    [71, 73, 75, 77, 85, 86].includes(
      weatherCode
    )
  ) {
    return "Snow";
  }

  if (
    [95, 96, 99].includes(
      weatherCode
    )
  ) {
    return "Thunderstorm";
  }

  return "Unknown";
}

// =====================================================
// FETCH ONE LOCATION
// =====================================================

async function fetchLocationWeather(
  location
) {
  try {
    const params =
      new URLSearchParams({
        latitude:
          String(location.lat),

        longitude:
          String(location.lon),

        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "rain",
          "weather_code",
          "cloud_cover",
          "surface_pressure",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
        ].join(","),

        timezone:
          "auto",
      });

    const response =
      await fetch(
        `${OPEN_METEO_URL}?${params.toString()}`
      );

    if (!response.ok) {
      throw new Error(
        `Open-Meteo HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const current =
      data.current || {};

    return {
      id:
        location.id,

      city:
        location.city,

      country:
        location.country,

      latitude:
        location.lat,

      longitude:
        location.lon,

      status:
        "live",

      weather: {
        temperature:
          current.temperature_2m ?? null,

        feelsLike:
          current.apparent_temperature ?? null,

        humidity:
          current.relative_humidity_2m ?? null,

        precipitation:
          current.precipitation ?? null,

        rain:
          current.rain ?? null,

        cloudCover:
          current.cloud_cover ?? null,

        pressure:
          current.surface_pressure ?? null,

        windSpeed:
          current.wind_speed_10m ?? null,

        windDirection:
          current.wind_direction_10m ?? null,

        windGust:
          current.wind_gusts_10m ?? null,

        weatherCode:
          current.weather_code ?? null,

        condition:
          getWeatherDescription(
            current.weather_code
          ),
      },

      observationTime:
        current.time || null,

      timezone:
        data.timezone || null,

      source:
        "Open-Meteo",

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `WEATHER ${location.city} ERROR:`,
      error.message
    );

    return {
      id:
        location.id,

      city:
        location.city,

      country:
        location.country,

      latitude:
        location.lat,

      longitude:
        location.lon,

      status:
        "unavailable",

      error:
        error.message,

      source:
        "Open-Meteo",

      updatedAt:
        new Date().toISOString(),
    };
  }
}

// =====================================================
// WORLD CURRENT WEATHER
// =====================================================

export async function getWorldWeather() {
  const results =
    await Promise.all(
      WEATHER_LOCATIONS.map(
        fetchLocationWeather
      )
    );

  const liveCount =
    results.filter(
      (item) =>
        item.status === "live"
    ).length;

  return {
    status:
      liveCount === results.length
        ? "live"
        : liveCount > 0
          ? "partial"
          : "unavailable",

    source:
      "Open-Meteo",

    type:
      "current_weather",

    liveCount,

    totalCount:
      results.length,

    locations:
      results,

    updatedAt:
      new Date().toISOString(),
  };
}
