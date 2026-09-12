import {
  useEffect,
  useState,
} from "react";

import type {
  CountryIntelligence,
} from "../data/countryIntelligence";

import IndicatorExplanation from "./IndicatorExplanation";

// =====================================================
// TYPES
// =====================================================

type TabName =
  | "OVERVIEW"
  | "ECONOMY"
  | "MARKETS"
  | "RISK"
  | "NEWS";

type MacroValue = {
  name: string;
  unit?: string;
  status?: string;
  value: number | null;
  date?: string | null;
  source?: string;
  sourceUrl?: string | null;
  updatedAt?: string;
  series?: string;
  method?: string;
  security?: string | null;
  note?: string | null;
};

type MarketValue = {
  name: string;
  symbol?: string;
  status?: string;
  value: number | null;
  previousClose?: number | null;
  percentChange?: number | null;
  date?: string | null;
  source?: string;
  currency?: string | null;
  exchange?: string | null;
  proxy?: boolean;
};

type CurrencyValue = {
  name: string;
  symbol?: string;
  value: number | null;
  previousClose?: number | null;
  percentChange?: number | null;
  unit?: string;
  date?: string | null;
  source?: string;
  currency?: string | null;
  exchange?: string | null;
  status?: string;
};

type RiskComponent = {
  value: number | null;
  riskScore: number | null;
};

type RiskIntelligence = {
  countryCode: string;
  riskScore: number;

  riskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  marketBias:
    | "POSITIVE"
    | "NEUTRAL"
    | "NEGATIVE";

  confidence:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  availableIndicators: number;
  totalIndicators: number;
  coveragePercent: number;

  reasons: string[];

  components: {
    inflation?: RiskComponent;
    policyRate?: RiskComponent;
    gdpGrowth?: RiskComponent;
    unemployment?: RiskComponent;
    bondYield?: RiskComponent;
    currency?: RiskComponent;
    stockMarket?: RiskComponent;
  };

  updatedAt?: string;
};

type CountryNewsArticle = {
  title: string;
  summary?: string;
  url?: string;
  source?: string;
  publishedAt?: string | null;
  ageHours?: number | null;

  freshness?:
    | "BREAKING"
    | "FRESH"
    | "RECENT"
    | "OLD"
    | "UNKNOWN";

  impact?:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  marketBias?:
    | "POSITIVE"
    | "NEUTRAL"
    | "NEGATIVE";
};

type NewsRisk = {
  score: number;

  level:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  highImpactCount: number;
  negativeCount: number;
};

type CountryNewsData = {
  countryCode: string;
  status: string;
  fetchedCount: number;
  currentIssues: string[];
  articles: CountryNewsArticle[];
  newsRisk?: NewsRisk;
  updatedAt?: string;
  newsSourceUpdatedAt?: string | null;
  cached?: boolean;
};

type OverallRisk = {
  countryCode: string;
  overallRiskScore: number;

  overallRiskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  marketBias:
    | "POSITIVE"
    | "NEUTRAL"
    | "NEGATIVE";

  confidence:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  calculationMethod: string;

  weights: {
    macro: number;
    news: number;
  };

  scores: {
    macro: number | null;
    news: number | null;
  };

  newsBias:
    | "POSITIVE"
    | "NEUTRAL"
    | "NEGATIVE";

  drivers: string[];
  updatedAt?: string;
};

type CountryApiData = {
  country: {
    code: string;
    name: string;
    flag: string;
    currency: string;
    market: string;
    centralBank: string;
    region?: string | null;
    incomeLevel?: string | null;
    capital?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
  };

  status: string;
  liveCount?: number;
  totalCount?: number;

  macro: {
    inflation: MacroValue;
    policyRate: MacroValue;
    gdpGrowth: MacroValue;
    unemployment: MacroValue;
    bondYield?: MacroValue;
    dollarStrength?: MacroValue;
  };

  currencyMarket?: {
    usdInr?: CurrencyValue;
    usdJpy?: CurrencyValue;
    primary?: CurrencyValue;
  };

  markets?: {
    nifty50?: MarketValue;
    sp500Proxy?: MarketValue;
    dax?: MarketValue;
    nikkei225?: MarketValue;
    primary?: MarketValue;
  };

  riskIntelligence?: RiskIntelligence;
  overallRisk?: OverallRisk;
  countryNews?: CountryNewsData;
  currentIssues?: string[];
  newsStatus?: string;
  newsRisk?: NewsRisk;
  advancedMarketStatus?: string;
  ratesStatus?: string;
  updatedAt: string;
};

