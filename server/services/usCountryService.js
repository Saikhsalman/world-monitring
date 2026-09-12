import {
  getFredLatest,
  getCpiInflationYoY,
} from "./fredService.js";

import {
  getTwelveDataQuote,
} from "./twelveDataService.js";

// =====================================================
// USA COUNTRY INTELLIGENCE SERVICE
// FRED + Twelve Data
// =====================================================

async function getUsRealGdpGrowth() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error("FRED_API_KEY missing");
  }

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=GDPC1` +
    `&api_key=${apiKey}` +
    `&file_type=json` +
    `&sort_order=desc` +
    `&limit=10`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `FRED GDPC1 request failed: ${response.status}`
    );
  }

  const data = await response.json();

  const observations =
    (data.observations || []).filter(
      (item) => item.value !== "."
    );

  if (observations.length < 2) {
    throw new Error(
      "Not enough GDP observations"
    );
  }

  const latest =
    Number(observations[0].value);

  const previous =
    Number(observations[1].value);

  const quarterlyGrowth =
    latest / previous - 1;

  const annualizedGrowth =
    (Math.pow(
      1 + quarterlyGrowth,
      4
    ) - 1) * 100;

  return {
    value: annualizedGrowth,
    date: observations[0].date,
    source: "FRED",
    series: "GDPC1",
    unit: "%",
    method:
      "Annualized quarter-over-quarter real GDP growth",
  };
}

// =====================================================
// SAFE MARKET QUOTE
// =====================================================

async function getSafeMarketQuote(
  symbol
) {
  try {
    return await getTwelveDataQuote(
      symbol
    );
  } catch (error) {
    console.error(
      `USA MARKET ${symbol} ERROR:`,
      error.message
    );

    return {
      symbol,
      status: "unavailable",
      source: "Twelve Data",
      error: error.message,
    };
  }
}

// =====================================================
// MAIN USA INTELLIGENCE
// =====================================================

export async function getUsCountryIntelligence() {
  const [
    inflation,
    fedFunds,
    unemployment,
    us10y,
    gdpGrowth,
    spy,
    dollarStrength,
  ] =
    await Promise.all([
      getCpiInflationYoY(),

      getFredLatest(
        "FEDFUNDS"
      ),

      getFredLatest(
        "UNRATE"
      ),

      getFredLatest(
        "DGS10"
      ),

      getUsRealGdpGrowth(),

      getSafeMarketQuote(
        "SPY"
      ),

      getFredLatest(
        "DTWEXBGS"
      ),
    ]);

  return {
    country: {
      code: "USA",
      name: "United States",
      flag: "🇺🇸",
      currency: "USD",
      market: "S&P 500 Proxy",
      centralBank:
        "Federal Reserve",
    },

    status: "live",

    macro: {
      inflation: {
        name:
          "CPI Inflation YoY",

        value:
          inflation.value,

        unit: "%",

        date:
          inflation.date,

        source:
          "FRED",

        series:
          "CPIAUCSL",
      },

      policyRate: {
        name:
          "Federal Funds Rate",

        value:
          fedFunds.value,

        unit: "%",

        date:
          fedFunds.date,

        source:
          "FRED",

        series:
          "FEDFUNDS",
      },

      gdpGrowth: {
        name:
          "Real GDP Growth",

        value:
          gdpGrowth.value,

        unit: "%",

        date:
          gdpGrowth.date,

        source:
          "FRED",

        series:
          "GDPC1",

        method:
          gdpGrowth.method,
      },

      unemployment: {
        name:
          "Unemployment Rate",

        value:
          unemployment.value,

        unit: "%",

        date:
          unemployment.date,

        source:
          "FRED",

        series:
          "UNRATE",
      },

      bondYield: {
        name:
          "US 10Y Treasury Yield",

        value:
          us10y.value,

        unit: "%",

        date:
          us10y.date,

        source:
          "FRED",

        series:
          "DGS10",
      },

      dollarStrength: {
        name:
          "Broad Dollar Index",

        value:
          dollarStrength.value,

        unit: "",

        date:
          dollarStrength.date,

        source:
          "FRED",

        series:
          "DTWEXBGS",
      },
    },

    markets: {
      sp500Proxy: {
        name:
          "S&P 500 Proxy",

        symbol:
          "SPY",

        status:
          spy.status,

        value:
          spy.close ?? null,

        percentChange:
          spy.percentChange ?? null,

        date:
          spy.datetime || null,

        source:
          "Twelve Data",
      },
    },

    updatedAt:
      new Date().toISOString(),
  };
}