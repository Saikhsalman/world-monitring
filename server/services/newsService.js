 import Parser from "rss-parser";

import {
  enrichArticles,
} from "./newsIntelligenceService.js";

import {
  addMarketImpactToArticles,
} from "./newsMarketImpactService.js";

const parser =
  new Parser({
    timeout:
      12000,

    headers: {
      "User-Agent":
        "WorldMonitor/1.0",
    },
  });

// =====================================================
// GLOBAL RSS SOURCES
// =====================================================

const RSS_SOURCES = [
  {
    name:
      "BBC World",

    url:
      "https://feeds.bbci.co.uk/news/world/rss.xml",

    category:
      "geopolitics",
  },

  {
    name:
      "BBC Business",

    url:
      "https://feeds.bbci.co.uk/news/business/rss.xml",

    category:
      "markets",
  },

  // ===================================================
  // GOOGLE NEWS GLOBAL SEARCH FEEDS
  // Multiple publishers / wider country coverage
  // ===================================================

  {
    name:
      "Google News Global Economy",

    url:
      "https://news.google.com/rss/search?q=global+economy+markets+central+bank&hl=en-US&gl=US&ceid=US:en",

    category:
      "markets",
  },

  {
    name:
      "Google News Geopolitics",

    url:
      "https://news.google.com/rss/search?q=geopolitics+war+sanctions+trade+tariffs&hl=en-US&gl=US&ceid=US:en",

    category:
      "geopolitics",
  },

  {
    name:
      "Google News Energy",

    url:
      "https://news.google.com/rss/search?q=oil+crude+OPEC+natural+gas+energy&hl=en-US&gl=US&ceid=US:en",

    category:
      "energy",
  },

  {
    name:
      "Google News China",

    url:
      "https://news.google.com/rss/search?q=China+economy+PBOC+yuan+markets&hl=en-US&gl=US&ceid=US:en",

    category:
      "markets",
  },

  {
    name:
      "Google News India",

    url:
      "https://news.google.com/rss/search?q=India+economy+RBI+rupee+Nifty&hl=en-US&gl=US&ceid=US:en",

    category:
      "markets",
  },

  {
    name:
      "Google News USA",

    url:
      "https://news.google.com/rss/search?q=US+economy+Federal+Reserve+inflation+markets&hl=en-US&gl=US&ceid=US:en",

    category:
      "markets",
  },

  {
    name:
      "Google News Europe",

    url:
      "https://news.google.com/rss/search?q=Europe+ECB+economy+markets&hl=en-US&gl=US&ceid=US:en",

    category:
      "markets",
  },

  {
    name:
      "Google News Japan",

    url:
      "https://news.google.com/rss/search?q=Japan+economy+Bank+of+Japan+yen+Nikkei&hl=en-US&gl=US&ceid=US:en",

    category:
      "markets",
  },
];

// =====================================================
// SIMPLE MEMORY CACHE
// =====================================================

let newsCache =
  null;

let cacheTime =
  0;

// 2 minutes
const CACHE_DURATION =
  2 * 60 * 1000;

// =====================================================
// FETCH ONE RSS FEED
// =====================================================

async function fetchFeed(
  source
) {
  try {
    const feed =
      await parser.parseURL(
        source.url
      );

    return (
      feed.items ||
      []
    )
      .slice(
        0,
        30
      )
      .map(
        (item) => ({
          title:
            item.title ||
            "Untitled",

          url:
            item.link ||
            "",

          source:
            source.name,

          category:
            source.category,

          publishedAt:
            item.isoDate ||
            item.pubDate ||
            "",

          summary:
            item.contentSnippet ||
            item.content ||
            item.summary ||
            "",
        })
      );
  } catch (error) {
    console.error(
      `RSS ${source.name} ERROR:`,
      error.message
    );

    return [];
  }
}

// =====================================================
// NORMALIZE
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
          article.url ||
            article.title
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
// SORT LATEST FIRST
// =====================================================

function sortLatestFirst(
  articles
) {
  return [
    ...articles,
  ].sort(
    (a, b) => {
      const aTime =
        new Date(
          a.publishedAt ||
            0
        ).getTime();

      const bTime =
        new Date(
          b.publishedAt ||
            0
        ).getTime();

      return (
        bTime -
        aTime
      );
    }
  );
}

// =====================================================
// BREAKING INTELLIGENCE
// =====================================================

