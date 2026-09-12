import {
  useCallback,
  useEffect,
  useState,
} from "react";

import "./App.css";

import MapboxWorldMap from "./components/MapboxWorldMap";
import CountryIntelligencePanel from "./components/CountryIntelligencePanel";
import BreakingIntelligenceSection from "./components/BreakingIntelligenceSection";
import GlobalMacroCard from "./components/GlobalMacroCard";
import GlobalMarketsCard from "./components/GlobalMarketsCard";
import PetroleumEnergySection from "./components/PetroleumEnergySection";
import NaturalGasSection from "./components/NaturalGasSection";
import GlobalSearch from "./components/GlobalSearch";
import LiveEventTimeline from "./components/LiveEventTimeline";
import AIIntelligencePanel from "./components/AIIntelligencePanel";
import WhatChangedPanel from "./components/WhatChangedPanel";

import ImpactPanel, {
  type ImpactData,
} from "./components/ImpactPanel";

import {
  getCountryIntelligence,
  type CountryIntelligence,
} from "./data/countryIntelligence";

import {
  getBreakingNews,
  type BreakingNewsData,
} from "./services/newsService";

import {
  getGlobalMarkets,
  type GlobalMarketsData,
} from "./services/marketService";

// =====================================================
// TYPES
// =====================================================

type MacroItem = {
  name: string;
  series: string;
  value: number;
  unit: string;
  date: string;
};

type InflationItem =
  MacroItem & {
    latestCpi?: number;
    previousYearCpi?: number;
  };

type MacroData = {
  source: string;
  us10y: MacroItem;
  fedFunds: MacroItem;
  inflation: InflationItem;
  unemployment: MacroItem;
  dollarIndex: MacroItem;
};

type EnergyItem = {
  name: string;
  series: string;
  value?: number;
  unit?: string;
  date?: string;
  status: string;
  error?: string;
};

type CrudeInventory = {
  name: string;
  series: string;
  status: string;

  latest?: {
    value: number;
    date: string;
  };

  previous?: {
    value: number;
    date: string;
  };

  unit?: string;
  change?: number;
  changeMillionBarrels?: number;
  signal?: string;
  oilBias?: string;
  error?: string;
};

type EnergyData = {
  source: string;

  prices: {
    wti: EnergyItem;
    brent: EnergyItem;
  };

  inventories: {
    crude: CrudeInventory;
    gasoline: EnergyItem;
    distillate: EnergyItem;
  };

  supply: {
    production: EnergyItem;
    imports: EnergyItem;
    exports: EnergyItem;
  };

  refining: {
    utilization: EnergyItem;
  };

  intelligence: {
    energyScore: number;
    energyBias: string;
    indiaOilImpact: string;
    reasons: string[];
  };
};

type GasStorageChange = {
  status: string;

  latest?: {
    value: number;
    date: string;
  };

  previous?: {
    value: number;
    date: string;
  };

  change?: number;
  unit?: string;
  signal?: string;
  error?: string;
};

type NaturalGasData = {
  source: string;

  price: {
    henryHub: EnergyItem;
  };

  storage: {
    current: EnergyItem;
    change: GasStorageChange;
  };

  supply: {
    production: EnergyItem;
  };

  demand: {
    consumption: EnergyItem;
  };

  intelligence: {
    gasScore: number;
    gasBias: string;
    reasons: string[];
  };
};

type InternetRiskData = {
  status?: string;
  source?: string;
  count?: number;

  risk?: {
    score?: number;
    level?: string;
  };

  outages?: unknown[];
};

type GlobalRiskData = {
  status:
    | "live"
    | "partial"
    | "unavailable"
    | string;

  globalRiskScore:
    | number
    | null;

  globalRiskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL"
    | "UNKNOWN";

  bias:
    | "RISK_ON"
    | "NEUTRAL"
    | "RISK_OFF"
    | "STRONG_RISK_OFF"
    | "UNKNOWN";

  components: {
    macro: number | null;
    markets: number | null;
    energy: number | null;
    news: number | null;
    internet: number | null;
  };

  weights: {
    macro: number;
    markets: number;
    energy: number;
    news: number;
    internet: number;
  };

  coverage: {
    availableComponents: number;
    totalComponents: number;
    coveragePercent: number;
  };

  drivers: string[];

  methodology: string;

  updatedAt: string;
};

