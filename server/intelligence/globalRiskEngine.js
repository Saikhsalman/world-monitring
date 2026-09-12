// =====================================================
// WORLD MONITOR
// GLOBAL RISK ENGINE V2
// =====================================================

const GLOBAL_RISK_WEIGHTS = {
  macro: 0.25,
  markets: 0.25,
  energy: 0.20,
  news: 0.20,
  internet: 0.10,
};

// =====================================================
// HELPERS
// =====================================================

function clamp(
  value,
  min = 0,
  max = 100
) {
  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.min(
    max,
    Math.max(min, number)
  );
}

function average(
  values = []
) {
  const valid =
    values
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      )
      .map(Number)
      .filter(Number.isFinite);

  if (!valid.length) {
    return null;
  }

  return (
    valid.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    valid.length
  );
}

function riskLevel(
  score
) {
  if (
    score === null ||
    score === undefined
  ) {
    return "UNKNOWN";
  }

  if (score >= 75) {
    return "CRITICAL";
  }

  if (score >= 50) {
    return "HIGH";
  }

  if (score >= 25) {
    return "MEDIUM";
  }

  return "LOW";
}

function riskBias(
  score
) {
  if (
    score === null ||
    score === undefined
  ) {
    return "UNKNOWN";
  }

  if (score >= 75) {
    return "STRONG_RISK_OFF";
  }

  if (score >= 50) {
    return "RISK_OFF";
  }

  if (score >= 25) {
    return "NEUTRAL";
  }

  return "RISK_ON";
}

// =====================================================
// INFLATION NORMALIZATION
// =====================================================

function getInflationRate(
  inflation = {}
) {
  const latest =
    Number(
      inflation.latestCpi
    );

  const previous =
    Number(
      inflation.previousYearCpi
    );

  // CPI YoY calculation
  if (
    Number.isFinite(latest) &&
    Number.isFinite(previous) &&
    previous !== 0
  ) {
    return (
      (
        latest -
        previous
      ) /
      previous
    ) *
      100;
  }

  const value =
    Number(
      inflation.value
    );

  const unit =
    String(
      inflation.unit || ""
    );

  // Only use raw value if API says it is %
  if (
    Number.isFinite(value) &&
    unit.includes("%")
  ) {
    return value;
  }

  // Never treat CPI index like 332 as 332% inflation.
  return null;
}

// =====================================================
// MACRO RISK
// =====================================================

function calculateMacroRisk(
  macro = {}
) {
  const scores = [];

  const us10y =
    Number(
      macro?.us10y?.value
    );

  const fedFunds =
    Number(
      macro?.fedFunds?.value
    );

  const unemployment =
    Number(
      macro
        ?.unemployment
        ?.value
    );

  const inflationRate =
    getInflationRate(
      macro?.inflation ||
        {}
    );

  // US 10Y
  if (
    Number.isFinite(us10y)
  ) {
    let score = 20;

    if (us10y >= 3.5) {
      score = 40;
    }

    if (us10y >= 4) {
      score = 55;
    }

    if (us10y >= 4.5) {
      score = 70;
    }

    if (us10y >= 5) {
      score = 85;
    }

    scores.push(score);
  }

  // FED FUNDS
  if (
    Number.isFinite(
      fedFunds
    )
  ) {
    let score = 20;

    if (fedFunds >= 3) {
      score = 40;
    }

    if (fedFunds >= 4) {
      score = 60;
    }

    if (fedFunds >= 5) {
      score = 80;
    }

    scores.push(score);
  }

  // INFLATION
  if (
    inflationRate !== null
  ) {
    let score = 15;

    if (
      inflationRate >= 2.5
    ) {
      score = 35;
    }

    if (
      inflationRate >= 4
    ) {
      score = 60;
    }

    if (
      inflationRate >= 6
    ) {
      score = 80;
    }

    scores.push(score);
  }

  // UNEMPLOYMENT
  if (
    Number.isFinite(
      unemployment
    )
  ) {
    let score = 20;

    if (
      unemployment >= 4
    ) {
      score = 35;
    }

    if (
      unemployment >= 5
    ) {
      score = 55;
    }

    if (
      unemployment >= 7
    ) {
      score = 80;
    }

    scores.push(score);
  }

  return average(
    scores
  );
}

// =====================================================
// MARKET RISK
// =====================================================

