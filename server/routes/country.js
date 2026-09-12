import express from "express";

import {
  getCountryMacro,
  getCountryMacroHistory,
} from "../services/countryMacroService.js";

import {
  getGlobalCountryMarket,
  hasGlobalMarketSupport,
} from "../services/globalCountryMarketService.js";

import {
  getGlobalCountryRates,
  hasGlobalRatesSupport,
} from "../services/globalCountryRatesService.js";

import {
  calculateCountryRisk,
} from "../services/countryRiskService.js";

import {
  getCountryNews,
  hasCountryNewsSupport,
} from "../services/countryNewsService.js";

import {
  getUsCountryIntelligence,
} from "../services/usCountryService.js";

import {
  getGermanyCountryIntelligence,
} from "../services/germanyCountryService.js";

import {
  getIndiaCountryIntelligence,
} from "../services/indiaCountryService.js";

import {
  getJapanCountryIntelligence,
} from "../services/japanCountryService.js";

const router =
  express.Router();

// =====================================================
// SAFE COUNTRY NEWS
// =====================================================

async function getSafeCountryNews(
  countryCode
) {
  if (
    !hasCountryNewsSupport(
      countryCode
    )
  ) {
    return {
      countryCode,

      status:
        "unavailable",

      fetchedCount:
        0,

      currentIssues:
        [],

      articles:
        [],

      newsRisk: {
        score:
          0,

        level:
          "LOW",

        highImpactCount:
          0,

        negativeCount:
          0,
      },

      updatedAt:
        new Date()
          .toISOString(),
    };
  }

  try {
    return await getCountryNews(
      countryCode
    );
  } catch (error) {
    console.error(
      `COUNTRY NEWS ${countryCode} ERROR:`,
      error.message
    );

    return {
      countryCode,

      status:
        "unavailable",

      fetchedCount:
        0,

      currentIssues:
        [],

      articles:
        [],

      newsRisk: {
        score:
          0,

        level:
          "LOW",

        highImpactCount:
          0,

        negativeCount:
          0,
      },

      error:
        error.message,

      updatedAt:
        new Date()
          .toISOString(),
    };
  }
}

// =====================================================
// ENRICH COUNTRY
// =====================================================

async function enrichCountryIntelligence(
  countryCode,
  data
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  const countryNews =
    await getSafeCountryNews(
      code
    );

  const riskIntelligence =
    calculateCountryRisk({
      countryCode:
        code,

      macro:
        data?.macro,

      currencyMarket:
        data?.currencyMarket,

      markets:
        data?.markets,
    });

  const currentIssues =
    Array.isArray(
      countryNews
        ?.currentIssues
    )
      ? countryNews
          .currentIssues
      : [];

  return {
    ...data,

    riskIntelligence,

    countryNews,

    currentIssues,

    newsStatus:
      countryNews?.status ||
      "unavailable",

    newsRisk:
      countryNews?.newsRisk ||
      null,

    updatedAt:
      new Date()
        .toISOString(),
  };
}

// =====================================================
// COUNTRY MACRO HISTORY
// IMPORTANT: Ye route "/:code" se pehle rehna chahiye
// =====================================================

router.get(
  "/:code/history",
  async (req, res) => {
    try {
      const code =
        String(
          req.params.code || ""
        )
          .toUpperCase()
          .trim();

      const years =
        Number(
          req.query.years
        ) || 10;

      const data =
        await getCountryMacroHistory(
          code,
          years
        );

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "COUNTRY HISTORY ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Failed to fetch country history",

          details:
            error.message,
        });
    }
  }
);

// =====================================================
// COUNTRY INTELLIGENCE
// =====================================================

router.get(
  "/:code",
  async (req, res) => {
    try {
      const code =
        String(
          req.params.code
        )
          .toUpperCase()
          .trim();

      // =================================================
      // INDIA
      // =================================================

      if (
        code === "IND"
      ) {
        const baseData =
          await getIndiaCountryIntelligence();

        const data =
          await enrichCountryIntelligence(
            code,
            baseData
          );

        return res.json(
          data
        );
      }

      // =================================================
      // USA
      // =================================================

      if (
        code === "USA"
      ) {
        const baseData =
          await getUsCountryIntelligence();

        const data =
          await enrichCountryIntelligence(
            code,
            baseData
          );

        return res.json(
          data
        );
      }

      // =================================================
      // GERMANY
      // =================================================

      if (
        code === "DEU"
      ) {
        const baseData =
          await getGermanyCountryIntelligence();

        const data =
          await enrichCountryIntelligence(
            code,
            baseData
          );

        return res.json(
          data
        );
      }

      // =================================================
      // JAPAN
      // =================================================

      if (
        code === "JPN"
      ) {
        const baseData =
          await getJapanCountryIntelligence();

        const data =
          await enrichCountryIntelligence(
            code,
            baseData
          );

        return res.json(
          data
        );
      }

      // =================================================
      // GENERIC COUNTRY MACRO
      // =================================================

      const macro =
        await getCountryMacro(
          code
        );

      // =================================================
      // MARKET + FX + RATES
      // =================================================

      const [
        marketData,
        ratesData,
      ] =
        await Promise.all([
          hasGlobalMarketSupport(
            code
          )
            ? getGlobalCountryMarket(
                code
              )
            : Promise.resolve(
                null
              ),

          hasGlobalRatesSupport(
            code
          )
            ? getGlobalCountryRates(
                code
              )
            : Promise.resolve(
                null
              ),
        ]);

      // =================================================
      // MERGE MACRO
      // =================================================

      const mergedMacro = {
        ...macro.macro,

        policyRate:
          ratesData
            ?.policyRate ||
          macro.macro
            ?.policyRate,

        bondYield:
          ratesData
            ?.bondYield ||
          macro.macro
            ?.bondYield,
      };

      // =================================================
      // NORMALIZE CURRENCY
      // =================================================

      const currencyMarket =
        marketData?.currency
          ? {
              primary:
                marketData.currency,
            }
          : undefined;

      // =================================================
      // NORMALIZE MARKET
      // =================================================

      const markets =
        marketData?.market
          ? {
              primary:
                marketData.market,
            }
          : undefined;

      // =================================================
      // LIVE COUNT
      // =================================================

      const liveIndicators =
        [
          mergedMacro
            ?.inflation
            ?.value,

          mergedMacro
            ?.policyRate
            ?.value,

          mergedMacro
            ?.gdpGrowth
            ?.value,

          mergedMacro
            ?.unemployment
            ?.value,

          mergedMacro
            ?.bondYield
            ?.value,
        ].filter(
          (value) =>
            value !== null &&
            value !== undefined
        ).length;

      // =================================================
      // BASE RESPONSE
      // =================================================

      const baseResponse = {
        country:
          macro.country,

        status:
          liveIndicators === 5
            ? "live"
            : liveIndicators > 0
              ? "partial"
              : "unavailable",

        liveCount:
          liveIndicators,

        totalCount:
          5,

        macro:
          mergedMacro,

        currencyMarket,

        markets,

        advancedMarketStatus:
          marketData?.status ||
          "unavailable",

        ratesStatus:
          ratesData?.status ||
          "unavailable",

        updatedAt:
          new Date()
            .toISOString(),
      };

      // =================================================
      // RISK + NEWS
      // =================================================

      const response =
        await enrichCountryIntelligence(
          code,
          baseResponse
        );

      return res.json(
        response
      );
    } catch (error) {
      console.error(
        "COUNTRY ROUTE ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Failed to fetch country intelligence",

          details:
            error.message,
        });
    }
  }
);

export default router;