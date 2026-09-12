import {
  getBreakingIntelligence,
} from "./newsService.js";

// =====================================================
// COUNTRY NEWS SERVICE
// Reuses existing RSS + intelligence + market impact
// =====================================================

// =====================================================
// COUNTRY KEYWORDS
// =====================================================

const COUNTRY_KEYWORDS = {
  IND: [
    "india",
    "indian",
    "rbi",
    "nifty",
    "sensex",
    "rupee",
    "modi",
    "new delhi",
  ],

  USA: [
    "united states",
    "u.s.",
    "us economy",
    "america",
    "american",
    "federal reserve",
    "fed",
    "wall street",
    "s&p",
    "nasdaq",
    "dollar",
    "washington",
  ],

  CHN: [
    "china",
    "chinese",
    "beijing",
    "pboc",
    "yuan",
    "renminbi",
    "shanghai",
    "hong kong",
  ],

  JPN: [
    "japan",
    "japanese",
    "tokyo",
    "bank of japan",
    "boj",
    "yen",
    "nikkei",
  ],

  DEU: [
    "germany",
    "german",
    "berlin",
    "dax",
  ],

  FRA: [
    "france",
    "french",
    "paris",
    "cac 40",
  ],

  ITA: [
    "italy",
    "italian",
    "rome",
  ],

  ESP: [
    "spain",
    "spanish",
    "madrid",
  ],

  GBR: [
    "united kingdom",
    "uk",
    "britain",
    "british",
    "england",
    "bank of england",
    "boe",
    "pound",
    "sterling",
    "london",
    "ftse",
  ],

  CAN: [
    "canada",
    "canadian",
    "bank of canada",
    "ottawa",
    "toronto",
  ],

  AUS: [
    "australia",
    "australian",
    "reserve bank of australia",
    "rba",
    "sydney",
  ],

  BRA: [
    "brazil",
    "brazilian",
    "brasil",
    "selic",
    "brasilia",
  ],

  KOR: [
    "south korea",
    "korea",
    "korean",
    "seoul",
    "bank of korea",
  ],

  CHE: [
    "switzerland",
    "swiss",
    "snb",
    "zurich",
  ],

  MEX: [
    "mexico",
    "mexican",
    "banxico",
    "mexico city",
  ],

  IDN: [
    "indonesia",
    "indonesian",
    "bank indonesia",
    "jakarta",
  ],

  ZAF: [
    "south africa",
    "south african",
    "sarb",
    "johannesburg",
    "pretoria",
  ],

  SAU: [
    "saudi arabia",
    "saudi",
    "riyadh",
    "sama",
    "aramco",
  ],

  ARE: [
    "united arab emirates",
    "uae",
    "dubai",
    "abu dhabi",
    "cbuae",
  ],
};

// =====================================================
// NORMALIZE TEXT
// =====================================================

function normalizeText(
  value
) {
  return String(
    value || ""
  )
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

// =====================================================
// ARTICLE TEXT
// =====================================================

function getArticleText(
  article
) {
  return normalizeText(
    `${article?.title || ""} ${article?.summary || ""}`
  );
}

// =====================================================
// DATE TO TIMESTAMP
// =====================================================

function getTimestamp(
  article
) {
  const raw =
    article?.publishedAt;

  if (!raw) {
    return 0;
  }

  const timestamp =
    new Date(
      raw
    ).getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return 0;
  }

  return timestamp;
}

// =====================================================
// MATCH COUNTRY
// =====================================================

function matchesCountry(
  article,
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  const keywords =
    COUNTRY_KEYWORDS[
      code
    ];

  if (!keywords) {
    return false;
  }

  const text =
    getArticleText(
      article
    );

  return keywords.some(
    (keyword) =>
      text.includes(
        normalizeText(
          keyword
        )
      )
  );
}

// =====================================================
// REMOVE DUPLICATES
// =====================================================

function removeDuplicates(
  articles
) {
  const seen =
    new Set();

  return articles.filter(
    (article) => {
      const key =
        normalizeText(
          article?.url ||
            article?.title ||
            ""
        );

      if (!key) {
        return false;
      }

      if (
        seen.has(
          key
        )
      ) {
        return false;
      }

      seen.add(
        key
      );

      return true;
    }
  );
}

// =====================================================
// GET ALL ARTICLES FROM EXISTING NEWS ENGINE
// =====================================================

function flattenNews(
  data
) {
  const articles = [
    ...(data?.categories
      ?.markets || []),

    ...(data?.categories
      ?.geopolitics || []),

    ...(data?.categories
      ?.india || []),

    ...(data?.categories
      ?.energy || []),

    ...(data?.impact
      ?.high || []),

    ...(data?.impact
      ?.medium || []),

    ...(data?.impact
      ?.low || []),
  ];

  return removeDuplicates(
    articles
  );
}

// =====================================================
// FRESHNESS
// =====================================================