// =====================================================
// APP
// =====================================================

function App() {
  const [
    selectedCountry,
    setSelectedCountry,
  ] =
    useState<CountryIntelligence | null>(
      null
    );

  const [
    selectedCountryName,
    setSelectedCountryName,
  ] =
    useState("");

  const [
    macro,
    setMacro,
  ] =
    useState<MacroData | null>(
      null
    );

  const [
    macroLoading,
    setMacroLoading,
  ] =
    useState(true);

  const [
    macroError,
    setMacroError,
  ] =
    useState("");

  const [
    energy,
    setEnergy,
  ] =
    useState<EnergyData | null>(
      null
    );

  const [
    energyLoading,
    setEnergyLoading,
  ] =
    useState(true);

  const [
    energyError,
    setEnergyError,
  ] =
    useState("");

  const [
    globalMarkets,
    setGlobalMarkets,
  ] =
    useState<GlobalMarketsData | null>(
      null
    );

  const [
    marketsLoading,
    setMarketsLoading,
  ] =
    useState(true);

  const [
    marketsError,
    setMarketsError,
  ] =
    useState("");

  const [
    breakingNews,
    setBreakingNews,
  ] =
    useState<BreakingNewsData | null>(
      null
    );

  const [
    newsLoading,
    setNewsLoading,
  ] =
    useState(true);

  const [
    newsError,
    setNewsError,
  ] =
    useState("");

  const [
    naturalGas,
    setNaturalGas,
  ] =
    useState<NaturalGasData | null>(
      null
    );

  const [
    gasLoading,
    setGasLoading,
  ] =
    useState(true);

  const [
    gasError,
    setGasError,
  ] =
    useState("");

  const [
    _internetRiskData,
    setInternetRiskData,
  ] =
    useState<InternetRiskData | null>(
      null
    );

  const [
    globalRisk,
    setGlobalRisk,
  ] =
    useState<GlobalRiskData | null>(
      null
    );

  const [
    globalRiskLoading,
    setGlobalRiskLoading,
  ] =
    useState(true);

  const [
    globalRiskError,
    setGlobalRiskError,
  ] =
    useState("");

  const [
    impactData,
    setImpactData,
  ] =
    useState<ImpactData | null>(
      null
    );

  const [
    impactLoading,
    setImpactLoading,
  ] =
    useState(false);

  // ===================================================
  // COUNTRY SELECT
  // ===================================================

  const handleCountrySelect =
    useCallback(
      (
        countryName: string,
        _countryCode: string
      ) => {
        setSelectedCountryName(
          countryName
        );

        const country =
          getCountryIntelligence(
            countryName
          );

        setSelectedCountry(
          country
        );
      },
      []
    );

  const closeCountryPanel =
    useCallback(() => {
      setSelectedCountry(
        null
      );

      setSelectedCountryName(
        ""
      );
    }, []);

  // ===================================================
  // IMPACT
  // ===================================================

  const handleImpactSelect =
    useCallback(
      async (
        eventId: string
      ) => {
        try {
          setImpactLoading(
            true
          );

          const response =
            await fetch(
              `/api/intelligence/impact/${eventId}?t=${Date.now()}`
            );

          if (!response.ok) {
            throw new Error(
              `Impact HTTP ${response.status}`
            );
          }

          const data:
            ImpactData =
            await response.json();

          setImpactData(
            data
          );
        } catch (error) {
          console.error(
            "IMPACT PANEL ERROR:",
            error
          );

          setImpactData(
            null
          );
        } finally {
          setImpactLoading(
            false
          );
        }
      },
      []
    );

  const closeImpactPanel =
    useCallback(() => {
      setImpactData(
        null
      );

      setImpactLoading(
        false
      );
    }, []);

  // ===================================================
  // MACRO
  // ===================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setMacroLoading(
            true
          );

          setMacroError("");

          const response =
            await fetch(
              "/api/fred/macro"
            );

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }

          const data:
            MacroData =
            await response.json();

          setMacro(data);
        } catch (error) {
          console.error(
            "FRED MACRO ERROR:",
            error
          );

          setMacroError(
            "Macro data unavailable"
          );
        } finally {
          setMacroLoading(
            false
          );
        }
      };

    void load();
  }, []);

  // ===================================================
  // ENERGY
  // ===================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setEnergyLoading(
            true
          );

          setEnergyError("");

          const response =
            await fetch(
              "/api/eia/energy"
            );

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }

          const data:
            EnergyData =
            await response.json();

          setEnergy(data);
        } catch (error) {
          console.error(
            "ENERGY ERROR:",
            error
          );

          setEnergyError(
            "Energy data unavailable"
          );
        } finally {
          setEnergyLoading(
            false
          );
        }
      };

    void load();
  }, []);

  // ===================================================
  // MARKETS
  // ===================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setMarketsLoading(
            true
          );

          setMarketsError("");

          const data =
            await getGlobalMarkets();

          setGlobalMarkets(
            data
          );
        } catch (error) {
          console.error(
            "GLOBAL MARKETS ERROR:",
            error
          );

          setMarketsError(
            "Global markets unavailable"
          );
        } finally {
          setMarketsLoading(
            false
          );
        }
      };

    void load();
  }, []);

  // ===================================================
  // NEWS
  // ===================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setNewsLoading(
            true
          );

          setNewsError("");

          const data =
            await getBreakingNews();

          setBreakingNews(
            data
          );
        } catch (error) {
          console.error(
            "BREAKING NEWS ERROR:",
            error
          );

          setNewsError(
            "Breaking news unavailable"
          );
        } finally {
          setNewsLoading(
            false
          );
        }
      };

    void load();
  }, []);

  // ===================================================
  // NATURAL GAS
  // ===================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setGasLoading(
            true
          );

          setGasError("");

          const response =
            await fetch(
              "/api/eia/natural-gas"
            );

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }

          const data:
            NaturalGasData =
            await response.json();

          setNaturalGas(
            data
          );
        } catch (error) {
          console.error(
            "NATURAL GAS ERROR:",
            error
          );

          setGasError(
            "Natural gas data unavailable"
          );
        } finally {
          setGasLoading(
            false
          );
        }
      };

    void load();
  }, []);

  // ===================================================
  // INTERNET RISK
  // ===================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          const response =
            await fetch(
              `/api/internet/outages?t=${Date.now()}`
            );

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }

          const data:
            InternetRiskData =
            await response.json();

          setInternetRiskData(
            data
          );
        } catch (error) {
          console.error(
            "INTERNET RISK LOAD ERROR:",
            error
          );

          setInternetRiskData(
            null
          );
        }
      };

    void load();
  }, []);

  // ===================================================
  // GLOBAL RISK ENGINE
  // ===================================================

  useEffect(() => {
    let cancelled =
      false;

    const calculateRisk =
      async () => {
        try {
          setGlobalRiskLoading(
            true
          );

          setGlobalRiskError("");

          const [
            macroResult,
            marketsResult,
            energyResult,
            newsResult,
            internetResult,
          ] =
            await Promise.allSettled([
              fetch(
                `/api/fred/macro?t=${Date.now()}`
              ).then(
                async (
                  response
                ) => {
                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      `Macro HTTP ${response.status}`
                    );
                  }

                  return response.json();
                }
              ),

              fetch(
                `/api/markets/global?t=${Date.now()}`
              ).then(
                async (
                  response
                ) => {
                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      `Markets HTTP ${response.status}`
                    );
                  }

                  return response.json();
                }
              ),

              fetch(
                `/api/eia/energy?t=${Date.now()}`
              ).then(
                async (
                  response
                ) => {
                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      `Energy HTTP ${response.status}`
                    );
                  }

                  return response.json();
                }
              ),

              fetch(
                `/api/news/breaking?t=${Date.now()}`
              ).then(
                async (
                  response
                ) => {
                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      `News HTTP ${response.status}`
                    );
                  }

                  return response.json();
                }
              ),

              fetch(
                `/api/internet/outages?t=${Date.now()}`
              ).then(
                async (
                  response
                ) => {
                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      `Internet HTTP ${response.status}`
                    );
                  }

                  return response.json();
                }
              ),
            ]);

          if (cancelled) {
            return;
          }

          const liveMacro =
            macroResult.status ===
            "fulfilled"
              ? macroResult.value
              : {};

          const liveMarkets =
            marketsResult.status ===
            "fulfilled"
              ? marketsResult.value
              : {};

          const liveEnergy =
            energyResult.status ===
            "fulfilled"
              ? energyResult.value
              : {};

          const liveNews =
            newsResult.status ===
            "fulfilled"
              ? newsResult.value
              : {};

          const liveInternet =
            internetResult.status ===
            "fulfilled"
              ? internetResult.value
              : {};

          const response =
            await fetch(
              "/api/intelligence/global-risk",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    macro:
                      liveMacro,

                    markets:
                      liveMarkets,

                    energy:
                      liveEnergy,

                    news:
                      liveNews,

                    internet: {
                      ...liveInternet,

                      riskScore:
                        liveInternet
                          ?.risk
                          ?.score ??
                        liveInternet
                          ?.riskScore,
                    },
                  }),
              }
            );

          if (!response.ok) {
            throw new Error(
              `Global Risk HTTP ${response.status}`
            );
          }

          const data:
            GlobalRiskData =
            await response.json();

          if (
            !data ||
            !(
              "globalRiskScore"
              in data
            )
          ) {
            throw new Error(
              "Invalid Global Risk response"
            );
          }

          if (cancelled) {
            return;
          }

          setGlobalRisk(
            data
          );

          console.log(
            "GLOBAL RISK LIVE:",
            data
          );
        } catch (error) {
          console.error(
            "GLOBAL RISK ERROR:",
            error
          );

          if (!cancelled) {
            setGlobalRiskError(
              "Global risk unavailable"
            );

            setGlobalRisk(
              null
            );
          }
        } finally {
          if (!cancelled) {
            setGlobalRiskLoading(
              false
            );
          }
        }
      };

    void calculateRisk();

    const timer =
      window.setInterval(
        () => {
          void calculateRisk();
        },
        60000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        timer
      );
    };
  }, []);

  // ===================================================
  // HELPERS
  // ===================================================

  const getMarketClass = (
    change?: number | null
  ) => {
    if (
      change === undefined ||
      change === null
    ) {
      return "";
    }

    if (change > 0) {
      return "positive";
    }

    if (change < 0) {
      return "negative";
    }

    return "warning";
  };

  const getImpactClass = (
    impact?: string
  ) => {
    if (!impact) {
      return "";
    }

    if (
      impact.includes(
        "NEGATIVE"
      )
    ) {
      return "negative";
    }

    if (
      impact.includes(
        "POSITIVE"
      )
    ) {
      return "positive";
    }

    return "warning";
  };

  const getGasBiasClass = (
    bias?: string
  ) => {
    if (!bias) {
      return "";
    }

    if (
      bias.includes("HIGH")
    ) {
      return "warning";
    }

    if (
      bias.includes("LOW")
    ) {
      return "positive";
    }

    return "";
  };

  const getRiskClass = (
    level?: string
  ) => {
    if (
      level === "CRITICAL" ||
      level === "HIGH"
    ) {
      return "negative";
    }

    if (
      level === "MEDIUM"
    ) {
      return "warning";
    }

    if (
      level === "LOW"
    ) {
      return "positive";
    }

    return "";
  };

  const showRiskComponent = (
    value:
      | number
      | null
      | undefined
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "--";
    }

    return value.toFixed(
      0
    );
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="app">

      {/* TOP BAR */}

      <header className="topbar">

        <div className="wm-brand">
          <div className="wm-logo">
            ◎
          </div>

          <div>
            <h1>
              WORLD MONITOR
            </h1>

            <p>
              GLOBAL INTELLIGENCE.
              REAL IMPACT.
            </p>
          </div>
        </div>

        <nav className="wm-nav">
          <button
            className="wm-nav-active"
            type="button"
          >
            LIVE
          </button>

          <button type="button">
            MAP
          </button>

          <button type="button">
            MARKETS
          </button>

          <button type="button">
            ENERGY
          </button>

          <button type="button">
            ECONOMY
          </button>

          <button type="button">
            COUNTRIES
          </button>

          <button type="button">
            INTEL
          </button>
        </nav>

        <GlobalSearch
          onSelect={
            handleCountrySelect
          }
        />

        <div className="wm-live">
          <span className="wm-live-dot" />
          LIVE
        </div>

      </header>

      <main>

        {/* STATUS STRIP */}

        <section className="wm-status-strip">

          <div>
            <span>
              GLOBAL MARKETS
            </span>

            <strong
              className={
                marketsError
                  ? "negative"
                  : marketsLoading
                    ? "warning"
                    : "positive"
              }
            >
              {marketsLoading
                ? "CONNECTING"
                : marketsError
                  ? "ERROR"
                  : "LIVE"}
            </strong>
          </div>

          <div>
            <span>
              MACRO
            </span>

            <strong
              className={
                macroError
                  ? "negative"
                  : macroLoading
                    ? "warning"
                    : "positive"
              }
            >
              {macroLoading
                ? "CONNECTING"
                : macroError
                  ? "ERROR"
                  : "LIVE"}
            </strong>
          </div>

          <div>
            <span>
              ENERGY
            </span>

            <strong
              className={
                energyError
                  ? "negative"
                  : energyLoading
                    ? "warning"
                    : "positive"
              }
            >
              {energyLoading
                ? "CONNECTING"
                : energyError
                  ? "ERROR"
                  : "LIVE"}
            </strong>
          </div>

          <div>
            <span>
              NEWS
            </span>

            <strong
              className={
                newsError
                  ? "negative"
                  : newsLoading
                    ? "warning"
                    : "positive"
              }
            >
              {newsLoading
                ? "CONNECTING"
                : newsError
                  ? "ERROR"
                  : "LIVE"}
            </strong>
          </div>

          <div>
            <span>
              GLOBAL RISK
            </span>

            <strong
              className={
                globalRiskError
                  ? "negative"
                  : globalRiskLoading
                    ? "warning"
                    : getRiskClass(
                        globalRisk
                          ?.globalRiskLevel
                      )
              }
            >
              {globalRiskLoading
                ? "CALCULATING"
                : globalRiskError
                  ? "ERROR"
                  : globalRisk
                      ?.globalRiskLevel ||
                    "UNKNOWN"}
            </strong>
          </div>

        </section>


        {/* ==================================================
            DESIGN 4 HERO
            MAP + AI COPILOT
            ================================================== */}

        <section className="wm-d4-command">

          <section className="wm-d4-hero">

            {/* MAP */}

            <div className="wm-d4-map">

              <MapboxWorldMap
                onCountrySelect={
                  handleCountrySelect
                }
                onImpactSelect={
                  handleImpactSelect
                }
              />

              <div className="wm-map-livebar">

                <div>
                  <span className="wm-live-dot" />

                  <strong>
                    LIVE
                  </strong>
                </div>

                <span>
                  Flights
                </span>

                <span>
                  Ships
                </span>

                <span>
                  Weather
                </span>

                <span>
                  Internet
                </span>

              </div>

            </div>


            {/* AI COLUMN */}

            <aside className="wm-d4-ai-column">

              <div className="wm-d4-ai-card">

                <AIIntelligencePanel
                  selectedCountryName={
                    selectedCountryName
                  }
                  selectedEvent={
                    impactData?.event ||
                    null
                  }
                />

              </div>


              <div className="wm-d4-change-card">

                <WhatChangedPanel />

              </div>

            </aside>

          </section>


          {/* ==================================================
              INTELLIGENCE DECK
              ================================================== */}

          <section className="wm-d4-deck">

            <div className="wm-d4-deck-heading">

              <div>
                <span>
                  WORLD MONITOR
                </span>

                <h2>
                  Intelligence Deck
                </h2>
              </div>

              <span className="wm-d4-live-status">
                ● LIVE DATA
              </span>

            </div>


            <div className="wm-d4-deck-grid">

              {/* GLOBAL RISK */}

              <article className="wm-d4-card wm-d4-risk">

                <div className="wm-d4-card-title">
                  GLOBAL RISK
                </div>

                <div
                  className={`wm-d4-risk-number ${getRiskClass(
                    globalRisk
                      ?.globalRiskLevel
                  )}`}
                >
                  {globalRiskLoading
                    ? "--"
                    : globalRisk
                        ?.globalRiskScore !==
                        null &&
                      globalRisk
                        ?.globalRiskScore !==
                        undefined
                      ? globalRisk
                          .globalRiskScore
                          .toFixed(1)
                      : "--"}
                </div>

                <strong
                  className={`wm-d4-risk-level ${getRiskClass(
                    globalRisk
                      ?.globalRiskLevel
                  )}`}
                >
                  {globalRiskLoading
                    ? "CALCULATING"
                    : globalRisk
                        ?.globalRiskLevel ||
                      "UNKNOWN"}
                </strong>

                <p>
                  {globalRisk?.bias
                    ? `Bias: ${globalRisk.bias.replaceAll(
                        "_",
                        " "
                      )}`
                    : "Multi-factor global risk"}
                </p>

                {globalRisk && (
                  <div className="wm-d4-risk-components">

                    <span>
                      Macro

                      <strong>
                        {showRiskComponent(
                          globalRisk
                            .components
                            .macro
                        )}
                      </strong>
                    </span>

                    <span>
                      Markets

                      <strong>
                        {showRiskComponent(
                          globalRisk
                            .components
                            .markets
                        )}
                      </strong>
                    </span>

                    <span>
                      Energy

                      <strong>
                        {showRiskComponent(
                          globalRisk
                            .components
                            .energy
                        )}
                      </strong>
                    </span>

                    <span>
                      News

                      <strong>
                        {showRiskComponent(
                          globalRisk
                            .components
                            .news
                        )}
                      </strong>
                    </span>

                    <span>
                      Internet

                      <strong>
                        {showRiskComponent(
                          globalRisk
                            .components
                            .internet
                        )}
                      </strong>
                    </span>

                    <span>
                      Coverage

                      <strong>
                        {
                          globalRisk
                            .coverage
                            .coveragePercent
                        }
                        %
                      </strong>
                    </span>

                  </div>
                )}

              </article>


              {/* MARKETS */}

              <article className="wm-d4-card">

                <GlobalMarketsCard
                  globalMarkets={
                    globalMarkets
                  }
                  marketsLoading={
                    marketsLoading
                  }
                  marketsError={
                    marketsError
                  }
                  energy={
                    energy
                  }
                  energyLoading={
                    energyLoading
                  }
                  getMarketClass={
                    getMarketClass
                  }
                />

              </article>


              {/* MACRO */}

              <article className="wm-d4-card">

                <GlobalMacroCard
                  macro={
                    macro
                  }
                  macroLoading={
                    macroLoading
                  }
                  macroError={
                    macroError
                  }
                />

              </article>


              {/* ENERGY */}

              <article className="wm-d4-card">

                <PetroleumEnergySection
                  energy={
                    energy
                  }
                  energyLoading={
                    energyLoading
                  }
                  energyError={
                    energyError
                  }
                />

              </article>

              {/* BREAKING INTELLIGENCE */}

              <article className="wm-d4-card wm-d4-breaking-card">
                <BreakingIntelligenceSection
                  breakingNews={
                    breakingNews
                  }
                  newsLoading={
                    newsLoading
                  }
                  newsError={
                    newsError
                  }
                />
              </article>

            </div>

          </section>

          {/* BREAKING INTELLIGENCE MOVED INTO DECK */}
{/* ==================================================
              COUNTRY + IMPACT
              ================================================== */}

          {(selectedCountry ||
  selectedCountryName ||
  impactData ||
  impactLoading) && (

  <section className="wm-d4-detail-grid">

    {(selectedCountry ||
      selectedCountryName) && (
      <div className="wm-d4-detail-card">

        {selectedCountry ? (
          <CountryIntelligencePanel
            country={
              selectedCountry
            }
            onClose={
              closeCountryPanel
            }
          />
        ) : (
          <div className="wm-d4-empty-impact">

            <span>
              COUNTRY INTELLIGENCE
            </span>

            <strong>
              {selectedCountryName}
            </strong>

            <p>
              Intelligence data is currently unavailable
              for this country.
            </p>

          </div>
        )}

      </div>
    )}

    {(impactData ||
      impactLoading) && (
      <div className="wm-d4-detail-card">

        <ImpactPanel
          data={
            impactData
          }
          loading={
            impactLoading
          }
          onClose={
            closeImpactPanel
          }
        />

      </div>
    )}

  </section>
)}