export async function getBreakingIntelligence() {
  const now =
    Date.now();

  if (
    newsCache &&
    now - cacheTime <
      CACHE_DURATION
  ) {
    return {
      ...newsCache,

      cached:
        true,
    };
  }

  // ===================================================
  // FETCH ALL SOURCES IN PARALLEL
  // ===================================================

  const results =
    await Promise.all(
      RSS_SOURCES.map(
        fetchFeed
      )
    );

  // ===================================================
  // MERGE + DEDUP + SORT
  // ===================================================

  const rawArticles =
    sortLatestFirst(
      removeDuplicates(
        results.flat()
      )
    );

  // ===================================================
  // INTELLIGENCE ENGINE
  // ===================================================

  const intelligenceArticles =
    enrichArticles(
      rawArticles
    );

  // ===================================================
  // MARKET IMPACT ENGINE
  // ===================================================

  const enrichedArticles =
    addMarketImpactToArticles(
      intelligenceArticles
    );

  // Sort again after enrichment
  const articles =
    sortLatestFirst(
      enrichedArticles
    );

  // ===================================================
  // CATEGORY FILTERS
  // ===================================================

  const markets =
    articles
      .filter(
        (article) =>
          article
            ?.intelligence
            ?.categories
            ?.includes(
              "MARKETS"
            )
      )
      .slice(
        0,
        30
      );

  const geopolitics =
    articles
      .filter(
        (article) =>
          article
            ?.intelligence
            ?.categories
            ?.includes(
              "GEOPOLITICS"
            )
      )
      .slice(
        0,
        30
      );

  const india =
    articles
      .filter(
        (article) =>
          article
            ?.intelligence
            ?.categories
            ?.includes(
              "INDIA"
            )
      )
      .slice(
        0,
        30
      );

  const energy =
    articles
      .filter(
        (article) =>
          article
            ?.intelligence
            ?.categories
            ?.includes(
              "ENERGY"
            )
      )
      .slice(
        0,
        30
      );

  // ===================================================
  // IMPACT FILTERS
  // ===================================================

  const highImpact =
    articles
      .filter(
        (article) =>
          article
            ?.intelligence
            ?.impact ===
          "HIGH"
      )
      .slice(
        0,
        30
      );

  const mediumImpact =
    articles
      .filter(
        (article) =>
          article
            ?.intelligence
            ?.impact ===
          "MEDIUM"
      )
      .slice(
        0,
        30
      );

  const lowImpact =
    articles
      .filter(
        (article) =>
          article
            ?.intelligence
            ?.impact ===
          "LOW"
      )
      .slice(
        0,
        30
      );

  // ===================================================
  // MARKET BIAS FILTERS
  // ===================================================

  const positiveMarketImpact =
    articles
      .filter(
        (article) =>
          article
            ?.marketImpact
            ?.marketBias ===
          "POSITIVE"
      )
      .slice(
        0,
        30
      );

  const negativeMarketImpact =
    articles
      .filter(
        (article) =>
          article
            ?.marketImpact
            ?.marketBias ===
          "NEGATIVE"
      )
      .slice(
        0,
        30
      );

  const neutralMarketImpact =
    articles
      .filter(
        (article) =>
          article
            ?.marketImpact
            ?.marketBias ===
          "NEUTRAL"
      )
      .slice(
        0,
        30
      );

  // ===================================================
  // BUILD RESPONSE
  // ===================================================

  newsCache = {
    source:
      "BBC + Google News RSS",

    status:
      articles.length >
      0
        ? "live"
        : "unavailable",

    fetchedCount:
      articles.length,

    updatedAt:
      new Date().toISOString(),

    // IMPORTANT:
    // Full list for country-specific matching
    articles,

    categories: {
      markets,
      geopolitics,
      india,
      energy,
    },

    impact: {
      high:
        highImpact,

      medium:
        mediumImpact,

      low:
        lowImpact,
    },

    marketImpact: {
      positive:
        positiveMarketImpact,

      negative:
        negativeMarketImpact,

      neutral:
        neutralMarketImpact,
    },
  };

  cacheTime =
    now;

  return {
    ...newsCache,

    cached:
      false,
  };
}

// =====================================================
// SEARCH NEWS
// =====================================================

export async function getNewsSearch(
  query
) {
  const data =
    await getBreakingIntelligence();

  const allArticles =
    removeDuplicates(
      data.articles ||
        []
    );

  const search =
    normalizeText(
      query
    );

  if (!search) {
    return allArticles;
  }

  return allArticles.filter(
    (article) =>
      normalizeText(
        `${article.title} ${article.summary}`
      ).includes(
        search
      )
  );
}