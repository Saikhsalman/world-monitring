// =====================================================
// EIA SERVICE
// =====================================================

export async function getEiaSeries(seriesId) {
  const apiKey = process.env.EIA_API_KEY;

  if (!apiKey) {
    throw new Error("EIA_API_KEY missing");
  }

  const url =
    `https://api.eia.gov/v2/seriesid/${seriesId}` +
    `?api_key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `EIA ${seriesId} request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const rows = data?.response?.data || [];

  if (!rows.length) {
    throw new Error(
      `No EIA data found for ${seriesId}`
    );
  }

  return rows;
}

// =====================================================
// VALID ROWS
// =====================================================

export function getValidEiaRows(rows) {
  return rows
    .filter((item) => {
      if (
        item.value === null ||
        item.value === undefined ||
        item.value === ""
      ) {
        return false;
      }

      const value = Number(item.value);

      return !Number.isNaN(value);
    })
    .map((item) => ({
      value: Number(item.value),
      date: item.period,
      units: item.units || "",
    }));
}

// =====================================================
// LATEST VALID VALUE
// =====================================================

export function getLatestValidEiaValue(rows) {
  const validRows = getValidEiaRows(rows);

  if (!validRows.length) {
    throw new Error(
      "No valid EIA observation found"
    );
  }

  return validRows[0];
}

// =====================================================
// LATEST
// =====================================================

export async function getEiaLatest(seriesId) {
  const rows = await getEiaSeries(seriesId);

  return getLatestValidEiaValue(rows);
}

// =====================================================
// LATEST TWO
// =====================================================

export async function getEiaLatestTwo(seriesId) {
  const rows = await getEiaSeries(seriesId);

  const validRows = getValidEiaRows(rows);

  if (validRows.length < 2) {
    throw new Error(
      `Not enough observations for ${seriesId}`
    );
  }

  return {
    latest: validRows[0],
    previous: validRows[1],
  };
}

// =====================================================
// SAFE SERIES
// =====================================================

export async function safeEiaSeries(
  seriesId,
  name,
  unit
) {
  try {
    const latest =
      await getEiaLatest(seriesId);

    return {
      name,
      series: seriesId,
      value: latest.value,
      unit,
      date: latest.date,
      status: "live",
    };
  } catch (error) {
    console.error(
      `${name} ERROR:`,
      error.message
    );

    return {
      name,
      series: seriesId,
      status: "unavailable",
      error: error.message,
    };
  }
}