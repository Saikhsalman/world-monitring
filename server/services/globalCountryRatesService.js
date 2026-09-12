import {
  getOfficialCentralBankRate,
  hasOfficialCentralBankSupport,
} from "./globalCentralBankService.js";

import {
  getEcbPolicyRates,
} from "./ecbService.js";

import {
  getGlobalBondYield,
  hasGlobalBondYieldSupport,
} from "./globalBondYieldService.js";

// =====================================================
// GLOBAL COUNTRY RATES SERVICE
// ECB + OFFICIAL CENTRAL BANKS + GLOBAL BOND ENGINE
// =====================================================

const COUNTRY_RATES_CONFIG = {
  CHN: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "China 1-Year Loan Prime Rate",

      source:
        "PBOC / NIFC",

      series:
        "1Y LPR",
    },

    bondYield: {
      name:
        "China 10Y Government Bond Yield",
    },
  },

  GBR: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "Bank of England Bank Rate",

      source:
        "Bank of England",

      series:
        "IUDBEDR",
    },

    bondYield: {
      name:
        "UK 10Y Government Bond Yield",
    },
  },

  FRA: {
    policyType: "ECB",

    policyRate: {
      name:
        "ECB Deposit Facility Rate",

      source:
        "European Central Bank",

      series:
        "ECB DFR",
    },

    bondYield: {
      name:
        "France 10Y Government Bond Yield",
    },
  },

  ITA: {
    policyType: "ECB",

    policyRate: {
      name:
        "ECB Deposit Facility Rate",

      source:
        "European Central Bank",

      series:
        "ECB DFR",
    },

    bondYield: {
      name:
        "Italy 10Y Government Bond Yield",
    },
  },

  ESP: {
    policyType: "ECB",

    policyRate: {
      name:
        "ECB Deposit Facility Rate",

      source:
        "European Central Bank",

      series:
        "ECB DFR",
    },

    bondYield: {
      name:
        "Spain 10Y Government Bond Yield",
    },
  },

  CAN: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "Bank of Canada Target Overnight Rate",

      source:
        "Bank of Canada",

      series:
        "V39079",
    },

    bondYield: {
      name:
        "Canada 10Y Government Bond Yield",
    },
  },

  AUS: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "RBA Cash Rate Target",

      source:
        "Reserve Bank of Australia",

      series:
        "Cash Rate Target",
    },

    bondYield: {
      name:
        "Australia 10Y Government Bond Yield",
    },
  },

  BRA: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "SELIC Target Rate",

      source:
        "Central Bank of Brazil",

      series:
        "BCB SGS 432",
    },

    bondYield: {
      name:
        "Brazil 10Y Government Bond Yield",
    },
  },

  KOR: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "Bank of Korea Base Rate",

      source:
        "Bank of Korea",

      series:
        "BOK Base Rate",
    },

    bondYield: {
      name:
        "South Korea 10Y Government Bond Yield",
    },
  },

  CHE: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "SNB Policy Rate",

      source:
        "Swiss National Bank",

      series:
        "SNB Policy Rate",
    },

    bondYield: {
      name:
        "Switzerland 10Y Government Bond Yield",
    },
  },

  MEX: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "Banco de Mexico Overnight Rate Target",

      source:
        "Banco de Mexico",

      series:
        "Target Rate",
    },

    bondYield: {
      name:
        "Mexico 10Y Government Bond Yield",
    },
  },

  IDN: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "BI-Rate",

      source:
        "Bank Indonesia",

      series:
        "BI-Rate",
    },

    bondYield: {
      name:
        "Indonesia 10Y Government Bond Yield",
    },
  },

  ZAF: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "SARB Policy Rate",

      source:
        "South African Reserve Bank",

      series:
        "SARB Policy Rate",
    },

    bondYield: {
      name:
        "South Africa 10Y Government Bond Yield",
    },
  },

  SAU: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "Saudi Central Bank Repo Rate",

      source:
        "Saudi Central Bank",

      series:
        "Official Repo Rate",
    },

    bondYield: {
      name:
        "Saudi Arabia 10Y Government Bond Yield",
    },
  },

  ARE: {
    policyType: "OFFICIAL",

    policyRate: {
      name:
        "UAE Base Rate",

      source:
        "Central Bank of UAE",

      series:
        "CBUAE Base Rate",
    },

    bondYield: {
      name:
        "UAE 10Y Government Bond Yield",
    },
  },
};

