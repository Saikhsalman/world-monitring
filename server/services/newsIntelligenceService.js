// =====================================================
// NEWS INTELLIGENCE ENGINE
// Improved exact-word / phrase matching
// =====================================================

const HIGH_IMPACT_KEYWORDS = [
  "war",
  "missile",
  "attack",
  "sanction",
  "sanctions",
  "emergency",
  "central bank",
  "interest rate",
  "rate hike",
  "rate cut",
  "inflation",
  "recession",
  "default",
  "crude oil",
  "opec",
  "rbi",
  "fed",
  "federal reserve",
  "tariff",
  "tariffs",
];

const MEDIUM_IMPACT_KEYWORDS = [
  "economy",
  "economic",
  "market",
  "markets",
  "stock",
  "stocks",
  "shares",
  "trade",
  "oil",
  "gas",
  "currency",
  "rupee",
  "dollar",
  "jobs",
  "unemployment",
  "gdp",
  "bond",
  "bonds",
  "yield",
  "yields",
];

const INDIA_KEYWORDS = [
  "india",
  "indian",
  "rbi",
  "nifty",
  "sensex",
  "rupee",
  "sebi",
];

const ENERGY_KEYWORDS = [
  "oil",
  "crude",
  "crude oil",
  "opec",
  "gas",
  "natural gas",
  "petrol",
  "diesel",
  "energy",
];

const GEOPOLITICAL_KEYWORDS = [
  "war",
  "conflict",
  "military",
  "missile",
  "attack",
  "sanction",
  "sanctions",
  "russia",
  "russian",
  "ukraine",
  "ukrainian",
  "iran",
  "iranian",
  "israel",
  "israeli",
  "china",
  "chinese",
  "taiwan",
  "taiwanese",
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
// REGEX ESCAPE
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
// SPECIAL FALSE-POSITIVE RULES
// =====================================================

function isValidKeywordMatch(
  text,
  keyword
) {
  if (!matchesKeyword(text, keyword)) {
    return false;
  }

  // Example:
  // "Stock up on food"
  // should NOT be treated as stock-market news.
  if (
    keyword === "stock" &&
    matchesKeyword(text, "stock up")
  ) {
    return false;
  }

  // Prevent generic "market" usage such as:
  // "local growers hope to grab more of the market"
  // from automatically becoming important market news.
  if (
    keyword === "market" &&
    (
      text.includes("grab more of the market") ||
      text.includes("share of the market")
    )
  ) {
    return false;
  }

  return true;
}

// =====================================================
// FIND MATCHES
// =====================================================

function findMatches(text, keywords) {
  return keywords.filter((keyword) =>
    isValidKeywordMatch(
      text,
      keyword
    )
  );
}

function hasKeyword(text, keywords) {
  return (
    findMatches(
      text,
      keywords
    ).length > 0
  );
}

// =====================================================
// IMPACT SCORE
// =====================================================

export function calculateNewsImpact(
  article
) {
  const text =
    normalizeText(article);

  let score = 0;
  const reasons = [];

  const highMatches =
    findMatches(
      text,
      HIGH_IMPACT_KEYWORDS
    );

  const mediumMatches =
    findMatches(
      text,
      MEDIUM_IMPACT_KEYWORDS
    );

  for (
    const keyword of highMatches
  ) {
    score += 3;

    reasons.push(
      `High-impact keyword: ${keyword}`
    );
  }

  for (
    const keyword of mediumMatches
  ) {
    score += 1;

    reasons.push(
      `Market keyword: ${keyword}`
    );
  }

  // Prevent excessively large scores
  score = Math.min(score, 10);

  let impact = "LOW";

  if (score >= 6) {
    impact = "HIGH";
  } else if (score >= 3) {
    impact = "MEDIUM";
  }

  return {
    score,
    impact,
    reasons,
  };
}

// =====================================================
// NEWS CATEGORY CLASSIFICATION
// =====================================================

export function classifyNews(
  article
) {
  const text =
    normalizeText(article);

  const categories = [];

  if (
    hasKeyword(
      text,
      INDIA_KEYWORDS
    )
  ) {
    categories.push("INDIA");
  }

  if (
    hasKeyword(
      text,
      ENERGY_KEYWORDS
    )
  ) {
    categories.push("ENERGY");
  }

  if (
    hasKeyword(
      text,
      GEOPOLITICAL_KEYWORDS
    )
  ) {
    categories.push(
      "GEOPOLITICS"
    );
  }

  if (
    hasKeyword(
      text,
      MEDIUM_IMPACT_KEYWORDS
    )
  ) {
    categories.push("MARKETS");
  }

  if (
    categories.length === 0
  ) {
    categories.push("GENERAL");
  }

  return categories;
}

// =====================================================
// ENRICH SINGLE ARTICLE
// =====================================================

export function enrichArticle(
  article
) {
  const impact =
    calculateNewsImpact(article);

  const categories =
    classifyNews(article);

  return {
    ...article,

    intelligence: {
      score:
        impact.score,

      impact:
        impact.impact,

      reasons:
        impact.reasons,

      categories,
    },
  };
}

// =====================================================
// ENRICH ALL ARTICLES
// =====================================================

export function enrichArticles(
  articles = []
) {
  return articles
    .map(enrichArticle)
    .sort(
      (a, b) =>
        b.intelligence.score -
        a.intelligence.score
    );
}