</section>


{/* ==================================================
    BOTTOM
            ================================================== */}

        <section className="wm-bottom-grid">

          <NaturalGasSection
            naturalGas={
              naturalGas
            }
            gasLoading={
              gasLoading
            }
            gasError={
              gasError
            }
          />


          <section className="india-panel">

            <div className="section-title">

              <div>
                <h2>
                  India Market Impact
                </h2>

                <p>
                  Global conditions →
                  India
                </p>
              </div>

              <span>
                LIVE MODEL
              </span>

            </div>


            <div className="india-grid">

              <div className="impact-card">
                <span>
                  OIL IMPACT
                </span>

                <strong
                  className={
                    getImpactClass(
                      energy
                        ?.intelligence
                        .indiaOilImpact
                    )
                  }
                >
                  {energy
                    ?.intelligence
                    .indiaOilImpact ||
                    "Loading..."}
                </strong>
              </div>


              <div className="impact-card">
                <span>
                  GAS BIAS
                </span>

                <strong
                  className={
                    getGasBiasClass(
                      naturalGas
                        ?.intelligence
                        .gasBias
                    )
                  }
                >
                  {naturalGas
                    ?.intelligence
                    .gasBias ||
                    "Loading..."}
                </strong>
              </div>


              <div className="impact-card">
                <span>
                  GLOBAL RISK
                </span>

                <strong
                  className={
                    getRiskClass(
                      globalRisk
                        ?.globalRiskLevel
                    )
                  }
                >
                  {globalRisk
                    ?.globalRiskScore !==
                    null &&
                  globalRisk
                    ?.globalRiskScore !==
                    undefined
                    ? globalRisk
                        .globalRiskScore
                        .toFixed(1)
                    : "--"}
                </strong>
              </div>


              <div className="impact-card">
                <span>
                  RISK BIAS
                </span>

                <strong>
                  {globalRisk
                    ?.bias
                    ?.replaceAll(
                      "_",
                      " "
                    ) ||
                    "LOADING"}
                </strong>
              </div>

            </div>


            <LiveEventTimeline
              onImpactSelect={
                handleImpactSelect
              }
            />

          </section>

        </section>

      </main>

    </div>
  );
}

export default App;

