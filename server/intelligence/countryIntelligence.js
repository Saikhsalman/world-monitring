import {
  getCountryConfig,
} from "./countryConfig.js";

import {
  getIndiaCountryIntelligence,
} from "../services/indiaCountryService.js";

import {
  getUsCountryIntelligence,
} from "../services/usCountryService.js";

async function getBaseCountryData(
  countryCode
) {
  const code =
    String(countryCode || "")
      .toUpperCase()
      .trim();

  if (code === "IND") {
    return await getIndiaCountryIntelligence();
  }

  if (code === "USA") {
    return await getUsCountryIntelligence();
  }

  return null;
}

export async function getCountryIntelligence(
  countryCode
) {
  const country =
    getCountryConfig(
      countryCode
    );

  const baseData =
    await getBaseCountryData(
      country.code
    );

  const macro =
    baseData?.macro || {};

  const overview = {
    code:
      country.code,

    name:
      country.name,

    flag:
      country.flag,

    currency:
      country.currency,

    centralBank:
      country.centralBank,

    marketIndex:
      country.marketIndex,

    countryStatus:
      baseData?.status ||
      "unavailable",

    dataCoverage:
      {
        liveCount:
          baseData?.liveCount ??
          null,

        totalCount:
          baseData?.totalCount ??
          null,
      },
  };

  const economy = {
    gdpGrowth:
      macro?.gdpGrowth ??
      null,

    inflation:
      macro?.inflation ??
      null,

    unemployment:
      macro?.unemployment ??
      null,

    policyRate:
      macro?.policyRate ??
      null,

    bondYield:
      macro?.bondYield ??
      null,
  };

  return {
    status:
      "ok",

    country,

    sections: {
      overview: {
        status:
          "live",

        data:
          overview,
      },

      economy: {
        status:
          Object.values(
            economy
          ).some(
            (value) =>
              value !== null &&
              value !== undefined
          )
            ? "live"
            : "unavailable",

        data:
          economy,
      },

      markets: {
        status:
          "pending",

        data:
          null,
      },

      centralBank: {
        status:
          "pending",

        data:
          null,
      },

      trade: {
        status:
          "pending",

        data:
          null,
      },

      energy: {
        status:
          "pending",

        data:
          null,
      },

      debt: {
        status:
          "pending",

        data:
          null,
      },

      news: {
        status:
          "pending",

        data:
          null,
      },

      intelligence: {
        status:
          "pending",

        data:
          null,
      },
    },

    updatedAt:
      new Date()
        .toISOString(),
  };
}