function equityChangeRisk(
  change
) {
  const value =
    Number(change);

  if (
    !Number.isFinite(value)
  ) {
    return null;
  }

  if (value <= -4) {
    return 95;
  }

  if (value <= -3) {
    return 85;
  }

  if (value <= -2) {
    return 72;
  }

  if (value <= -1) {
    return 58;
  }

  if (value < 0) {
    return 42;
  }

  if (value >= 3) {
    return 15;
  }

  if (value >= 1) {
    return 22;
  }

  return 30;
}

function vixRisk(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return null;
  }

  if (number >= 40) {
    return 95;
  }

  if (number >= 30) {
    return 80;
  }

  if (number >= 25) {
    return 65;
  }

  if (number >= 20) {
    return 50;
  }

  if (number >= 15) {
    return 30;
  }

  return 15;
}

function calculateMarketRisk(
  markets = {}
) {
  const scores = [];

  // Supports both:
  // markets.sp500
  // AND
  // globalMarkets.markets.sp500Proxy

  const nested =
    markets?.markets ||
    markets;

  const sp500 =
    nested?.sp500 ||
    nested?.sp500Proxy;

  const nasdaq =
    nested?.nasdaq ||
    nested?.nasdaqProxy;

  const primary =
    nested?.primary;

  const gold =
    nested?.gold;

  const vix =
    nested?.vix;

  [
    sp500,
    nasdaq,
    primary,
  ].forEach(
    (market) => {
      const score =
        equityChangeRisk(
          market
            ?.percentChange ??
          market
            ?.percent_change
        );

      if (
        score !== null
      ) {
        scores.push(score);
      }
    }
  );

  // VIX is a direct fear indicator
  const vixScore =
    vixRisk(
      vix?.value ??
      vix?.close
    );

  if (
    vixScore !== null
  ) {
    scores.push(
      vixScore
    );
  }

  // Gold rise can signal defensive demand.
  const goldChange =
    Number(
      gold?.percentChange ??
      gold?.percent_change
    );

  if (
    Number.isFinite(
      goldChange
    )
  ) {
    let goldScore = 30;

    if (
      goldChange >= 1
    ) {
      goldScore = 45;
    }

    if (
      goldChange >= 2
    ) {
      goldScore = 60;
    }

    if (
      goldChange >= 3
    ) {
      goldScore = 70;
    }

    scores.push(
      goldScore
    );
  }

  return average(
    scores
  );
}

// =====================================================
// ENERGY RISK
// =====================================================

function calculateEnergyRisk(
  energy = {}
) {
  const scores = [];

  const intelligenceScore =
    clamp(
      energy
        ?.intelligence
        ?.energyScore
    );

  if (
    intelligenceScore !==
    null
  ) {
    scores.push(
      intelligenceScore
    );
  }

  const wti =
    Number(
      energy
        ?.prices
        ?.wti
        ?.value
    );

  const brent =
    Number(
      energy
        ?.prices
        ?.brent
        ?.value
    );

  const crudePrice =
    Number.isFinite(brent)
      ? brent
      : Number.isFinite(wti)
        ? wti
        : null;

  if (
    crudePrice !== null
  ) {
    let score = 20;

    if (
      crudePrice >= 80
    ) {
      score = 45;
    }

    if (
      crudePrice >= 90
    ) {
      score = 60;
    }

    if (
      crudePrice >= 100
    ) {
      score = 75;
    }

    if (
      crudePrice >= 120
    ) {
      score = 90;
    }

    scores.push(score);
  }

  return average(
    scores
  );
}

// =====================================================
// NEWS RISK
// =====================================================

function calculateNewsRisk(
  news = {}
) {
  const directScore =
    clamp(
      news?.riskScore ??
      news?.newsRisk?.score ??
      news
        ?.intelligence
        ?.riskScore
    );

  if (
    directScore !== null
  ) {
    return directScore;
  }

  const articles =
    news?.articles ||
    news?.items ||
    news?.news ||
    news?.data ||
    [];

  if (
    !Array.isArray(
      articles
    ) ||
    !articles.length
  ) {
    return null;
  }

  const scores = [];

  for (
    const article
    of articles
  ) {
    const impact =
      String(
        article?.impact ||
        article?.severity ||
        article?.riskLevel ||
        ""
      ).toUpperCase();

    if (
      impact ===
      "CRITICAL"
    ) {
      scores.push(95);
    } else if (
      impact === "HIGH"
    ) {
      scores.push(75);
    } else if (
      impact === "MEDIUM"
    ) {
      scores.push(50);
    } else if (
      impact === "LOW"
    ) {
      scores.push(25);
    }
  }

  return average(
    scores
  );
}

