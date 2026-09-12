export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type MarketBias =
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL"
  | "NEUTRAL TO POSITIVE"
  | "NEUTRAL TO NEGATIVE";

export type CountryIntelligence = {
  code: string;
  name: string;
  flag: string;

  risk: RiskLevel;

  inflation: string;
  policyRate: string;
  gdpGrowth: string;
  unemployment: string;

  currency: string;
  market: string;
  bondYield: string;

  energyRisk: string;

  currentIssues: string[];

  marketBias: MarketBias;
};

export const countryIntelligence: Record<
  string,
  CountryIntelligence
> = {
  India: {
    code: "IND",
    name: "India",
    flag: "🇮🇳",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "Connecting...",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "INR",
    market: "NIFTY 50",
    bondYield: "Connecting...",

    energyRisk: "HIGH IMPORT DEPENDENCE",

    currentIssues: [
      "Crude oil exposure",
      "RBI policy watch",
      "Foreign capital flows",
      "Global trade and tariff risks",
    ],

    marketBias: "NEUTRAL",
  },

  "United States of America": {
    code: "USA",
    name: "United States",
    flag: "🇺🇸",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "Connecting...",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "USD",
    market: "S&P 500",
    bondYield: "US 10Y",

    energyRisk: "MEDIUM",

    currentIssues: [
      "Federal Reserve policy",
      "Inflation outlook",
      "Employment conditions",
      "Trade and tariff risks",
    ],

    marketBias: "NEUTRAL",
  },

  "United States": {
    code: "USA",
    name: "United States",
    flag: "🇺🇸",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "Connecting...",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "USD",
    market: "S&P 500",
    bondYield: "US 10Y",

    energyRisk: "MEDIUM",

    currentIssues: [
      "Federal Reserve policy",
      "Inflation outlook",
      "Employment conditions",
      "Trade and tariff risks",
    ],

    marketBias: "NEUTRAL",
  },

  China: {
    code: "CHN",
    name: "China",
    flag: "🇨🇳",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "Connecting...",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "CNY",
    market: "Shanghai Composite",
    bondYield: "Connecting...",

    energyRisk: "HIGH IMPORT DEPENDENCE",

    currentIssues: [
      "Property sector",
      "Domestic demand",
      "US-China trade tensions",
      "Export conditions",
    ],

    marketBias: "NEUTRAL",
  },

  Russia: {
    code: "RUS",
    name: "Russia",
    flag: "🇷🇺",
    risk: "HIGH",

    inflation: "Connecting...",
    policyRate: "Connecting...",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "RUB",
    market: "MOEX",
    bondYield: "Connecting...",

    energyRisk: "ENERGY EXPORT DEPENDENT",

    currentIssues: [
      "Ukraine conflict",
      "International sanctions",
      "Energy exports",
      "Currency volatility",
    ],

    marketBias: "NEGATIVE",
  },

  "United Kingdom": {
    code: "GBR",
    name: "United Kingdom",
    flag: "🇬🇧",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "Connecting...",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "GBP",
    market: "FTSE 100",
    bondYield: "UK 10Y",

    energyRisk: "MEDIUM",

    currentIssues: [
      "Bank of England policy",
      "Inflation pressure",
      "Energy prices",
      "Economic growth",
    ],

    marketBias: "NEUTRAL",
  },

  Germany: {
    code: "DEU",
    name: "Germany",
    flag: "🇩🇪",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "ECB",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "EUR",
    market: "DAX",
    bondYield: "Germany 10Y",

    energyRisk: "MEDIUM",

    currentIssues: [
      "Industrial growth",
      "Energy costs",
      "European demand",
      "Export conditions",
    ],

    marketBias: "NEUTRAL",
  },

  France: {
    code: "FRA",
    name: "France",
    flag: "🇫🇷",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "ECB",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "EUR",
    market: "CAC 40",
    bondYield: "France 10Y",

    energyRisk: "LOW TO MEDIUM",

    currentIssues: [
      "Fiscal position",
      "European growth",
      "Political developments",
      "Consumer demand",
    ],

    marketBias: "NEUTRAL",
  },

  Italy: {
    code: "ITA",
    name: "Italy",
    flag: "🇮🇹",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "ECB",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "EUR",
    market: "FTSE MIB",
    bondYield: "Italy 10Y",

    energyRisk: "MEDIUM",

    currentIssues: [
      "Government debt",
      "European growth",
      "Energy dependence",
      "Bond yields",
    ],

    marketBias: "NEUTRAL",
  },

  Spain: {
    code: "ESP",
    name: "Spain",
    flag: "🇪🇸",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "ECB",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "EUR",
    market: "IBEX 35",
    bondYield: "Spain 10Y",

    energyRisk: "MEDIUM",

    currentIssues: [
      "Employment conditions",
      "European growth",
      "Energy prices",
      "Domestic demand",
    ],

    marketBias: "NEUTRAL",
  },

  Japan: {
    code: "JPN",
    name: "Japan",
    flag: "🇯🇵",
    risk: "MEDIUM",

    inflation: "Connecting...",
    policyRate: "Connecting...",
    gdpGrowth: "Connecting...",
    unemployment: "Connecting...",

    currency: "JPY",
    market: "Nikkei 225",
    bondYield: "Japan 10Y",

    energyRisk: "HIGH IMPORT DEPENDENCE",

    currentIssues: [
      "Bank of Japan policy",
      "Yen volatility",
      "Energy imports",
      "Export demand",
    ],

    marketBias: "NEUTRAL",
  },
};

export function getCountryIntelligence(
  countryName: string
): CountryIntelligence | null {
  return countryIntelligence[countryName] || null;
}