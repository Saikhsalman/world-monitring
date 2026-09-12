// =====================================================
// GLOBAL COUNTRY MACRO SERVICE
// Generic World Bank Engine
// =====================================================

const WORLD_BANK_BASE =
  "https://api.worldbank.org/v2";

// =====================================================
// MAJOR COUNTRY OVERRIDES
// Used for better names / markets / central banks
// =====================================================

const COUNTRY_OVERRIDES = {
  IND: {
    flag: "🇮🇳",
    currency: "INR",
    market: "NIFTY 50",
    centralBank: "Reserve Bank of India",
  },

  USA: {
    flag: "🇺🇸",
    currency: "USD",
    market: "S&P 500",
    centralBank: "Federal Reserve",
  },

  DEU: {
    flag: "🇩🇪",
    currency: "EUR",
    market: "DAX",
    centralBank: "European Central Bank",
  },

  JPN: {
    flag: "🇯🇵",
    currency: "JPY",
    market: "Nikkei 225",
    centralBank: "Bank of Japan",
  },

  CHN: {
    flag: "🇨🇳",
    currency: "CNY",
    market: "Shanghai Composite",
    centralBank: "People's Bank of China",
  },

  GBR: {
    flag: "🇬🇧",
    currency: "GBP",
    market: "FTSE 100",
    centralBank: "Bank of England",
  },

  FRA: {
    flag: "🇫🇷",
    currency: "EUR",
    market: "CAC 40",
    centralBank: "European Central Bank",
  },

  ITA: {
    flag: "🇮🇹",
    currency: "EUR",
    market: "FTSE MIB",
    centralBank: "European Central Bank",
  },

  ESP: {
    flag: "🇪🇸",
    currency: "EUR",
    market: "IBEX 35",
    centralBank: "European Central Bank",
  },

  CAN: {
    flag: "🇨🇦",
    currency: "CAD",
    market: "S&P/TSX Composite",
    centralBank: "Bank of Canada",
  },

  AUS: {
    flag: "🇦🇺",
    currency: "AUD",
    market: "ASX 200",
    centralBank: "Reserve Bank of Australia",
  },

  BRA: {
    flag: "🇧🇷",
    currency: "BRL",
    market: "Bovespa",
    centralBank: "Central Bank of Brazil",
  },

  KOR: {
    flag: "🇰🇷",
    currency: "KRW",
    market: "KOSPI",
    centralBank: "Bank of Korea",
  },

  CHE: {
    flag: "🇨🇭",
    currency: "CHF",
    market: "SMI",
    centralBank: "Swiss National Bank",
  },

  RUS: {
    flag: "🇷🇺",
    currency: "RUB",
    market: "MOEX",
    centralBank: "Bank of Russia",
  },

  MEX: {
    flag: "🇲🇽",
    currency: "MXN",
    market: "IPC Mexico",
    centralBank: "Bank of Mexico",
  },

  IDN: {
    flag: "🇮🇩",
    currency: "IDR",
    market: "Jakarta Composite",
    centralBank: "Bank Indonesia",
  },

  ZAF: {
    flag: "🇿🇦",
    currency: "ZAR",
    market: "FTSE/JSE",
    centralBank: "South African Reserve Bank",
  },

  SAU: {
    flag: "🇸🇦",
    currency: "SAR",
    market: "Tadawul",
    centralBank: "Saudi Central Bank",
  },

  ARE: {
    flag: "🇦🇪",
    currency: "AED",
    market: "ADX",
    centralBank: "Central Bank of UAE",
  },
};

// =====================================================
// WORLD BANK INDICATORS
// =====================================================

const INDICATORS = {
  inflation:
    "FP.CPI.TOTL.ZG",

  gdpGrowth:
    "NY.GDP.MKTP.KD.ZG",

  unemployment:
    "SL.UEM.TOTL.ZS",
};

// =====================================================
// GET COUNTRY PROFILE
// =====================================================

async function getCountryProfile(
  code
) {
  const url =
    `${WORLD_BANK_BASE}/country/${code}` +
    `?format=json`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `World Bank country ${code} HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  const item =
    data?.[1]?.[0];

  if (!item) {
    throw new Error(
      `Unknown country: ${code}`
    );
  }

  const override =
    COUNTRY_OVERRIDES[code] ||
    {};

  return {
    code,

    name:
      item.name || code,

    flag:
      override.flag || "🌍",

    currency:
      override.currency || "",

    market:
      override.market || "",

    centralBank:
      override.centralBank || "",

    region:
      item.region?.value || null,

    incomeLevel:
      item.incomeLevel?.value ||
      null,

    capital:
      item.capitalCity || null,

    latitude:
      item.latitude || null,

    longitude:
      item.longitude || null,
  };
}

// =====================================================
// GET WORLD BANK INDICATOR
// =====================================================

async function getLatestIndicator(
  code,
  indicator
) {
  const url =
    `${WORLD_BANK_BASE}/country/${code}` +
    `/indicator/${indicator}` +
    `?format=json&per_page=20`;

  try {
    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        `World Bank ${indicator} HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const rows =
      Array.isArray(data?.[1])
        ? data[1]
        : [];

    const latest =
      rows.find(
        (item) =>
          item.value !== null &&
          item.value !== undefined
      );

    if (!latest) {
      return {
        status:
          "unavailable",

        value:
          null,

        date:
          null,

        source:
          "World Bank",
      };
    }

    return {
      status:
        "live",

      value:
        Number(latest.value),

      date:
        latest.date,

      source:
        "World Bank",
    };
  } catch (error) {
    console.error(
      `WORLD BANK ${code} ${indicator}:`,
      error.message
    );

    return {
      status:
        "unavailable",

      value:
        null,

      date:
        null,

      source:
        "World Bank",

      error:
        error.message,
    };
  }
}

