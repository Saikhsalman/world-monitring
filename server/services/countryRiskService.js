// =====================================================
// COUNTRY RISK SERVICE
// Automatic Macro + Market Risk Scoring Engine
// =====================================================

// =====================================================
// HELPERS
// =====================================================

function isNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(
      Number(value)
    )
  );
}

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

function round(
  value,
  decimals = 2
) {
  const factor =
    10 ** decimals;

  return (
    Math.round(
      value * factor
    ) / factor
  );
}

// =====================================================
// INDICATOR RISK SCORING
//
// Each component returns:
// score: 0-100
// available: true/false
// reason: short explanation
// =====================================================

// =====================================================
// INFLATION
// =====================================================

function scoreInflation(
  value
) {
  if (!isNumber(value)) {
    return {
      available:
        false,

      score:
        null,

      reason:
        "Inflation data unavailable",
    };
  }

  const inflation =
    Number(value);

  let score = 0;

  if (inflation < 0) {
    score = 55;
  } else if (
    inflation <= 2.5
  ) {
    score = 15;
  } else if (
    inflation <= 4
  ) {
    score = 30;
  } else if (
    inflation <= 6
  ) {
    score = 50;
  } else if (
    inflation <= 8
  ) {
    score = 70;
  } else {
    score = 90;
  }

  return {
    available:
      true,

    score,

    reason:
      inflation > 6
        ? `High inflation at ${round(
            inflation
          )}%`
        : inflation < 0
          ? `Deflation risk at ${round(
              inflation
            )}%`
          : `Inflation at ${round(
              inflation
            )}%`,
  };
}

// =====================================================
// POLICY RATE
// =====================================================

function scorePolicyRate(
  value
) {
  if (!isNumber(value)) {
    return {
      available:
        false,

      score:
        null,

      reason:
        "Policy rate unavailable",
    };
  }

  const rate =
    Number(value);

  let score = 0;

  if (rate <= 1) {
    score = 15;
  } else if (
    rate <= 3
  ) {
    score = 25;
  } else if (
    rate <= 5
  ) {
    score = 40;
  } else if (
    rate <= 8
  ) {
    score = 60;
  } else if (
    rate <= 12
  ) {
    score = 75;
  } else {
    score = 90;
  }

  return {
    available:
      true,

    score,

    reason:
      rate >= 8
        ? `Restrictive policy rate at ${round(
            rate
          )}%`
        : `Policy rate at ${round(
            rate
          )}%`,
  };
}

// =====================================================
// GDP GROWTH
// =====================================================

function scoreGdpGrowth(
  value
) {
  if (!isNumber(value)) {
    return {
      available:
        false,

      score:
        null,

      reason:
        "GDP growth unavailable",
    };
  }

  const growth =
    Number(value);

  let score = 0;

  if (growth >= 5) {
    score = 10;
  } else if (
    growth >= 3
  ) {
    score = 20;
  } else if (
    growth >= 1
  ) {
    score = 35;
  } else if (
    growth >= 0
  ) {
    score = 50;
  } else if (
    growth >= -2
  ) {
    score = 75;
  } else {
    score = 95;
  }

  return {
    available:
      true,

    score,

    reason:
      growth < 0
        ? `Economic contraction ${round(
            growth
          )}%`
        : growth < 1
          ? `Weak GDP growth ${round(
              growth
            )}%`
          : `GDP growth ${round(
              growth
            )}%`,
  };
}

// =====================================================
// UNEMPLOYMENT
// =====================================================

function scoreUnemployment(
  value
) {
  if (!isNumber(value)) {
    return {
      available:
        false,

      score:
        null,

      reason:
        "Unemployment unavailable",
    };
  }

  const unemployment =
    Number(value);

  let score = 0;

  if (
    unemployment <= 3
  ) {
    score = 15;
  } else if (
    unemployment <= 5
  ) {
    score = 25;
  } else if (
    unemployment <= 7
  ) {
    score = 40;
  } else if (
    unemployment <= 10
  ) {
    score = 60;
  } else if (
    unemployment <= 15
  ) {
    score = 80;
  } else {
    score = 95;
  }

  return {
    available:
      true,

    score,

    reason:
      unemployment >= 10
        ? `High unemployment at ${round(
            unemployment
          )}%`
        : `Unemployment at ${round(
            unemployment
          )}%`,
  };
}

// =====================================================
// 10Y BOND YIELD
// =====================================================

function scoreBondYield(
  value
) {
  if (!isNumber(value)) {
    return {
      available:
        false,

      score:
        null,

      reason:
        "10Y bond yield unavailable",
    };
  }

  const yieldValue =
    Number(value);

  let score = 0;

  if (
    yieldValue <= 2
  ) {
    score = 15;
  } else if (
    yieldValue <= 4
  ) {
    score = 25;
  } else if (
    yieldValue <= 6
  ) {
    score = 40;
  } else if (
    yieldValue <= 8
  ) {
    score = 60;
  } else if (
    yieldValue <= 10
  ) {
    score = 75;
  } else {
    score = 90;
  }

  return {
    available:
      true,

    score,

    reason:
      yieldValue >= 8
        ? `Elevated 10Y yield at ${round(
            yieldValue
          )}%`
        : `10Y yield at ${round(
            yieldValue
          )}%`,
  };
}