// =====================================================
// ECB POLICY RATE
// =====================================================

async function getEcbRate(
  config
) {
  try {
    const data =
      await getEcbPolicyRates();

    const rate =
      data?.rates
        ?.depositFacility;

    if (
      rate?.value === null ||
      rate?.value === undefined
    ) {
      throw new Error(
        "ECB deposit facility rate missing"
      );
    }

    return {
      name:
        config.name,

      value:
        rate.value,

      date:
        rate.date || null,

      unit:
        "%",

      status:
        "live",

      source:
        "European Central Bank",

      series:
        config.series,
    };
  } catch (error) {
    return {
      name:
        config.name,

      value:
        null,

      date:
        null,

      unit:
        "%",

      status:
        "unavailable",

      source:
        config.source,

      series:
        config.series,

      error:
        error.message,
    };
  }
}

// =====================================================
// POLICY RATE
// =====================================================

async function getPolicyRate(
  countryCode,
  config
) {
  if (
    config.policyType ===
    "ECB"
  ) {
    return getEcbRate(
      config.policyRate
    );
  }

  if (
    config.policyType ===
      "OFFICIAL" &&
    hasOfficialCentralBankSupport(
      countryCode
    )
  ) {
    const result =
      await getOfficialCentralBankRate(
        countryCode
      );

    return {
      name:
        result?.name ||
        config.policyRate.name,

      value:
        result?.value ??
        null,

      date:
        result?.date ??
        null,

      unit:
        result?.unit ||
        "%",

      status:
        result?.status ||
        "unavailable",

      source:
        result?.source ||
        config.policyRate.source,

      series:
        result?.series ||
        config.policyRate.series,

      sourceUrl:
        result?.sourceUrl ||
        null,

      note:
        result?.note,

      error:
        result?.error,
    };
  }

  return {
    name:
      config.policyRate.name,

    value:
      null,

    date:
      null,

    unit:
      "%",

    status:
      "pending_source",

    source:
      config.policyRate.source,

    series:
      config.policyRate.series,

    note:
      config.policyRate.note ||
      "Official live source pending",
  };
}

// =====================================================
// 10Y GOVERNMENT BOND YIELD
// =====================================================

async function getBondYield(
  countryCode,
  config
) {
  if (
    hasGlobalBondYieldSupport(
      countryCode
    )
  ) {
    const result =
      await getGlobalBondYield(
        countryCode
      );

    return {
      name:
        result?.name ||
        config?.name ||
        "10Y Government Bond Yield",

      value:
        result?.value ??
        null,

      date:
        result?.date ??
        null,

      unit:
        result?.unit ||
        "%",

      status:
        result?.status ||
        "unavailable",

      source:
        result?.source ||
        "FRED",

      series:
        result?.series ||
        null,

      sourceUrl:
        result?.sourceUrl ||
        null,

      note:
        result?.note,

      error:
        result?.error,
    };
  }

  return {
    name:
      config?.name ||
      "10Y Government Bond Yield",

    value:
      null,

    date:
      null,

    unit:
      "%",

    status:
      "pending_source",

    source:
      null,

    series:
      null,

    note:
      "10Y government bond yield source pending",
  };
}

// =====================================================
// MAIN ENGINE
// =====================================================

export async function getGlobalCountryRates(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  const config =
    COUNTRY_RATES_CONFIG[
      code
    ];

  if (!config) {
    return {
      status:
        "unavailable",

      countryCode:
        code,

      policyRate:
        null,

      bondYield:
        null,

      liveCount:
        0,

      totalCount:
        2,

      updatedAt:
        new Date().toISOString(),
    };
  }

  const [
    policyRate,
    bondYield,
  ] =
    await Promise.all([
      getPolicyRate(
        code,
        config
      ),

      getBondYield(
        code,
        config.bondYield
      ),
    ]);

  const availableCount =
    [
      policyRate,
      bondYield,
    ].filter(
      (item) =>
        item?.status ===
          "live" ||
        item?.status ===
          "verified_snapshot"
    ).length;

  return {
    status:
      availableCount === 2
        ? "live"
        : availableCount > 0
          ? "partial"
          : "unavailable",

    countryCode:
      code,

    policyRate,

    bondYield,

    liveCount:
      availableCount,

    totalCount:
      2,

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// SUPPORT CHECK
// =====================================================

export function hasGlobalRatesSupport(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  return Boolean(
    COUNTRY_RATES_CONFIG[
      code
    ]
  );
}