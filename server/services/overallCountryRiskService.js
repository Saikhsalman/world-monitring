// =====================================================
// OVERALL COUNTRY RISK SERVICE
// Macro Risk 70% + News Risk 30%
// =====================================================

function isNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value))
  );
}

function clamp(value, min, max) {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

function round(value, decimals = 1) {
  const factor =
    10 ** decimals;

  return (
    Math.round(
      value * factor
    ) / factor
  );
}

// =====================================================
// CONFIG
// =====================================================

const MACRO_WEIGHT = 0.70;
const NEWS_WEIGHT = 0.30;

// =====================================================
// RISK LEVEL
// =====================================================

function getRiskLevel(score) {
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
// OVERALL MARKET BIAS
// =====================================================

function getOverallBias(
  macroBias,
  newsBias,
  overallScore
) {
  let score = 0;

  if (macroBias === "POSITIVE") {
    score += 2;
  }

  if (macroBias === "NEGATIVE") {
    score -= 2;
  }

  if (newsBias === "POSITIVE") {
    score += 1;
  }

  if (newsBias === "NEGATIVE") {
    score -= 1;
  }

  if (overallScore >= 70) {
    score -= 2;
  } else if (overallScore >= 50) {
    score -= 1;
  } else if (overallScore < 30) {
    score += 1;
  }

  if (score >= 2) {
    return "POSITIVE";
  }

  if (score <= -2) {
    return "NEGATIVE";
  }

  return "NEUTRAL";
}

// =====================================================
// NEWS BIAS
// =====================================================

function calculateNewsBias(
  countryNews
) {
  const articles =
    countryNews?.articles || [];

  if (!articles.length) {
    return "NEUTRAL";
  }

  let positive = 0;
  let negative = 0;

  for (const article of articles) {
    if (
      article?.marketBias ===
      "POSITIVE"
    ) {
      positive++;
    }

    if (
      article?.marketBias ===
      "NEGATIVE"
    ) {
      negative++;
    }
  }

  if (positive > negative) {
    return "POSITIVE";
  }

  if (negative > positive) {
    return "NEGATIVE";
  }

  return "NEUTRAL";
}

// =====================================================
// MAIN ENGINE
// =====================================================

export function calculateOverallCountryRisk({
  countryCode,
  macroRisk,
  newsRisk,
  countryNews,
}) {
  const macroAvailable =
    isNumber(
      macroRisk?.riskScore
    );

  const newsAvailable =
    isNumber(
      newsRisk?.score
    ) &&
    (
      countryNews?.fetchedCount >
      0
    );

  const macroScore =
    macroAvailable
      ? Number(
          macroRisk.riskScore
        )
      : null;

  const newsScore =
    newsAvailable
      ? Number(
          newsRisk.score
        )
      : null;

  let overallScore;
  let calculationMethod;

  // ===================================================
  // BOTH AVAILABLE
  // ===================================================

  if (
    macroAvailable &&
    newsAvailable
  ) {
    overallScore =
      (
        macroScore *
        MACRO_WEIGHT
      ) +
      (
        newsScore *
        NEWS_WEIGHT
      );

    calculationMethod =
      "70% Macro + 30% News";
  }

  // ===================================================
  // ONLY MACRO
  // ===================================================

  else if (macroAvailable) {
    overallScore =
      macroScore;

    calculationMethod =
      "Macro only";
  }

  // ===================================================
  // ONLY NEWS
  // ===================================================

  else if (newsAvailable) {
    overallScore =
      newsScore;

    calculationMethod =
      "News only";
  }

  // ===================================================
  // NOTHING AVAILABLE
  // ===================================================

  else {
    overallScore = 50;

    calculationMethod =
      "Fallback";
  }

  overallScore =
    round(
      clamp(
        overallScore,
        0,
        100
      ),
      1
    );

  const riskLevel =
    getRiskLevel(
      overallScore
    );

  const newsBias =
    calculateNewsBias(
      countryNews
    );

  const marketBias =
    getOverallBias(
      macroRisk?.marketBias ||
        "NEUTRAL",

      newsBias,

      overallScore
    );

  // ===================================================
  // CONFIDENCE
  // ===================================================

  let confidence =
    "LOW";

  if (
    macroAvailable &&
    newsAvailable
  ) {
    confidence =
      macroRisk?.confidence ===
      "HIGH"
        ? "HIGH"
        : "MEDIUM";
  } else if (
    macroAvailable ||
    newsAvailable
  ) {
    confidence =
      "MEDIUM";
  }

  // ===================================================
  // DRIVERS
  // ===================================================

  const drivers = [];

  if (macroAvailable) {
    drivers.push(
      `Macro risk ${round(
        macroScore,
        1
      )}/100`
    );
  }

  if (newsAvailable) {
    drivers.push(
      `News risk ${round(
        newsScore,
        1
      )}/100`
    );
  }

  if (
    newsRisk?.highImpactCount >
    0
  ) {
    drivers.push(
      `${newsRisk.highImpactCount} high-impact news event(s)`
    );
  }

  if (
    newsRisk?.negativeCount >
    0
  ) {
    drivers.push(
      `${newsRisk.negativeCount} negative market news event(s)`
    );
  }

  // ===================================================
  // FINAL
  // ===================================================

  return {
    countryCode:
      String(
        countryCode || ""
      )
        .toUpperCase()
        .trim(),

    overallRiskScore:
      overallScore,

    overallRiskLevel:
      riskLevel,

    marketBias,

    confidence,

    calculationMethod,

    weights: {
      macro:
        MACRO_WEIGHT,

      news:
        NEWS_WEIGHT,
    },

    scores: {
      macro:
        macroScore,

      news:
        newsScore,
    },

    newsBias,

    drivers,

    updatedAt:
      new Date().toISOString(),
  };
}
