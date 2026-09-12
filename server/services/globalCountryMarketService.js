// =====================================================
// GLOBAL COUNTRY MARKET SERVICE
// Yahoo Finance based Stock Index + FX Engine
// =====================================================

// =====================================================
// COUNTRY MARKET CONFIG
// =====================================================

const COUNTRY_MARKET_CONFIG = {
  CHN: {
    indexName: "Shanghai Composite",
    indexSymbol: "000001.SS",
    fxName: "USD/CNY",
    fxSymbol: "CNY=X",
  },

  GBR: {
    indexName: "FTSE 100",
    indexSymbol: "^FTSE",
    fxName: "GBP/USD",
    fxSymbol: "GBPUSD=X",
  },

  FRA: {
    indexName: "CAC 40",
    indexSymbol: "^FCHI",
    fxName: "EUR/USD",
    fxSymbol: "EURUSD=X",
  },

  ITA: {
    indexName: "FTSE MIB",
    indexSymbol: "FTSEMIB.MI",
    fxName: "EUR/USD",
    fxSymbol: "EURUSD=X",
  },

  ESP: {
    indexName: "IBEX 35",
    indexSymbol: "^IBEX",
    fxName: "EUR/USD",
    fxSymbol: "EURUSD=X",
  },

  CAN: {
    indexName: "S&P/TSX Composite",
    indexSymbol: "^GSPTSE",
    fxName: "USD/CAD",
    fxSymbol: "CAD=X",
  },

  AUS: {
    indexName: "ASX 200",
    indexSymbol: "^AXJO",
    fxName: "AUD/USD",
    fxSymbol: "AUDUSD=X",
  },

  BRA: {
    indexName: "Bovespa",
    indexSymbol: "^BVSP",
    fxName: "USD/BRL",
    fxSymbol: "BRL=X",
  },

  KOR: {
    indexName: "KOSPI",
    indexSymbol: "^KS11",
    fxName: "USD/KRW",
    fxSymbol: "KRW=X",
  },

  CHE: {
    indexName: "Swiss Market Index",
    indexSymbol: "^SSMI",
    fxName: "USD/CHF",
    fxSymbol: "CHF=X",
  },

  MEX: {
    indexName: "S&P/BMV IPC",
    indexSymbol: "^MXX",
    fxName: "USD/MXN",
    fxSymbol: "MXN=X",
  },

  IDN: {
    indexName: "Jakarta Composite",
    indexSymbol: "^JKSE",
    fxName: "USD/IDR",
    fxSymbol: "IDR=X",
  },

  ZAF: {
    indexName: "FTSE/JSE",
    indexSymbol: "^J203.JO",
    fxName: "USD/ZAR",
    fxSymbol: "ZAR=X",
  },

  SAU: {
    indexName: "Tadawul All Share",
    indexSymbol: "^TASI.SR",
    fxName: "USD/SAR",
    fxSymbol: "SAR=X",
  },

  ARE: {
    indexName: "Abu Dhabi Securities Market",
    indexSymbol: "FTFADGI.AE",
    fxName: "USD/AED",
    fxSymbol: "AED=X",
  },
};

// =====================================================
// YAHOO QUOTE
// =====================================================

async function getYahooQuote(symbol) {
  const encoded =
    encodeURIComponent(symbol);

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}` +
    `?range=5d&interval=1d`;

  try {
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

    const value =
      Number(
        meta.regularMarketPrice
      );

    const previousClose =
      Number(
        meta.chartPreviousClose
      );

    const percentChange =
      Number.isFinite(value) &&
      Number.isFinite(previousClose) &&
      previousClose !== 0
        ? ((value - previousClose) /
            previousClose) *
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
      status:
        Number.isFinite(value)
          ? "live"
          : "unavailable",

      value:
        Number.isFinite(value)
          ? value
          : null,

      previousClose:
        Number.isFinite(
          previousClose
        )
          ? previousClose
          : null,

      percentChange,

      date,

      currency:
        meta.currency || null,

      exchange:
        meta.exchangeName ||
        null,

      source:
        "Yahoo Finance",
    };
  } catch (error) {
    console.error(
      `GLOBAL YAHOO ${symbol}:`,
      error.message
    );

    return {
      status:
        "unavailable",

      value:
        null,

      previousClose:
        null,

      percentChange:
        null,

      date:
        null,

      currency:
        null,

      exchange:
        null,

      source:
        "Yahoo Finance",

      error:
        error.message,
    };
  }
}

// =====================================================
// GENERIC COUNTRY MARKET INTELLIGENCE
// =====================================================

export async function getGlobalCountryMarket(
  countryCode
) {
  const code =
    String(countryCode || "")
      .toUpperCase()
      .trim();

  const config =
    COUNTRY_MARKET_CONFIG[
      code
    ];

  if (!config) {
    return {
      status:
        "unavailable",

      countryCode:
        code,

      market:
        null,

      currency:
        null,

      error:
        "Advanced market configuration unavailable",
    };
  }

  const [
    marketQuote,
    currencyQuote,
  ] =
    await Promise.all([
      getYahooQuote(
        config.indexSymbol
      ),

      getYahooQuote(
        config.fxSymbol
      ),
    ]);

  return {
    status:
      marketQuote.status ===
        "live" ||
      currencyQuote.status ===
        "live"
        ? "live"
        : "unavailable",

    countryCode:
      code,

    market: {
      name:
        config.indexName,

      symbol:
        config.indexSymbol,

      ...marketQuote,
    },

    currency: {
      name:
        config.fxName,

      symbol:
        config.fxSymbol,

      ...currencyQuote,
    },

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// CHECK ADVANCED SUPPORT
// =====================================================

export function hasGlobalMarketSupport(
  countryCode
) {
  const code =
    String(countryCode || "")
      .toUpperCase()
      .trim();

  return Boolean(
    COUNTRY_MARKET_CONFIG[
      code
    ]
  );
}

// =====================================================
// GET CONFIGURED COUNTRIES
// =====================================================

export function getGlobalMarketCountries() {
  return Object.keys(
    COUNTRY_MARKET_CONFIG
  );
}