// =====================================================
// CURRENCY MOVE
//
// Absolute daily move is used.
// A sharp FX move is treated as risk.
// =====================================================

function scoreCurrencyMove(
  percentChange
) {
  if (
    !isNumber(
      percentChange
    )
  ) {
    return {
      available:
        false,

      score:
        null,

      reason:
        "Currency move unavailable",
    };
  }

  const move =
    Math.abs(
      Number(
        percentChange
      )
    );

  let score = 0;

  if (move < 0.3) {
    score = 10;
  } else if (
    move < 0.75
  ) {
    score = 25;
  } else if (
    move < 1.5
  ) {
    score = 45;
  } else if (
    move < 3
  ) {
    score = 70;
  } else {
    score = 90;
  }

  return {
    available:
      true,

    score,

    reason:
      move >= 1.5
        ? `High FX volatility: ${round(
            move
          )}% move`
        : `Currency move ${round(
            move
          )}%`,
  };
}

// =====================================================
// STOCK MARKET MOVE
//
// Sharp negative equity moves increase risk.
// Strong positive moves reduce near-term market stress.
// =====================================================

function scoreMarketMove(
  percentChange
) {
  if (
    !isNumber(
      percentChange
    )
  ) {
    return {
      available:
        false,

      score:
        null,

      reason:
        "Stock-market move unavailable",
    };
  }

  const change =
    Number(
      percentChange
    );

  let score = 0;

  if (change >= 2) {
    score = 5;
  } else if (
    change >= 0.5
  ) {
    score = 15;
  } else if (
    change >= -0.5
  ) {
    score = 25;
  } else if (
    change >= -1.5
  ) {
    score = 45;
  } else if (
    change >= -3
  ) {
    score = 70;
  } else {
    score = 95;
  }

  return {
    available:
      true,

    score,

    reason:
      change <= -1.5
        ? `Equity market down ${Math.abs(
            round(change)
          )}%`
        : change >= 1
          ? `Equity market up ${round(
              change
            )}%`
          : `Equity market move ${round(
              change
            )}%`,
  };
}

// =====================================================
// WEIGHTS
// Total = 100
// =====================================================

const WEIGHTS = {
  inflation:
    18,

  policyRate:
    12,

  gdpGrowth:
    18,

  unemployment:
    12,

  bondYield:
    15,

  currency:
    12,

  stockMarket:
    13,
};

// =====================================================
// RISK LEVEL
// =====================================================

function getRiskLevel(
  score
) {
  if (score < 30) {
    return "LOW";
  }

  if (score < 50) {
    return "MEDIUM";
  }

  if (score < 70) {
    return "HIGH";
  }

  return "CRITICAL";
}

// =====================================================
// MARKET BIAS
// =====================================================

function getMarketBias({
  riskScore,
  gdpGrowth,
  inflation,
  marketChange,
  currencyMove,
}) {
  let biasScore = 0;

  if (
    isNumber(
      gdpGrowth
    )
  ) {
    const gdp =
      Number(
        gdpGrowth
      );

    if (gdp >= 3) {
      biasScore += 2;
    } else if (
      gdp < 0
    ) {
      biasScore -= 2;
    }
  }

  if (
    isNumber(
      inflation
    )
  ) {
    const inflationValue =
      Number(
        inflation
      );

    if (
      inflationValue <= 4
    ) {
      biasScore += 1;
    } else if (
      inflationValue >= 6
    ) {
      biasScore -= 1;
    }
  }

  if (
    isNumber(
      marketChange
    )
  ) {
    const change =
      Number(
        marketChange
      );

    if (change >= 1) {
      biasScore += 2;
    } else if (
      change <= -1
    ) {
      biasScore -= 2;
    }
  }

  if (
    isNumber(
      currencyMove
    )
  ) {
    const move =
      Math.abs(
        Number(
          currencyMove
        )
      );

    if (move >= 2) {
      biasScore -= 1;
    }
  }

  if (riskScore >= 70) {
    biasScore -= 2;
  } else if (
    riskScore <= 30
  ) {
    biasScore += 1;
  }

  if (biasScore >= 2) {
    return "POSITIVE";
  }

  if (biasScore <= -2) {
    return "NEGATIVE";
  }

  return "NEUTRAL";
}

// =====================================================
// CONFIDENCE
// =====================================================

function getConfidence(
  availableCount,
  totalCount
) {
  const ratio =
    availableCount /
    totalCount;

  if (ratio >= 0.85) {
    return "HIGH";
  }

  if (ratio >= 0.6) {
    return "MEDIUM";
  }

  return "LOW";
}

// =====================================================
// MAIN COUNTRY RISK ENGINE
// =====================================================

