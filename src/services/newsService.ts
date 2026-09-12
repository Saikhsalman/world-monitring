export type NewsIntelligence = {
  score: number;
  impact: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
  categories: string[];
};

export type NewsMarketImpact = {
  marketBias: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  signals: string[];
  reasons: string[];

  score?: {
    positive: number;
    negative: number;
  };
};

export type NewsArticle = {
  title: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  summary: string;

  intelligence?: NewsIntelligence;

  marketImpact?: NewsMarketImpact;
};

export type BreakingNewsData = {
  source: string;
  status: string;
  fetchedCount: number;
  updatedAt: string;
  cached: boolean;

  categories: {
    markets: NewsArticle[];
    geopolitics: NewsArticle[];
    india: NewsArticle[];
    energy: NewsArticle[];
  };

  impact: {
    high: NewsArticle[];
    medium: NewsArticle[];
    low: NewsArticle[];
  };

  marketImpact: {
    positive: NewsArticle[];
    negative: NewsArticle[];
    neutral: NewsArticle[];
  };
};

export async function getBreakingNews(): Promise<BreakingNewsData> {
  const response = await fetch(
    "/api/news/breaking"
  );

  if (!response.ok) {
    throw new Error(
      `Breaking News HTTP ${response.status}`
    );
  }

  const data: BreakingNewsData =
    await response.json();

  return data;
}