// =====================================================
// GENERIC POLICY RATE PLACEHOLDER
// Dedicated services override this
// =====================================================

function getPolicyRatePlaceholder(
  profile
) {
  return {
    name:
      "Policy Rate",

    value:
      null,

    date:
      null,

    unit:
      "%",

    status:
      "pending_source",

    source:
      profile.centralBank ||
      "Central Bank",
  };
}

// =====================================================
// MAIN GENERIC COUNTRY REPORT
// =====================================================

export async function getCountryMacro(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  if (!code) {
    throw new Error(
      "Country code missing"
    );
  }

  const profile =
    await getCountryProfile(
      code
    );

  const [
    inflation,
    gdpGrowth,
    unemployment,
  ] =
    await Promise.all([
      getLatestIndicator(
        code,
        INDICATORS.inflation
      ),

      getLatestIndicator(
        code,
        INDICATORS.gdpGrowth
      ),

      getLatestIndicator(
        code,
        INDICATORS.unemployment
      ),
    ]);

  const policyRate =
    getPolicyRatePlaceholder(
      profile
    );

  const liveCount =
    [
      inflation,
      gdpGrowth,
      unemployment,
    ].filter(
      (item) =>
        item.status ===
        "live"
    ).length;

  return {
    country: {
      code:
        profile.code,

      name:
        profile.name,

      flag:
        profile.flag,

      currency:
        profile.currency,

      market:
        profile.market,

      centralBank:
        profile.centralBank,

      region:
        profile.region,

      incomeLevel:
        profile.incomeLevel,

      capital:
        profile.capital,

      latitude:
        profile.latitude,

      longitude:
        profile.longitude,
    },

    status:
      liveCount === 3
        ? "live"
        : liveCount > 0
          ? "partial"
          : "unavailable",

    liveCount,

    totalCount:
      3,

    macro: {
      inflation: {
        name:
          "Inflation YoY",

        unit:
          "%",

        ...inflation,
      },

      policyRate,

      gdpGrowth: {
        name:
          "GDP Growth",

        unit:
          "%",

        ...gdpGrowth,
      },

      unemployment: {
        name:
          "Unemployment",

        unit:
          "%",

        ...unemployment,
      },
    },

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// MAJOR COUNTRY LIST
// =====================================================

export function getSupportedCountries() {
  return Object.entries(
    COUNTRY_OVERRIDES
  ).map(
    ([code, data]) => ({
      code,
      ...data,
    })
  );
}
// =====================================================
// COUNTRY MACRO HISTORY
// =====================================================

async function getIndicatorHistory(
  code,
  indicator,
  years = 10
) {
  const url =
    `${WORLD_BANK_BASE}/country/${code}` +
    `/indicator/${indicator}` +
    `?format=json&per_page=60`;

  try {
    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        `World Bank history ${indicator} HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const rows =
      Array.isArray(data?.[1])
        ? data[1]
        : [];

    return rows
      .filter(
        (item) =>
          item.value !== null &&
          item.value !== undefined
      )
      .map(
        (item) => ({
          year:
            String(item.date),

          value:
            Number(item.value),
        })
      )
      .sort(
        (a, b) =>
          Number(a.year) -
          Number(b.year)
      )
      .slice(
        -years
      );
  } catch (error) {
    console.error(
      `WORLD BANK HISTORY ${code} ${indicator}:`,
      error.message
    );

    return [];
  }
}

export async function getCountryMacroHistory(
  countryCode,
  years = 10
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  if (!code) {
    throw new Error(
      "Country code missing"
    );
  }

  const safeYears =
    Math.max(
      3,
      Math.min(
        20,
        Number(years) || 10
      )
    );

  const [
    gdpGrowth,
    inflation,
    unemployment,
  ] =
    await Promise.all([
      getIndicatorHistory(
        code,
        INDICATORS.gdpGrowth,
        safeYears
      ),

      getIndicatorHistory(
        code,
        INDICATORS.inflation,
        safeYears
      ),

      getIndicatorHistory(
        code,
        INDICATORS.unemployment,
        safeYears
      ),
    ]);

  return {
    status:
      gdpGrowth.length ||
      inflation.length ||
      unemployment.length
        ? "live"
        : "unavailable",

    countryCode:
      code,

    years:
      safeYears,

    series: {
      gdpGrowth: {
        name:
          "GDP Growth",
        unit:
          "%",
        source:
          "World Bank",
        data:
          gdpGrowth,
      },

      inflation: {
        name:
          "Inflation YoY",
        unit:
          "%",
        source:
          "World Bank",
        data:
          inflation,
      },

      unemployment: {
        name:
          "Unemployment",
        unit:
          "%",
        source:
          "World Bank",
        data:
          unemployment,
      },
    },

    updatedAt:
      new Date()
        .toISOString(),
  };
}
