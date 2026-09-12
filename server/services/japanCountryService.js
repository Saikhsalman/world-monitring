import {
  getCountryMacro,
} from "./countryMacroService.js";

import {
  getFredLatest,
} from "./fredService.js";

// =====================================================
// JAPAN COUNTRY INTELLIGENCE
// World Bank + FRED + Yahoo Finance
// =====================================================

// =====================================================
// JAPAN 10Y GOVERNMENT BOND YIELD
// =====================================================

async function getJapanBondYield() {
  try {
    const data =
      await getFredLatest(
        "IRLTLT01JPM156N"
      );

    return {
      name:
        "Japan 10Y Government Bond Yield",

      value:
        data.value,

      date:
        data.date,

      unit:
        "%",

      source:
        "FRED",

      series:
        "IRLTLT01JPM156N",
    };
  } catch (error) {
    console.error(
      "JAPAN 10Y ERROR:",
      error.message
    );

    return {
      name:
        "Japan 10Y Government Bond Yield",

      value:
        null,

      date:
        null,

      unit:
        "%",

      source:
        "FRED",

      series:
        "IRLTLT01JPM156N",

      error:
        error.message,
    };
  }
}

// =====================================================
// YAHOO FINANCE FETCH
// =====================================================

async function getYahooQuote(
  symbol
) {
  const encoded =
    encodeURIComponent(symbol);

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}` +
    `?range=5d&interval=1d`;

  const response =
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 WorldMonitor/1.0",
      },
    });

  if (!response.ok) {
    throw new Error(
      `Yahoo ${symbol} HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  const result =
    data?.chart?.result?.[0];

  if (!result) {
    throw new Error(
      `Yahoo ${symbol} result missing`
    );
  }

  const meta =
    result.meta || {};

  const current =
    Number(
      meta.regularMarketPrice
    );

  const previous =
    Number(
      meta.chartPreviousClose
    );

  const percentChange =
    Number.isFinite(current) &&
    Number.isFinite(previous) &&
    previous !== 0
      ? ((current - previous) /
          previous) *
        100
      : null;

  const date =
    meta.regularMarketTime
      ? new Date(
          meta.regularMarketTime *
            1000
        )
          .toISOString()
          .slice(0, 10)
      : null;

  return {
    value:
      Number.isFinite(current)
        ? current
        : null,

    previousClose:
      Number.isFinite(previous)
        ? previous
        : null,

    percentChange,

    date,

    currency:
      meta.currency || null,

    exchange:
      meta.exchangeName || null,

    source:
      "Yahoo Finance",

    status:
      Number.isFinite(current)
        ? "live"
        : "unavailable",
  };
}

// =====================================================
// NIKKEI 225
// =====================================================

async function getNikkei225() {
  try {
    const quote =
      await getYahooQuote(
        "^N225"
      );

    return {
      name:
        "Nikkei 225",

      symbol:
        "^N225",

      ...quote,
    };
  } catch (error) {
    console.error(
      "NIKKEI ERROR:",
      error.message
    );

    return {
      name:
        "Nikkei 225",

      symbol:
        "^N225",

      value:
        null,

      previousClose:
        null,

      percentChange:
        null,

      date:
        null,

      source:
        "Yahoo Finance",

      status:
        "unavailable",

      error:
        error.message,
    };
  }
}

// =====================================================
// USD / JPY
// =====================================================

async function getUsdJpy() {
  try {
    const quote =
      await getYahooQuote(
        "JPY=X"
      );

    return {
      name:
        "USD/JPY",

      symbol:
        "JPY=X",

      ...quote,

      unit:
        "JPY per USD",
    };
  } catch (error) {
    console.error(
      "USDJPY ERROR:",
      error.message
    );

    return {
      name:
        "USD/JPY",

      symbol:
        "JPY=X",

      value:
        null,

      previousClose:
        null,

      percentChange:
        null,

      date:
        null,

      source:
        "Yahoo Finance",

      status:
        "unavailable",

      unit:
        "JPY per USD",

      error:
        error.message,
    };
  }
}

// =====================================================
// MAIN JAPAN INTELLIGENCE
// =====================================================

export async function getJapanCountryIntelligence() {
  const [
    baseMacro,
    bondYield,
    nikkei225,
    usdJpy,
  ] =
    await Promise.all([
      getCountryMacro(
        "JPN"
      ),

      getJapanBondYield(),

      getNikkei225(),

      getUsdJpy(),
    ]);

  const availableCount =
    [
      baseMacro?.macro
        ?.inflation?.value,

      baseMacro?.macro
        ?.gdpGrowth?.value,

      baseMacro?.macro
        ?.unemployment?.value,

      baseMacro?.macro
        ?.policyRate?.value,

      bondYield?.value,
    ].filter(
      (value) =>
        value !== null &&
        value !== undefined
    ).length;

  return {
    country: {
      code:
        "JPN",

      name:
        "Japan",

      flag:
        "🇯🇵",

      currency:
        "JPY",

      market:
        "Nikkei 225",

      centralBank:
        "Bank of Japan",
    },

    status:
      availableCount === 5
        ? "live"
        : availableCount > 0
          ? "partial"
          : "unavailable",

    liveCount:
      availableCount,

    totalCount:
      5,

    macro: {
      inflation:
        baseMacro.macro
          .inflation,

      policyRate: {
        ...baseMacro.macro
          .policyRate,

        name:
          "Japan Short-Term Interest Rate",

        note:
          "Proxy rate; official BOJ policy source to be connected",
      },

      gdpGrowth:
        baseMacro.macro
          .gdpGrowth,

      unemployment:
        baseMacro.macro
          .unemployment,

      bondYield,
    },

    currencyMarket: {
      usdJpy,
    },

    markets: {
      nikkei225,
    },

    updatedAt:
      new Date().toISOString(),
  };
}