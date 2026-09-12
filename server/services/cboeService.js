export async function getCboeVix() {
  const url =
    "https://cdn.cboe.com/api/global/delayed_quotes/quotes/_VIX.json";

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(
      `CBOE VIX HTTP ${response.status}`
    );
  }

  const json = await response.json();
  const data = json?.data;

  if (!data) {
    throw new Error("CBOE VIX data missing");
  }

  const currentPrice =
    data.current_price ??
    data.last_trade_price ??
    data.close;

  if (
    currentPrice === null ||
    currentPrice === undefined ||
    Number.isNaN(Number(currentPrice))
  ) {
    throw new Error("CBOE VIX price missing");
  }

  return {
    name: "CBOE Volatility Index",
    symbol: "VIX",
    value: Number(currentPrice),
    previousClose:
      data.prev_day_close !== undefined
        ? Number(data.prev_day_close)
        : null,
    change:
      data.price_change !== undefined
        ? Number(data.price_change)
        : null,
    percentChange:
      data.price_change_percent !== undefined
        ? Number(data.price_change_percent)
        : null,
    timestamp: json.timestamp || null,
    source: "CBOE",
    status: "live",
  };
}

export async function safeCboeVix() {
  try {
    return await getCboeVix();
  } catch (error) {
    return {
      name: "CBOE Volatility Index",
      symbol: "VIX",
      source: "CBOE",
      status: "unavailable",
      error: error.message,
    };
  }
}