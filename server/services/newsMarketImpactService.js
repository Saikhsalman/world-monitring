// =====================================================
// NEWS MARKET IMPACT ENGINE
// Exact-word / phrase matching
// =====================================================

const RISK_OFF_KEYWORDS = [
  "war",
  "missile",
  "attack",
  "conflict",
  "sanction",
  "sanctions",
  "recession",
  "default",
  "crisis",
  "emergency",
  "tariff",
  "tariffs",
];

const RISK_ON_KEYWORDS = [
  "rate cut",
  "stimulus",
  "ceasefire",
  "peace deal",
  "growth",
  "recovery",
  "support package",
];

const INDIA_POSITIVE_KEYWORDS = [
  "india growth",
  "indian growth",
  "rbi rate cut",
  "rupee strengthens",
  "rupee gains",
  "foreign investment",
  "fii buying",
  "gst growth",
];

const INDIA_NEGATIVE_KEYWORDS = [
  "india inflation",
  "indian inflation",
  "rbi rate hike",
  "rupee weakens",
  "rupee falls",
  "fii selling",
  "trade deficit",
  "crude oil rises",
  "oil prices rise",
];

const OIL_POSITIVE_KEYWORDS = [
  "oil rises",
  "oil prices rise",
  "crude rises",
  "crude oil rises",
  "supply cut",
  "opec cut",
  "production cut",
  "supply disruption",
];

const OIL_NEGATIVE_KEYWORDS = [
  "oil falls",
  "oil prices fall",
  "crude falls",
  "crude oil falls",
  "demand weakens",
  "production increase",
  "supply increase",
];

const USD_POSITIVE_KEYWORDS = [
  "fed rate hike",
  "federal reserve rate hike",
  "higher interest rates",
  "dollar strengthens",
  "strong dollar",
];

const USD_NEGATIVE_KEYWORDS = [
  "fed rate cut",
  "federal reserve rate cut",
  "dollar weakens",
  "weak dollar",
];

// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(article) {
  return `${article.title || ""} ${article.summary || ""}`
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// =====================================================
// ESCAPE REGEX
// =====================================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// =====================================================
// EXACT WORD / PHRASE MATCH
// =====================================================

function matchesKeyword(text, keyword) {
  const escaped = escapeRegex(
    keyword.toLowerCase()
  ).replace(/\s+/g, "\\s+");

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
    "i"
  );

  return pattern.test(text);
}

// =====================================================
// FIND MATCHES
// =====================================================

function matchKeywords(text, keywords) {
  return keywords.filter((keyword) =>
    matchesKeyword(text, keyword)
  );
}

// =====================================================
// ANALYZE MARKET IMPACT
// =====================================================

export function analyzeNewsMarketImpact(article) {
  const text =
    normalizeText(article);

  const signals = [];
  const reasons = [];

  const riskOffMatches =
    matchKeywords(
      text,
      RISK_OFF_KEYWORDS
    );

  const riskOnMatches =
    matchKeywords(
      text,
      RISK_ON_KEYWORDS
    );

  const indiaPositiveMatches =
    matchKeywords(
      text,
      INDIA_POSITIVE_KEYWORDS
    );

  const indiaNegativeMatches =
    matchKeywords(
      text,
      INDIA_NEGATIVE_KEYWORDS
    );

  const oilPositiveMatches =
    matchKeywords(
      text,
      OIL_POSITIVE_KEYWORDS
    );

  const oilNegativeMatches =
    matchKeywords(
      text,
      OIL_NEGATIVE_KEYWORDS
    );

  const usdPositiveMatches =
    matchKeywords(
      text,
      USD_POSITIVE_KEYWORDS
    );

  const usdNegativeMatches =
    matchKeywords(
      text,
      USD_NEGATIVE_KEYWORDS
    );

  // ===================================================
  // RISK SIGNALS
  // ===================================================

  if (riskOffMatches.length > 0) {
    signals.push("RISK_OFF");

    reasons.push(
      `Risk-off keywords: ${riskOffMatches.join(", ")}`
    );
  }

  if (riskOnMatches.length > 0) {
    signals.push("RISK_ON");

    reasons.push(
      `Risk-on keywords: ${riskOnMatches.join(", ")}`
    );
  }

  // ===================================================
  // INDIA SIGNALS
  // ===================================================

  if (
    indiaPositiveMatches.length > 0
  ) {
    signals.push(
      "INDIA_POSITIVE"
    );

    reasons.push(
      `India positive: ${indiaPositiveMatches.join(", ")}`
    );
  }

  if (
    indiaNegativeMatches.length > 0
  ) {
    signals.push(
      "INDIA_NEGATIVE"
    );

    reasons.push(
      `India negative: ${indiaNegativeMatches.join(", ")}`
    );
  }

  // ===================================================
  // OIL SIGNALS
  // ===================================================

  if (
    oilPositiveMatches.length > 0
  ) {
    signals.push(
      "OIL_POSITIVE"
    );

    reasons.push(
      `Oil positive: ${oilPositiveMatches.join(", ")}`
    );
  }

  if (
    oilNegativeMatches.length > 0
  ) {
    signals.push(
      "OIL_NEGATIVE"
    );

    reasons.push(
      `Oil negative: ${oilNegativeMatches.join(", ")}`
    );
  }

  // ===================================================
  // USD SIGNALS
  // ===================================================

  if (
    usdPositiveMatches.length > 0
  ) {
    signals.push(
      "USD_POSITIVE"
    );

    reasons.push(
      `USD positive: ${usdPositiveMatches.join(", ")}`
    );
  }

  if (
    usdNegativeMatches.length > 0
  ) {
    signals.push(
      "USD_NEGATIVE"
    );

    reasons.push(
      `USD negative: ${usdNegativeMatches.join(", ")}`
    );
  }

  // ===================================================
  // DEFAULT
  // ===================================================

  if (signals.length === 0) {
    signals.push("NEUTRAL");
  }

  // ===================================================
  // CALCULATE MARKET BIAS
  // ===================================================

  let positiveScore = 0;
  let negativeScore = 0;

  for (const signal of signals) {
    if (
      signal === "RISK_ON" ||
      signal === "INDIA_POSITIVE"
    ) {
      positiveScore += 2;
    }

    if (
      signal === "RISK_OFF" ||
      signal === "INDIA_NEGATIVE"
    ) {
      negativeScore += 2;
    }
  }

  let marketBias = "NEUTRAL";

  if (
    positiveScore > negativeScore
  ) {
    marketBias = "POSITIVE";
  }

  if (
    negativeScore > positiveScore
  ) {
    marketBias = "NEGATIVE";
  }

  return {
    marketBias,

    signals,

    reasons,

    score: {
      positive: positiveScore,
      negative: negativeScore,
    },
  };
}

// =====================================================
// ADD IMPACT TO SINGLE ARTICLE
// =====================================================

export function addMarketImpact(
  article
) {
  return {
    ...article,

    marketImpact:
      analyzeNewsMarketImpact(
        article
      ),
  };
}

// =====================================================
// ADD IMPACT TO ALL ARTICLES
// =====================================================

export function addMarketImpactToArticles(
  articles = []
) {
  return articles.map(
    addMarketImpact
  );
}