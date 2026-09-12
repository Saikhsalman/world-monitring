export async function getFredSeries(seriesId, limit = 20) {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error("FRED_API_KEY missing");
  }

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${seriesId}` +
    `&api_key=${apiKey}` +
    `&file_type=json` +
    `&sort_order=desc` +
    `&limit=${limit}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `FRED ${seriesId} request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return (data.observations || []).filter(
    (item) => item.value !== "."
  );
}

export async function getFredLatest(seriesId) {
  const observations = await getFredSeries(seriesId, 20);

  if (!observations.length) {
    throw new Error(
      `No valid FRED observation found for ${seriesId}`
    );
  }

  return {
    value: Number(observations[0].value),
    date: observations[0].date,
  };
}

export async function getCpiInflationYoY() {
  const observations = await getFredSeries(
    "CPIAUCSL",
    20
  );

  if (observations.length < 13) {
    throw new Error(
      "Not enough CPI observations for YoY calculation"
    );
  }

  const latest = observations[0];
  const previousYear = observations[12];

  const latestValue = Number(latest.value);
  const previousYearValue = Number(previousYear.value);

  const yoy =
    ((latestValue - previousYearValue) /
      previousYearValue) *
    100;

  return {
    value: yoy,
    latestCpi: latestValue,
    previousYearCpi: previousYearValue,
    date: latest.date,
  };
}