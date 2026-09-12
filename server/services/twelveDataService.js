export async function getTwelveDataQuote(symbol) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("TWELVE_DATA_API_KEY missing");
  }

  const url =
    `https://api.twelvedata.com/quote` +
    `?symbol=${encodeURIComponent(symbol)}` +
    `&apikey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Twelve Data ${symbol} HTTP ${response.status}`
    );
  }

  const data = await response.json();

  if (data.status === "error" || data.code) {
    throw new Error(
      data.message ||
        `Twelve Data error for ${symbol}`
    );
  }

  return {
    symbol: data.symbol || symbol,
    name: data.name || symbol,
    exchange: data.exchange || "",
    currency: data.currency || "",
    close: Number(data.close),
    previousClose: Number(data.previous_close),
    change: Number(data.change),
    percentChange: Number(data.percent_change),
    datetime: data.datetime || "",
    timestamp: data.timestamp
      ? Number(data.timestamp)
      : null,
    source: "Twelve Data",
    status: "live",
  };
}

export async function safeTwelveQuote(
  symbol,
  label
) {
  try {
    const quote = await getTwelveDataQuote(symbol);

    return {
      label,
      ...quote,
    };
  } catch (error) {
    console.error(
      `${label} ERROR:`,
      error.message
    );

    return {
      label,
      symbol,
      source: "Twelve Data",
      status: "unavailable",
      error: error.message,
    };
  }
}