export function calculateCountryRisk({
  countryCode,
  macro,
  currencyMarket,
  markets,
}) {
  const inflation =
    macro?.inflation?.value;

  const policyRate =
    macro?.policyRate?.value;

  const gdpGrowth =
    macro?.gdpGrowth?.value;

  const unemployment =
    macro?.unemployment?.value;

  const bondYield =
    macro?.bondYield?.value;

  // Generic countries
  let currencyMove =
    currencyMarket?.primary
      ?.percentChange;

  let marketMove =
    markets?.primary
      ?.percentChange;

  // Dedicated country structures
  if (
    currencyMove === undefined ||
    currencyMove === null
  ) {
    currencyMove =
      currencyMarket?.usdInr
        ?.percentChange ??
      currencyMarket?.usdJpy
        ?.percentChange;
  }

  if (
    marketMove === undefined ||
    marketMove === null
  ) {
    marketMove =
      markets?.nifty50
        ?.percentChange ??
      markets?.sp500Proxy
        ?.percentChange ??
      markets?.dax
        ?.percentChange ??
      markets?.nikkei225
        ?.percentChange;
  }

  // ===================================================
  // SCORE EACH COMPONENT
  // ===================================================

  const components = {
    inflation:
      scoreInflation(
        inflation
      ),

    policyRate:
      scorePolicyRate(
        policyRate
      ),

    gdpGrowth:
      scoreGdpGrowth(
        gdpGrowth
      ),

    unemployment:
      scoreUnemployment(
        unemployment
      ),

    bondYield:
      scoreBondYield(
        bondYield
      ),

    currency:
      scoreCurrencyMove(
        currencyMove
      ),

    stockMarket:
      scoreMarketMove(
        marketMove
      ),
  };

  // ===================================================
  // WEIGHTED SCORE
  //
  // Missing indicators are excluded and remaining
  // weights are normalized automatically.
  // ===================================================

  let weightedScore = 0;
  let availableWeight = 0;

  const reasons = [];

  for (
    const [
      key,
      component,
    ] of Object.entries(
      components
    )
  ) {
    if (
      !component.available
    ) {
      continue;
    }

    const weight =
      WEIGHTS[key];

    weightedScore +=
      component.score *
      weight;

    availableWeight +=
      weight;

    reasons.push({
      indicator:
        key,

      score:
        component.score,

      reason:
        component.reason,
    });
  }

  const riskScore =
    availableWeight > 0
      ? clamp(
          weightedScore /
            availableWeight,
          0,
          100
        )
      : 50;

  const roundedRiskScore =
    round(
      riskScore,
      1
    );

  // ===================================================
  // SORT REASONS
  // Highest-risk contributors first
  // ===================================================

  const sortedReasons =
    [...reasons]
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  const topReasons =
    sortedReasons
      .slice(
        0,
        5
      )
      .map(
        (item) =>
          item.reason
      );

  const availableCount =
    Object.values(
      components
    ).filter(
      (item) =>
        item.available
    ).length;

  const totalCount =
    Object.keys(
      components
    ).length;

  const riskLevel =
    getRiskLevel(
      roundedRiskScore
    );

  const marketBias =
    getMarketBias({
      riskScore:
        roundedRiskScore,

      gdpGrowth,

      inflation,

      marketChange:
        marketMove,

      currencyMove,
    });

  const confidence =
    getConfidence(
      availableCount,
      totalCount
    );

  // ===================================================
  // FINAL RESPONSE
  // ===================================================

  return {
    countryCode:
      String(
        countryCode || ""
      )
        .toUpperCase()
        .trim(),

    riskScore:
      roundedRiskScore,

    riskLevel,

    marketBias,

    confidence,

    availableIndicators:
      availableCount,

    totalIndicators:
      totalCount,

    coveragePercent:
      round(
        (
          availableCount /
          totalCount
        ) *
          100,
        1
      ),

    reasons:
      topReasons,

    components: {
      inflation: {
        value:
          isNumber(
            inflation
          )
            ? Number(
                inflation
              )
            : null,

        riskScore:
          components
            .inflation
            .score,
      },

      policyRate: {
        value:
          isNumber(
            policyRate
          )
            ? Number(
                policyRate
              )
            : null,

        riskScore:
          components
            .policyRate
            .score,
      },

      gdpGrowth: {
        value:
          isNumber(
            gdpGrowth
          )
            ? Number(
                gdpGrowth
              )
            : null,

        riskScore:
          components
            .gdpGrowth
            .score,
      },

      unemployment: {
        value:
          isNumber(
            unemployment
          )
            ? Number(
                unemployment
              )
            : null,

        riskScore:
          components
            .unemployment
            .score,
      },

      bondYield: {
        value:
          isNumber(
            bondYield
          )
            ? Number(
                bondYield
              )
            : null,

        riskScore:
          components
            .bondYield
            .score,
      },

      currency: {
        value:
          isNumber(
            currencyMove
          )
            ? Number(
                currencyMove
              )
            : null,

        riskScore:
          components
            .currency
            .score,
      },

      stockMarket: {
        value:
          isNumber(
            marketMove
          )
            ? Number(
                marketMove
              )
            : null,

        riskScore:
          components
            .stockMarket
            .score,
      },
    },

    updatedAt:
      new Date().toISOString(),
  };
}