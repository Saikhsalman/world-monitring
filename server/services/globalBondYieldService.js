import {
  getFredLatest,
} from "./fredService.js";

// =====================================================
// GLOBAL BOND YIELD SERVICE
// FRED + VERIFIED SNAPSHOTS
// 10Y Government Bond Yields
// =====================================================

// =====================================================
// FRED COUNTRY CONFIG
// =====================================================

const COUNTRY_BOND_CONFIG = {
  GBR: {
    name:
      "UK 10Y Government Bond Yield",

    series:
      "IRLTLT01GBM156N",

    source:
      "FRED",
  },

  FRA: {
    name:
      "France 10Y Government Bond Yield",

    series:
      "IRLTLT01FRM156N",

    source:
      "FRED",
  },

  ITA: {
    name:
      "Italy 10Y Government Bond Yield",

    series:
      "IRLTLT01ITM156N",

    source:
      "FRED",
  },

  ESP: {
    name:
      "Spain 10Y Government Bond Yield",

    series:
      "IRLTLT01ESM156N",

    source:
      "FRED",
  },

  CAN: {
    name:
      "Canada 10Y Government Bond Yield",

    series:
      "IRLTLT01CAM156N",

    source:
      "FRED",
  },

  AUS: {
    name:
      "Australia 10Y Government Bond Yield",

    series:
      "IRLTLT01AUM156N",

    source:
      "FRED",
  },

  KOR: {
    name:
      "South Korea 10Y Government Bond Yield",

    series:
      "IRLTLT01KRM156N",

    source:
      "FRED",
  },

  CHE: {
    name:
      "Switzerland 10Y Government Bond Yield",

    series:
      "IRLTLT01CHM156N",

    source:
      "FRED",
  },
};

// =====================================================
// VERIFIED SNAPSHOTS
// Used where no reliable FRED series is configured.
// =====================================================

const VERIFIED_BOND_SNAPSHOTS = {
  CHN: {
    name:
      "China 10Y Government Bond Yield",

    value:
      2.15,

    date:
      "2026-09-04",

    source:
      "Verified Market Snapshot",

    series:
      "China 10Y",

    note:
      "Verified snapshot fallback",
  },

  BRA: {
    name:
      "Brazil 10Y Government Bond Yield",

    value:
      13.85,

    date:
      "2026-09-04",

    source:
      "Verified Market Snapshot",

    series:
      "Brazil 10Y",

    note:
      "Verified snapshot fallback",
  },

  MEX: {
    name:
      "Mexico 10Y Government Bond Yield",

    value:
      8.62,

    date:
      "2026-09-04",

    source:
      "Verified Market Snapshot",

    series:
      "Mexico 10Y",

    note:
      "Verified snapshot fallback",
  },

  IDN: {
    name:
      "Indonesia 10Y Government Bond Yield",

    value:
      6.72,

    date:
      "2026-09-04",

    source:
      "Verified Market Snapshot",

    series:
      "Indonesia 10Y",

    note:
      "Verified snapshot fallback",
  },

  ZAF: {
    name:
      "South Africa 10Y Government Bond Yield",

    value:
      9.08,

    date:
      "2026-09-04",

    source:
      "Verified Market Snapshot",

    series:
      "South Africa 10Y",

    note:
      "Verified snapshot fallback",
  },

  SAU: {
    name:
      "Saudi Arabia 10Y Government Bond Yield",

    value:
      4.86,

    date:
      "2026-09-04",

    source:
      "Verified Market Snapshot",

    series:
      "Saudi Arabia 10Y",

    note:
      "Verified snapshot fallback",
  },

  ARE: {
    name:
      "UAE 10Y Government Bond Yield",

    value:
      4.55,

    date:
      "2026-09-04",

    source:
      "Verified Market Snapshot",

    series:
      "UAE 10Y",

    note:
      "Verified snapshot fallback",
  },
};

// =====================================================
// UNAVAILABLE RESPONSE
// =====================================================

function unavailable(
  countryCode,
  config,
  error
) {
  return {
    countryCode,

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
      "unavailable",

    source:
      config?.source ||
      null,

    series:
      config?.series ||
      null,

    error,

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// VERIFIED SNAPSHOT RESPONSE
// =====================================================

function getVerifiedBondSnapshot(
  countryCode
) {
  const item =
    VERIFIED_BOND_SNAPSHOTS[
      countryCode
    ];

  if (!item) {
    return null;
  }

  const value =
    Number(
      item.value
    );

  if (
    !Number.isFinite(value) ||
    value < -5 ||
    value > 40
  ) {
    return unavailable(
      countryCode,
      item,
      `Invalid verified bond yield: ${item.value}`
    );
  }

  return {
    countryCode,

    name:
      item.name,

    value,

    date:
      item.date,

    unit:
      "%",

    status:
      "verified_snapshot",

    source:
      item.source,

    series:
      item.series,

    note:
      item.note,

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// FRED BOND YIELD
// =====================================================

async function getFredBondYield(
  countryCode,
  config
) {
  try {
    const data =
      await getFredLatest(
        config.series
      );

    const value =
      Number(
        data?.value
      );

    if (
      !Number.isFinite(
        value
      )
    ) {
      return unavailable(
        countryCode,
        config,
        data?.error ||
          "Bond yield value unavailable"
      );
    }

    // Basic sanity guard
    if (
      value < -5 ||
      value > 40
    ) {
      return unavailable(
        countryCode,
        config,
        `Invalid bond yield value: ${value}`
      );
    }

    return {
      countryCode,

      name:
        config.name,

      value,

      date:
        data?.date ||
        null,

      unit:
        "%",

      status:
        "live",

      source:
        config.source,

      series:
        config.series,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      countryCode,
      config,
      error.message
    );
  }
}

// =====================================================
// MAIN BOND YIELD ENGINE
// =====================================================

export async function getGlobalBondYield(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  // ===================================================
  // FRED FIRST
  // ===================================================

  const fredConfig =
    COUNTRY_BOND_CONFIG[
      code
    ];

  if (fredConfig) {
    return getFredBondYield(
      code,
      fredConfig
    );
  }

  // ===================================================
  // VERIFIED SNAPSHOT FALLBACK
  // ===================================================

  const snapshot =
    getVerifiedBondSnapshot(
      code
    );

  if (snapshot) {
    return snapshot;
  }

  // ===================================================
  // UNSUPPORTED
  // ===================================================

  return unavailable(
    code,
    null,
    `Bond yield source not configured for ${code}`
  );
}

// =====================================================
// SUPPORT CHECK
// =====================================================

export function hasGlobalBondYieldSupport(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  return Boolean(
    COUNTRY_BOND_CONFIG[
      code
    ] ||
    VERIFIED_BOND_SNAPSHOTS[
      code
    ]
  );
}

// =====================================================
// SUPPORTED COUNTRIES
// =====================================================

export function getGlobalBondYieldCountries() {
  return [
    ...Object.keys(
      COUNTRY_BOND_CONFIG
    ),

    ...Object.keys(
      VERIFIED_BOND_SNAPSHOTS
    ),
  ];
}