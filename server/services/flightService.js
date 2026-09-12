const AIRLABS_BASE_URL =
  "https://airlabs.co/api/v9";

// =====================================================
// HELPERS
// =====================================================

function safeNumber(value) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function normalizeFlight(item) {
  const latitude =
    safeNumber(
      item.lat
    );

  const longitude =
    safeNumber(
      item.lng
    );

  return {
    hex:
      item.hex || null,

    regNumber:
      item.reg_number || null,

    flag:
      item.flag || null,

    callsign:
      item.flight_icao ||
      item.flight_iata ||
      item.flight_number ||
      item.hex ||
      "UNKNOWN",

    flightIcao:
      item.flight_icao || null,

    flightIata:
      item.flight_iata || null,

    flightNumber:
      item.flight_number || null,

    airlineIcao:
      item.airline_icao || null,

    airlineIata:
      item.airline_iata || null,

    aircraftIcao:
      item.aircraft_icao || null,

    latitude,
    longitude,

    altitude:
      safeNumber(
        item.alt
      ),

    speed:
      safeNumber(
        item.speed
      ),

    direction:
      safeNumber(
        item.dir
      ),

    verticalSpeed:
      safeNumber(
        item.v_speed
      ),

    squawk:
      item.squawk || null,

    status:
      item.status || "live",

    updated:
      item.updated || null,
  };
}

// =====================================================
// FETCH LIVE FLIGHTS
// =====================================================

export async function getLiveFlights() {
  const apiKey =
    process.env.AIRLABS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "AIRLABS_API_KEY missing"
    );
  }

  const url =
    `${AIRLABS_BASE_URL}/flights` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `AirLabs HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    data?.error
  ) {
    throw new Error(
      data.error?.message ||
      "AirLabs API error"
    );
  }

  const rawFlights =
    Array.isArray(
      data?.response
    )
      ? data.response
      : [];

  const flights =
    rawFlights
      .map(
        normalizeFlight
      )
      .filter(
        (flight) =>
          flight.latitude !== null &&
          flight.longitude !== null
      );

  return {
    status:
      flights.length > 0
        ? "live"
        : "unavailable",

    source:
      "AirLabs",

    count:
      flights.length,

    flights,

    updatedAt:
      new Date().toISOString(),
  };
}
