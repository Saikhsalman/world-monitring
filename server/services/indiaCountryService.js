import {
  getCountryMacro,
} from "./countryMacroService.js";

import {
  getRbiPolicyRates,
  getRbiMarketSnapshot,
} from "./rbiService.js";

// =====================================================
// INDIA COUNTRY INTELLIGENCE
// World Bank + RBI + FBIL
// =====================================================

export async function getIndiaCountryIntelligence() {
  const [
    baseMacro,
    rbiPolicy,
    rbiMarket,
  ] =
    await Promise.all([
      getCountryMacro("IND"),
      getRbiPolicyRates(),
      getRbiMarketSnapshot(),
    ]);

  const repoRate =
    rbiPolicy?.rates?.repoRate;

  const usdInr =
    rbiMarket?.exchangeRates?.usdInr;

  const nifty50 =
    rbiMarket?.markets?.nifty50;

  const tenYear =
    rbiMarket
      ?.governmentSecurities
      ?.tenYearProxy;

  const inflation =
    baseMacro?.macro?.inflation;

  const gdpGrowth =
    baseMacro?.macro?.gdpGrowth;

  const unemployment =
    baseMacro?.macro?.unemployment;

  const availableCount =
    [
      inflation?.value,
      gdpGrowth?.value,
      unemployment?.value,
      repoRate?.value,
      tenYear?.value,
    ].filter(
      (value) =>
        value !== null &&
        value !== undefined
    ).length;

  return {
    country: {
      code:
        "IND",

      name:
        "India",

      flag:
        "🇮🇳",

      currency:
        "INR",

      market:
        "NIFTY 50",

      centralBank:
        "Reserve Bank of India",
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

    // =================================================
    // MACRO
    // =================================================

    macro: {
      inflation,

      policyRate: {
        name:
          "RBI Policy Repo Rate",

        value:
          repoRate?.value ?? null,

        unit:
          "%",

        source:
          "Reserve Bank of India",

        sourceUrl:
          rbiPolicy?.sourceUrl ?? null,

        updatedAt:
          rbiPolicy?.updatedAt ?? null,
      },

      gdpGrowth,

      unemployment,

      bondYield: {
        name:
          "India 10Y Government Bond Yield",

        security:
          tenYear?.security ?? null,

        value:
          tenYear?.value ?? null,

        unit:
          "%",

        date:
          rbiMarket?.marketDate ?? null,

        source:
          "Reserve Bank of India",
      },
    },

    // =================================================
    // CURRENCY
    // =================================================

    currencyMarket: {
      usdInr: {
        name:
          "USD/INR",

        value:
          usdInr?.value ?? null,

        unit:
          usdInr?.unit ??
          "INR per USD",

        date:
          rbiMarket?.exchangeRateDate ??
          null,

        source:
          rbiMarket?.exchangeRateSource ??
          "FBIL",
      },
    },

    // =================================================
    // STOCK MARKET
    // =================================================

    markets: {
      nifty50: {
        name:
          "NIFTY 50",

        value:
          nifty50?.value ?? null,

        date:
          rbiMarket?.marketDate ?? null,

        source:
          "Reserve Bank of India",
      },
    },

    updatedAt:
      new Date().toISOString(),
  };
}