type Props = {
  country:
    | CountryIntelligence
    | null;

  onClose: () => void;
};

// =====================================================
// COMPONENT
// =====================================================

function CountryIntelligencePanel({
  country,
  onClose,
}: Props) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TabName>(
      "OVERVIEW"
    );

  const [
    countryApiData,
    setCountryApiData,
  ] =
    useState<CountryApiData | null>(
      null
    );

  const [
    countryLoading,
    setCountryLoading,
  ] =
    useState(false);

  const [
    countryError,
    setCountryError,
  ] =
    useState("");

  // ===================================================
  // LOAD COUNTRY
  // ===================================================

  useEffect(() => {
    setActiveTab(
      "OVERVIEW"
    );

    if (!country) {
      setCountryApiData(
        null
      );

      setCountryError("");

      return;
    }

    const loadCountryData =
      async () => {
        try {
          setCountryLoading(
            true
          );

          setCountryError("");

          setCountryApiData(
            null
          );

          const response =
            await fetch(
              `/api/country/${country.code}`
            );

          if (!response.ok) {
            throw new Error(
              `Country API HTTP ${response.status}`
            );
          }

          const data:
            CountryApiData =
            await response.json();

          setCountryApiData(
            data
          );
        } catch (error) {
          console.error(
            "COUNTRY PANEL ERROR:",
            error
          );

          setCountryError(
            "Country intelligence unavailable"
          );

          setCountryApiData(
            null
          );
        } finally {
          setCountryLoading(
            false
          );
        }
      };

    loadCountryData();
  }, [country]);

  // ===================================================
  // EMPTY STATE
  // ===================================================

  if (!country) {
    return (
      <div className="card country-intelligence-card">
        <div className="card-heading">
          <h3>
            🌍 Country Intelligence
          </h3>

          <span>
            SELECT COUNTRY
          </span>
        </div>

        <div className="country-empty-state">
          <div className="country-empty-icon">
            ◎
          </div>

          <strong>
            Select a country
          </strong>

          <p>
            Map par kisi country ko
            select karo.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // RESOLVED DATA
  // ===================================================

  const risk =
    countryApiData
      ?.riskIntelligence;

  const overallRisk =
    countryApiData
      ?.overallRisk;

  const resolvedRiskLevel =
    overallRisk
      ?.overallRiskLevel ||
    risk?.riskLevel ||
    country.risk;

  const resolvedMarketBias =
    overallRisk
      ?.marketBias ||
    risk?.marketBias ||
    country.marketBias;

  const riskClass =
    resolvedRiskLevel ===
      "HIGH" ||
    resolvedRiskLevel ===
      "CRITICAL"
      ? "negative"
      : resolvedRiskLevel ===
          "MEDIUM"
        ? "warning"
        : "positive";

  const biasClass =
    resolvedMarketBias.includes(
      "NEGATIVE"
    )
      ? "negative"
      : resolvedMarketBias.includes(
            "POSITIVE"
          )
        ? "positive"
        : "warning";

  const liveNews =
    countryApiData
      ?.countryNews;

  const newsRisk =
    countryApiData
      ?.newsRisk ||
    liveNews?.newsRisk;

  const liveCurrentIssues =
    countryApiData
      ?.currentIssues;

  const resolvedCurrentIssues:
    string[] =
    liveCurrentIssues &&
    liveCurrentIssues.length > 0
      ? liveCurrentIssues
      : country.currentIssues;

  const newsRiskClass =
    newsRisk?.level ===
      "HIGH" ||
    newsRisk?.level ===
      "CRITICAL"
      ? "negative"
      : newsRisk?.level ===
          "MEDIUM"
        ? "warning"
        : "positive";

  // ===================================================
  // HELPERS
  // ===================================================

  const showMacroValue = (
    item?: MacroValue,
    decimals = 2
  ) => {
    if (countryLoading) {
      return "Loading...";
    }

    if (
      !item ||
      item.value === null ||
      item.value === undefined
    ) {
      return "Unavailable";
    }

    return `${item.value.toFixed(
      decimals
    )}${item.unit || ""}`;
  };

  const showMacroSource = (
    item?: MacroValue
  ) => {
    if (!item) {
      return "";
    }

    const parts: string[] =
      [];

    if (item.source) {
      parts.push(
        item.source
      );
    }

    if (item.date) {
      parts.push(
        item.date
      );
    }

    return parts.join(
      " • "
    );
  };

  const showMarketSource = (
    item?: MarketValue
  ) => {
    if (!item) {
      return "";
    }

    return [
      item.source,
      item.date,
    ]
      .filter(Boolean)
      .join(" • ");
  };

  const showCurrencySource = (
    item?: CurrencyValue
  ) => {
    if (!item) {
      return "";
    }

    return [
      item.source,
      item.date,
    ]
      .filter(Boolean)
      .join(" • ");
  };

  const showMarketChange = (
    item?: MarketValue
  ) => {
    if (
      item?.percentChange ===
        null ||
      item?.percentChange ===
        undefined
    ) {
      return "";
    }

    const sign =
      item.percentChange >= 0
        ? "+"
        : "";

    return ` (${sign}${item.percentChange.toFixed(
      2
    )}%)`;
  };

  const showCurrencyChange = (
    item?: CurrencyValue
  ) => {
    if (
      item?.percentChange ===
        null ||
      item?.percentChange ===
        undefined
    ) {
      return "";
    }

    const sign =
      item.percentChange >= 0
        ? "+"
        : "";

    return ` (${sign}${item.percentChange.toFixed(
      2
    )}%)`;
  };

  // ===================================================
  // MARKET RESOLUTION
  // ===================================================

  const resolvedMarket:
    | MarketValue
    | undefined =
    country.code === "IND"
      ? countryApiData
          ?.markets
          ?.nifty50
      : country.code === "USA"
        ? countryApiData
            ?.markets
            ?.sp500Proxy
        : country.code === "DEU"
          ? countryApiData
              ?.markets
              ?.dax
          : country.code === "JPN"
            ? countryApiData
                ?.markets
                ?.nikkei225
            : countryApiData
                ?.markets
                ?.primary;

  const resolvedCurrency:
    | CurrencyValue
    | undefined =
    country.code === "IND"
      ? countryApiData
          ?.currencyMarket
          ?.usdInr
      : country.code === "JPN"
        ? countryApiData
            ?.currencyMarket
            ?.usdJpy
        : countryApiData
            ?.currencyMarket
            ?.primary;

  const marketChangeClass =
    resolvedMarket
      ?.percentChange ===
      undefined ||
    resolvedMarket
      ?.percentChange ===
      null
      ? ""
      : resolvedMarket
            .percentChange >
          0
        ? "positive"
        : resolvedMarket
              .percentChange <
            0
          ? "negative"
          : "warning";

  // ===================================================
  // COMMON ROW
  // ===================================================

  const MacroRow = ({
    indicatorKey,
    label,
    item,
    decimals = 2,
    className = "",
  }: {
    indicatorKey:
      | "inflation"
      | "policyRate"
      | "gdpGrowth"
      | "unemployment"
      | "bondYield";

    label: string;

    item?: MacroValue;

    decimals?: number;

    className?: string;
  }) => (
    <div className="data-row">
      <span>
        <IndicatorExplanation
          indicatorKey={
            indicatorKey
          }
          label={label}
        />

        <small className="market-source">
          {showMacroSource(
            item
          )}
        </small>
      </span>

      <strong
        className={
          className
        }
      >
        {showMacroValue(
          item,
          decimals
        )}
      </strong>
    </div>
  );

  // ===================================================
  // TABS
  // ===================================================

  const tabs: TabName[] = [
    "OVERVIEW",
    "ECONOMY",
    "MARKETS",
    "RISK",
    "NEWS",
  ];

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="card country-intelligence-card">

      {/* HEADER */}

      <div className="country-panel-header">
        <div>
          <div className="country-panel-title">
            <span className="country-flag">
              {countryApiData
                ?.country
                ?.flag ||
                country.flag}
            </span>

            <div>
              <h3>
                {countryApiData
                  ?.country
                  ?.name ||
                  country.name}
              </h3>

              <span>
                COUNTRY INTELLIGENCE
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="country-close-button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* STATUS */}

      <div className="country-live-status">
        <span
          className={
            countryError
              ? "country-status-dot error"
              : countryLoading
                ? "country-status-dot loading"
                : "country-status-dot"
          }
        />

        <span>
          {countryLoading
            ? "CONNECTING"
            : countryError
              ? "DATA ERROR"
              : "LIVE INTELLIGENCE"}
        </span>

        {countryApiData
          ?.liveCount !==
          undefined &&
          countryApiData
            ?.totalCount !==
          undefined && (
          <strong>
            {
              countryApiData
                .liveCount
            }
            /
            {
              countryApiData
                .totalCount
            }
          </strong>
        )}
      </div>

      {/* TABS */}

      <div className="country-tabs">
        {tabs.map(
          (tab) => (
            <button
              key={tab}
              type="button"
              className={
                activeTab === tab
                  ? "country-tab active"
                  : "country-tab"
              }
              onClick={() =>
                setActiveTab(
                  tab
                )
              }
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* ================================================= */}
      {/* OVERVIEW */}
      {/* ================================================= */}

      {activeTab ===
        "OVERVIEW" && (
        <div className="country-tab-content">

          <div className="country-score-grid">
            <div className="country-score-box">
              <span>
                RISK
              </span>

              <strong
                className={
                  riskClass
                }
              >
                {overallRisk
                  ?.overallRiskScore
                  ?.toFixed(0) ||
                  risk
                    ?.riskScore
                    ?.toFixed(0) ||
                  "--"}
              </strong>

              <small
                className={
                  riskClass
                }
              >
                {
                  resolvedRiskLevel
                }
              </small>
            </div>

            <div className="country-score-box">
              <span>
                BIAS
              </span>

              <strong
                className={
                  biasClass
                }
              >
                {
                  resolvedMarketBias
                }
              </strong>

              <small>
                MARKET
              </small>
            </div>
          </div>

          <div className="data-row">
            <span>
              Capital
            </span>

            <strong>
              {countryApiData
                ?.country
                ?.capital ||
                "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>
              Region
            </span>

            <strong>
              {countryApiData
                ?.country
                ?.region ||
                "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>
              Currency
            </span>

            <strong>
              {countryApiData
                ?.country
                ?.currency ||
                country.currency}
            </strong>
          </div>

          <div className="data-row">
            <span>
              Central Bank
            </span>

            <strong>
              {countryApiData
                ?.country
                ?.centralBank ||
                "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>
              Data Coverage
            </span>

            <strong>
              {risk
                ? `${risk.coveragePercent.toFixed(
                    0
                  )}%`
                : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>
              Confidence
            </span>

            <strong>
              {overallRisk
                ?.confidence ||
                risk
                  ?.confidence ||
                "Unavailable"}
            </strong>
          </div>

          <div className="reason-box">
            <strong>
              Intelligence Snapshot
            </strong>

            <p>
              Risk:{" "}
              <b
                className={
                  riskClass
                }
              >
                {
                  resolvedRiskLevel
                }
              </b>
            </p>

            <p>
              Market bias:{" "}
              <b
                className={
                  biasClass
                }
              >
                {
                  resolvedMarketBias
                }
              </b>
            </p>

            <p>
              Current issues:{" "}
              {
                resolvedCurrentIssues.length
              }
            </p>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* ECONOMY */}
      {/* ================================================= */}

      {activeTab ===
        "ECONOMY" && (
        <div className="country-tab-content">

          <MacroRow
            indicatorKey="inflation"
            label="Inflation"
            item={
              countryApiData
                ?.macro
                ?.inflation
            }
          />

          <MacroRow
            indicatorKey="policyRate"
            label="Policy Rate"
            item={
              countryApiData
                ?.macro
                ?.policyRate
            }
            decimals={3}
            className="warning"
          />

          {countryApiData
            ?.macro
            ?.policyRate
            ?.note && (
            <div className="country-note">
              ⚠{" "}
              {
                countryApiData
                  .macro
                  .policyRate
                  .note
              }
            </div>
          )}

          <MacroRow
            indicatorKey="gdpGrowth"
            label="GDP Growth"
            item={
              countryApiData
                ?.macro
                ?.gdpGrowth
            }
          />

          {countryApiData
            ?.macro
            ?.gdpGrowth
            ?.method && (
            <div className="country-note">
              GDP method:{" "}
              {
                countryApiData
                  .macro
                  .gdpGrowth
                  .method
              }
            </div>
          )}

          <MacroRow
            indicatorKey="unemployment"
            label="Unemployment"
            item={
              countryApiData
                ?.macro
                ?.unemployment
            }
          />

          <MacroRow
            indicatorKey="bondYield"
            label="Bond Yield"
            item={
              countryApiData
                ?.macro
                ?.bondYield
            }
            decimals={
              country.code ===
              "IND"
                ? 4
                : 2
            }
            className="warning"
          />

          <div className="data-row">
            <span>
              Central Bank
            </span>

            <strong>
              {countryApiData
                ?.country
                ?.centralBank ||
                "Unavailable"}
            </strong>
          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* MARKETS */}
      {/* ================================================= */}

      {activeTab ===
        "MARKETS" && (
        <div className="country-tab-content">

          <div className="data-row">
            <span>
              <IndicatorExplanation
                indicatorKey="stockMarket"
                label="Stock Market"
              />

              <small className="market-source">
                {showMarketSource(
                  resolvedMarket
                )}
              </small>
            </span>

            <strong
              className={
                marketChangeClass
              }
            >
              {countryLoading
                ? "Loading..."
                : resolvedMarket
                      ?.value !==
                      null &&
                    resolvedMarket
                      ?.value !==
                      undefined
                  ? `${resolvedMarket.name} ${resolvedMarket.value.toFixed(
                      2
                    )}${showMarketChange(
                      resolvedMarket
                    )}`
                  : countryApiData
                      ?.country
                      ?.market ||
                    country.market ||
                    "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>
              <IndicatorExplanation
                indicatorKey="currency"
                label="Currency"
              />

              <small className="market-source">
                {country.code ===
                  "USA"
                  ? showMacroSource(
                      countryApiData
                        ?.macro
                        ?.dollarStrength
                    )
                  : showCurrencySource(
                      resolvedCurrency
                    )}
              </small>
            </span>

            <strong>
              {countryLoading
                ? "Loading..."
                : country.code ===
                    "USA"
                  ? countryApiData
                        ?.macro
                        ?.dollarStrength
                        ?.value !==
                        null &&
                    countryApiData
                        ?.macro
                        ?.dollarStrength
                        ?.value !==
                        undefined
                    ? `USD Index ${countryApiData.macro.dollarStrength.value.toFixed(
                        4
                      )}`
                    : "USD"
                  : resolvedCurrency
                        ?.value !==
                        null &&
                      resolvedCurrency
                        ?.value !==
                        undefined
                    ? `${resolvedCurrency.name} ${resolvedCurrency.value.toFixed(
                        4
                      )}${showCurrencyChange(
                        resolvedCurrency
                      )}`
                    : countryApiData
                        ?.country
                        ?.currency ||
                      country.currency ||
                      "Unavailable"}
            </strong>
          </div>

          <MacroRow
            indicatorKey="bondYield"
            label="10Y Bond Yield"
            item={
              countryApiData
                ?.macro
                ?.bondYield
            }
            decimals={
              country.code ===
              "IND"
                ? 4
                : 2
            }
            className="warning"
          />

          <div className="data-row">
            <span>
              <IndicatorExplanation
                indicatorKey="energyRisk"
                label="Energy Risk"
              />
            </span>

            <strong className="warning">
              {
                country.energyRisk
              }
            </strong>
          </div>

          <div className="data-row">
            <span>
              Market Bias
            </span>

            <strong
              className={
                biasClass
              }
            >
              {
                resolvedMarketBias
              }
            </strong>
          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* RISK */}
      {/* ================================================= */}

      {activeTab ===
        "RISK" && (
        <div className="country-tab-content">

          <div className="country-risk-hero">
            <span>
              OVERALL RISK
            </span>

            <strong
              className={
                riskClass
              }
            >
              {overallRisk
                ? overallRisk
                    .overallRiskScore
                    .toFixed(1)
                : risk
                  ? risk.riskScore.toFixed(
                      1
                    )
                  : "--"}
            </strong>

            <small
              className={
                riskClass
              }
            >
              {
                resolvedRiskLevel
              }
            </small>
          </div>

          {overallRisk && (
            <>
              <div className="data-row">
                <span>
                  Macro Risk
                </span>

                <strong>
                  {overallRisk
                    .scores
                    .macro !== null
                    ? `${overallRisk.scores.macro.toFixed(
                        1
                      )} / 100`
                    : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>
                  News Risk
                </span>

                <strong>
                  {overallRisk
                    .scores
                    .news !== null
                    ? `${overallRisk.scores.news.toFixed(
                        1
                      )} / 100`
                    : "Unavailable"}
                </strong>
              </div>

              <div className="data-row">
                <span>
                  Model
                </span>

                <strong>
                  {
                    overallRisk
                      .calculationMethod
                  }
                </strong>
              </div>

              <div className="data-row">
                <span>
                  Confidence
                </span>

                <strong>
                  {
                    overallRisk
                      .confidence
                  }
                </strong>
              </div>
            </>
          )}

          {risk && (
            <>
              <div className="data-row">
                <span>
                  Data Coverage
                </span>

                <strong>
                  {risk.coveragePercent.toFixed(
                    0
                  )}
                  %
                </strong>
              </div>

              <div className="data-row">
                <span>
                  Indicators
                </span>

                <strong>
                  {
                    risk.availableIndicators
                  }
                  /
                  {
                    risk.totalIndicators
                  }
                </strong>
              </div>
            </>
          )}

          {(overallRisk
            ?.drivers
            ?.length ||
            risk?.reasons
              ?.length) && (
            <div className="reason-box">
              <strong>
                Risk Drivers
              </strong>

              {(
                overallRisk
                  ?.drivers ||
                risk?.reasons ||
                []
              ).map(
                (
                  driver,
                  index
                ) => (
                  <p
                    key={`${driver}-${index}`}
                  >
                    • {driver}
                  </p>
                )
              )}
            </div>
          )}

        </div>
      )}

      {/* ================================================= */}
      {/* NEWS */}
      {/* ================================================= */}

      {activeTab ===
        "NEWS" && (
        <div className="country-tab-content">

          {newsRisk && (
            <div className="country-news-summary">
              <div>
                <span>
                  NEWS RISK
                </span>

                <strong
                  className={
                    newsRiskClass
                  }
                >
                  {
                    newsRisk.level
                  }
                </strong>
              </div>

              <div>
                <span>
                  SCORE
                </span>

                <strong
                  className={
                    newsRiskClass
                  }
                >
                  {
                    newsRisk.score
                  }
                </strong>
              </div>

              <div>
                <span>
                  LIVE
                </span>

                <strong>
                  {liveNews
                    ?.fetchedCount ||
                    0}
                </strong>
              </div>
            </div>
          )}

          {countryLoading ? (
            <div className="country-news-empty">
              Loading latest
              intelligence...
            </div>
          ) : resolvedCurrentIssues.length >
            0 ? (
            <div className="country-news-list">
              {resolvedCurrentIssues.map(
                (
                  issue,
                  index
                ) => {
                  const article =
                    liveNews
                      ?.articles
                      ?.find(
                        (
                          item
                        ) =>
                          item.title ===
                          issue
                      ) ||
                    liveNews
                      ?.articles
                      ?.[index];

                  return (
                    <div
                      className="country-news-item"
                      key={`${issue}-${index}`}
                    >
                      <div className="country-news-top">
                        <span
                          className={`country-impact ${
                            article
                              ?.impact
                              ?.toLowerCase() ||
                            "low"
                          }`}
                        >
                          {article
                            ?.impact ||
                            "INFO"}
                        </span>

                        <span className="country-news-age">
                          {article
                            ?.freshness ||
                            "CURRENT"}

                          {article
                              ?.ageHours !==
                              null &&
                            article
                              ?.ageHours !==
                              undefined
                            ? ` • ${article.ageHours}h`
                            : ""}
                        </span>
                      </div>

                      <p>
                        {issue}
                      </p>

                      {article
                        ?.summary && (
                        <small>
                          {
                            article.summary
                          }
                        </small>
                      )}

                      {article
                        ?.source && (
                        <div className="market-source">
                          {
                            article.source
                          }
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="country-news-empty">
              No current issues
              available.
            </div>
          )}

          {liveNews?.updatedAt && (
            <div className="country-last-update">
              Updated{" "}
              {new Date(
                liveNews.updatedAt
              ).toLocaleString()}
            </div>
          )}

        </div>
      )}

      {/* FOOTER */}

      {countryApiData
        ?.updatedAt && (
        <div className="country-panel-footer">
          DATA UPDATED{" "}
          {new Date(
            countryApiData.updatedAt
          ).toLocaleTimeString()}
        </div>
      )}

    </div>
  );
}

export default CountryIntelligencePanel;