function getFreshness(
  publishedAt
) {
  if (!publishedAt) {
    return {
      ageHours:
        null,

      freshness:
        "UNKNOWN",
    };
  }

  const timestamp =
    new Date(
      publishedAt
    ).getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return {
      ageHours:
        null,

      freshness:
        "UNKNOWN",
    };
  }

  const ageMs =
    Date.now() -
    timestamp;

  const ageHours =
    ageMs /
    (
      1000 *
      60 *
      60
    );

  let freshness =
    "OLD";

  if (
    ageHours <= 6
  ) {
    freshness =
      "BREAKING";
  } else if (
    ageHours <= 24
  ) {
    freshness =
      "FRESH";
  } else if (
    ageHours <= 72
  ) {
    freshness =
      "RECENT";
  }

  return {
    ageHours:
      Number(
        ageHours.toFixed(
          1
        )
      ),

    freshness,
  };
}

// =====================================================
// MAP ARTICLE
// =====================================================

function mapArticle(
  article
) {
  const freshness =
    getFreshness(
      article?.publishedAt
    );

  return {
    title:
      article?.title ||
      "Untitled",

    summary:
      article?.summary ||
      "",

    url:
      article?.url ||
      "",

    source:
      article?.source ||
      "Unknown",

    publishedAt:
      article?.publishedAt ||
      null,

    ageHours:
      freshness.ageHours,

    freshness:
      freshness.freshness,

    impact:
      article
        ?.intelligence
        ?.impact ||
      "LOW",

    categories:
      article
        ?.intelligence
        ?.categories ||
      [],

    marketBias:
      article
        ?.marketImpact
        ?.marketBias ||
      "NEUTRAL",

    marketImpact:
      article
        ?.marketImpact ||
      null,
  };
}

// =====================================================
// BUILD CURRENT ISSUES
// =====================================================

function buildCurrentIssues(
  articles
) {
  return articles
    .slice(
      0,
      5
    )
    .map(
      (article) =>
        article.title
    );
}

// =====================================================
// NEWS RISK SCORE
// =====================================================

function calculateNewsRisk(
  articles
) {
  if (
    !articles.length
  ) {
    return {
      score:
        0,

      level:
        "LOW",

      highImpactCount:
        0,

      negativeCount:
        0,
    };
  }

  let score =
    0;

  let highImpactCount =
    0;

  let negativeCount =
    0;

  for (
    const article
    of articles
  ) {
    if (
      article.impact ===
      "HIGH"
    ) {
      score += 15;
      highImpactCount++;
    } else if (
      article.impact ===
      "MEDIUM"
    ) {
      score += 7;
    } else {
      score += 2;
    }

    if (
      article.marketBias ===
      "NEGATIVE"
    ) {
      score += 5;
      negativeCount++;
    }

    if (
      article.freshness ===
      "BREAKING"
    ) {
      score += 4;
    } else if (
      article.freshness ===
      "FRESH"
    ) {
      score += 2;
    }
  }

  score =
    Math.min(
      score,
      100
    );

  let level =
    "LOW";

  if (
    score >= 70
  ) {
    level =
      "CRITICAL";
  } else if (
    score >= 50
  ) {
    level =
      "HIGH";
  } else if (
    score >= 25
  ) {
    level =
      "MEDIUM";
  }

  return {
    score,

    level,

    highImpactCount,

    negativeCount,
  };
}

// =====================================================
// MAIN COUNTRY NEWS ENGINE
// =====================================================

export async function getCountryNews(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  const data =
    await getBreakingIntelligence();

  const allArticles =
    flattenNews(
      data
    );

  const matched =
    allArticles
      .filter(
        (article) =>
          matchesCountry(
            article,
            code
          )
      )
      .sort(
        (a, b) =>
          getTimestamp(
            b
          ) -
          getTimestamp(
            a
          )
      )
      .map(
        mapArticle
      );

  const latestArticles =
    matched.slice(
      0,
      10
    );

  const currentIssues =
    buildCurrentIssues(
      latestArticles
    );

  const newsRisk =
    calculateNewsRisk(
      latestArticles
    );

  return {
    countryCode:
      code,

    status:
      latestArticles.length >
      0
        ? "live"
        : "unavailable",

    source:
      "Existing RSS Intelligence Engine",

    fetchedCount:
      latestArticles.length,

    currentIssues,

    articles:
      latestArticles,

    newsRisk,

    newsSourceUpdatedAt:
      data?.updatedAt ||
      null,

    cached:
      Boolean(
        data?.cached
      ),

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// SUPPORT CHECK
// =====================================================

export function hasCountryNewsSupport(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  return Boolean(
    COUNTRY_KEYWORDS[
      code
    ]
  );
}

// =====================================================
// SUPPORTED COUNTRIES
// =====================================================

export function getCountryNewsCountries() {
  return Object.keys(
    COUNTRY_KEYWORDS
  );
}