// =====================================================
// INTERNET RISK
// =====================================================

function calculateInternetRisk(
  internet = {}
) {
  const directScore =
    clamp(
      internet?.riskScore ??
      internet?.risk?.score
    );

  if (
    directScore !== null
  ) {
    return directScore;
  }

  const outages =
    internet?.outages ||
    internet?.events;

  if (
    !Array.isArray(
      outages
    )
  ) {
    return null;
  }

  const count =
    outages.length;

  if (count === 0) {
    return 10;
  }

  if (count <= 2) {
    return 25;
  }

  if (count <= 5) {
    return 45;
  }

  if (count <= 10) {
    return 65;
  }

  return 85;
}

// =====================================================
// WEIGHTED SCORE
// =====================================================

function calculateWeightedScore(
  components
) {
  let weightedTotal = 0;
  let availableWeight = 0;

  for (
    const [
      key,
      weight,
    ] of Object.entries(
      GLOBAL_RISK_WEIGHTS
    )
  ) {
    const score =
      components[key];

    if (
      score === null ||
      score === undefined
    ) {
      continue;
    }

    weightedTotal +=
      score *
      weight;

    availableWeight +=
      weight;
  }

  if (
    availableWeight === 0
  ) {
    return null;
  }

  return clamp(
    weightedTotal /
      availableWeight
  );
}

// =====================================================
// DRIVERS
// =====================================================

function buildDrivers(
  components
) {
  const labels = {
    macro:
      "Macro conditions elevated",

    markets:
      "Global market stress elevated",

    energy:
      "Energy risk elevated",

    news:
      "Global news risk elevated",

    internet:
      "Internet disruption risk elevated",
  };

  return Object
    .entries(
      components
    )
    .filter(
      ([, score]) =>
        score !== null &&
        score >= 50
    )
    .sort(
      (a, b) =>
        b[1] - a[1]
    )
    .map(
      ([key, score]) =>
        `${labels[key]} (${score.toFixed(
          1
        )})`
    )
    .slice(
      0,
      5
    );
}

// =====================================================
// MAIN ENGINE
// =====================================================

export function calculateGlobalRisk({
  macro = {},
  markets = {},
  energy = {},
  news = {},
  internet = {},
} = {}) {
  const components = {
    macro:
      calculateMacroRisk(
        macro
      ),

    markets:
      calculateMarketRisk(
        markets
      ),

    energy:
      calculateEnergyRisk(
        energy
      ),

    news:
      calculateNewsRisk(
        news
      ),

    internet:
      calculateInternetRisk(
        internet
      ),
  };

  const globalRiskScore =
    calculateWeightedScore(
      components
    );

  const availableComponents =
    Object
      .values(
        components
      )
      .filter(
        (value) =>
          value !== null
      )
      .length;

  const totalComponents =
    Object.keys(
      GLOBAL_RISK_WEIGHTS
    ).length;

  const coveragePercent =
    Math.round(
      (
        availableComponents /
        totalComponents
      ) *
      100
    );

  const normalizedComponents =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(
      components
    )
  ) {
    normalizedComponents[
      key
    ] =
      value === null
        ? null
        : Number(
            value.toFixed(
              1
            )
          );
  }

  return {
    status:
      globalRiskScore ===
      null
        ? "unavailable"
        : coveragePercent ===
            100
          ? "live"
          : "partial",

    globalRiskScore:
      globalRiskScore ===
      null
        ? null
        : Number(
            globalRiskScore.toFixed(
              1
            )
          ),

    globalRiskLevel:
      riskLevel(
        globalRiskScore
      ),

    bias:
      riskBias(
        globalRiskScore
      ),

    components:
      normalizedComponents,

    weights:
      GLOBAL_RISK_WEIGHTS,

    coverage: {
      availableComponents,
      totalComponents,
      coveragePercent,
    },

    drivers:
      buildDrivers(
        components
      ),

    diagnostics: {
      inflationRate:
        getInflationRate(
          macro?.inflation ||
            {}
        ),

      marketPayloadDetected:
        Boolean(
          markets?.markets ||
          markets?.sp500 ||
          markets?.sp500Proxy
        ),
    },

    methodology:
      "Weighted normalized multi-factor global risk model V2",

    updatedAt:
      new Date()
        .toISOString(),
  };
}