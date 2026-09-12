import {
  getEcbPolicyRates,
} from "./ecbService.js";

import {
  getFredLatest,
} from "./fredService.js";

// =====================================================
// GERMANY COUNTRY INTELLIGENCE
// Eurostat + ECB + FRED + Yahoo Finance
// =====================================================

const EUROSTAT_BASE =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

// =====================================================
// EUROSTAT FETCH
// =====================================================

async function fetchEurostat(
  dataset,
  params
) {
  const search =
    new URLSearchParams({
      lang: "en",
      ...params,
    });

  const url =
    `${EUROSTAT_BASE}/${dataset}?${search}`;

  const response =
    await fetch(url, {
      headers: {
        "User-Agent":
          "WorldMonitor/1.0",

        Accept:
          "application/json",
      },
    });

  if (!response.ok) {
    throw new Error(
      `Eurostat ${dataset} HTTP ${response.status}`
    );
  }

  return response.json();
}

// =====================================================
// GET LATEST EUROSTAT VALUE
// =====================================================

function getLatestEurostatValue(
  data
) {
  if (
    !data ||
    !data.value ||
    !data.dimension?.time
  ) {
    return null;
  }

  const timeIndex =
    data.dimension.time.category
      ?.index;

  if (!timeIndex) {
    return null;
  }

  const entries =
    Object.entries(timeIndex)
      .sort(
        (a, b) =>
          Number(b[1]) -
          Number(a[1])
      );

  for (
    const [date, position]
    of entries
  ) {
    const value =
      data.value[position];

    if (
      value !== null &&
      value !== undefined
    ) {
      const number =
        Number(value);

      if (
        Number.isFinite(number)
      ) {
        return {
          value: number,
          date,
        };
      }
    }
  }

  return null;
}

// =====================================================
// GERMANY INFLATION
// =====================================================

async function getGermanyInflation() {
  const data =
    await fetchEurostat(
      "prc_hicp_manr",
      {
        geo: "DE",
        coicop: "CP00",
        unit: "RCH_A",
      }
    );

  const latest =
    getLatestEurostatValue(
      data
    );

  return {
    name:
      "HICP Inflation YoY",

    value:
      latest?.value ?? null,

    date:
      latest?.date ?? null,

    unit: "%",

    source:
      "Eurostat",

    series:
      "prc_hicp_manr",
  };
}

// =====================================================
// GERMANY UNEMPLOYMENT
// =====================================================

async function getGermanyUnemployment() {
  const data =
    await fetchEurostat(
      "une_rt_m",
      {
        geo: "DE",
        sex: "T",
        age: "TOTAL",
        unit: "PC_ACT",
        s_adj: "SA",
      }
    );

  const latest =
    getLatestEurostatValue(
      data
    );

  return {
    name:
      "Unemployment Rate",

    value:
      latest?.value ?? null,

    date:
      latest?.date ?? null,

    unit: "%",

    source:
      "Eurostat",

    series:
      "une_rt_m",
  };
}

// =====================================================
// GERMANY GDP GROWTH
// =====================================================

async function getGermanyGdpGrowth() {
  const data =
    await fetchEurostat(
      "namq_10_gdp",
      {
        geo: "DE",
        na_item: "B1GQ",
        unit: "CLV_PCH_PRE",
        s_adj: "SCA",
      }
    );

  const latest =
    getLatestEurostatValue(
      data
    );

  return {
    name:
      "Real GDP Growth QoQ",

    value:
      latest?.value ?? null,

    date:
      latest?.date ?? null,

    unit: "%",

    source:
      "Eurostat",

    series:
      "namq_10_gdp",

    method:
      "Real GDP percentage change versus previous quarter",
  };
}

// =====================================================
// GERMANY 10Y BOND YIELD
// =====================================================

async function getGermanyBondYield() {
  try {
    const data =
      await getFredLatest(
        "IRLTLT01DEM156N"
      );

    return {
      name:
        "Germany 10Y Government Bond Yield",

      value:
        data.value,

      date:
        data.date,

      unit: "%",

      source:
        "FRED",

      series:
        "IRLTLT01DEM156N",
    };
  } catch (error) {
    console.error(
      "GERMANY 10Y ERROR:",
      error.message
    );

    return {
      name:
        "Germany 10Y Government Bond Yield",

      value:
        null,

      date:
        null,

      unit:
        "%",

      source:
        "FRED",

      series:
        "IRLTLT01DEM156N",

      error:
        error.message,
    };
  }
}

// =====================================================
// GERMANY MARKET
// Actual DAX Index via Yahoo Finance
// Symbol: ^GDAXI
// =====================================================

async function getGermanyMarket() {
  try {
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EGDAXI?range=5d&interval=1d";

    const response =
      await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 WorldMonitor/1.0",
        },
      });

    if (!response.ok) {
      throw new Error(
        `Yahoo DAX HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const result =
      data?.chart?.result?.[0];

    if (!result) {
      throw new Error(
        "Yahoo DAX result missing"
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

    const marketDate =
      meta.regularMarketTime
        ? new Date(
            meta.regularMarketTime *
              1000
          )
            .toISOString()
            .slice(0, 10)
        : null;

    return {
      name:
        "DAX",

      symbol:
        "^GDAXI",

      value:
        Number.isFinite(current)
          ? current
          : null,

      previousClose:
        Number.isFinite(previous)
          ? previous
          : null,

      percentChange,

      date:
        marketDate,

      currency:
        meta.currency ||
        "EUR",

      exchange:
        meta.exchangeName ||
        "GER",

      source:
        "Yahoo Finance",

      status:
        Number.isFinite(current)
          ? "live"
          : "unavailable",

      proxy:
        false,
    };
  } catch (error) {
    console.error(
      "GERMANY DAX ERROR:",
      error.message
    );

    return {
      name:
        "DAX",

      symbol:
        "^GDAXI",

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

      proxy:
        false,

      error:
        error.message,
    };
  }
}

// =====================================================
// MAIN GERMANY INTELLIGENCE
// =====================================================

export async function getGermanyCountryIntelligence() {
  const [
    inflation,
    unemployment,
    gdpGrowth,
    ecbRates,
    dax,
    bondYield,
  ] =
    await Promise.all([
      getGermanyInflation(),

      getGermanyUnemployment(),

      getGermanyGdpGrowth(),

      getEcbPolicyRates(),

      getGermanyMarket(),

      getGermanyBondYield(),
    ]);

  const ecbPolicy =
    ecbRates?.rates
      ?.depositFacility;

  const availableCount =
    [
      inflation?.value,
      unemployment?.value,
      gdpGrowth?.value,
      ecbPolicy?.value,
      bondYield?.value,
    ].filter(
      (value) =>
        value !== null &&
        value !== undefined
    ).length;

  return {
    country: {
      code:
        "DEU",

      name:
        "Germany",

      flag:
        "🇩🇪",

      currency:
        "EUR",

      market:
        "DAX",

      centralBank:
        "European Central Bank",
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
      inflation,

      policyRate: {
        name:
          "ECB Deposit Facility Rate",

        value:
          ecbPolicy?.value ??
          null,

        unit:
          "%",

        date:
          ecbPolicy?.date ??
          null,

        source:
          "European Central Bank",

        series:
          "ECB DFR",
      },

      gdpGrowth,

      unemployment,

      bondYield,
    },

    markets: {
      dax,
    },

    updatedAt:
      new Date().toISOString(),
  };
}