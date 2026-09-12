import express from "express";

import {
  getCountryIntelligence,
} from "../intelligence/countryIntelligence.js";

import {
  calculateGlobalRisk,
} from "../intelligence/globalRiskEngine.js";

import {
  getEventImpact,
  getImpactEvents,
} from "../intelligence/impactEngine.js";

import {
  analyzeChanges,
} from "../intelligence/changeDetectionEngine.js";

const router =
  express.Router();

// =====================================================
// COUNTRY INTELLIGENCE
// GET /api/intelligence/country/:countryCode
// =====================================================

router.get(
  "/country/:countryCode",
  async (req, res) => {
    try {
      const data =
        await getCountryIntelligence(
          req.params.countryCode
        );

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "COUNTRY INTELLIGENCE ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status: "error",
          error:
            "Country intelligence failed",
          details:
            error.message,
        });
    }
  }
);

// =====================================================
// IMPACT EVENTS
// GET /api/intelligence/impact-events
// =====================================================

router.get(
  "/impact-events",
  (req, res) => {
    try {
      const data =
        getImpactEvents();

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "IMPACT EVENTS ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status: "error",
          error:
            "Impact events failed",
          details:
            error.message,
        });
    }
  }
);

// =====================================================
// EVENT IMPACT
// GET /api/intelligence/impact/:eventId
// =====================================================

router.get(
  "/impact/:eventId",
  (req, res) => {
    try {
      const data =
        getEventImpact(
          req.params.eventId
        );

      if (
        data.status ===
        "not_found"
      ) {
        return res
          .status(404)
          .json(data);
      }

      if (
        data.status ===
        "unsupported"
      ) {
        return res
          .status(422)
          .json(data);
      }

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "IMPACT ENGINE ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status: "error",
          error:
            "Impact engine failed",
          details:
            error.message,
        });
    }
  }
);


// =====================================================
// WHAT CHANGED ENGINE
// POST /api/intelligence/changes
// =====================================================

router.post(
  "/changes",
  (req, res) => {
    try {
      const result =
        analyzeChanges(
          req.body || {}
        );

      return res.json(
        result
      );
    } catch (error) {
      console.error(
        "CHANGE DETECTION ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status: "error",

          error:
            "Change detection failed",

          details:
            error.message,
        });
    }
  }
);

// =====================================================
// WHAT CHANGED — LIVE WORLD MONITOR DATA
// GET /api/intelligence/changes/live
// =====================================================

router.get(
  "/changes/live",
  async (req, res) => {
    try {
      const base =
        `http://localhost:${
          process.env.PORT || 5000
        }`;

      const safeFetch =
        async (url) => {
          try {
            const response =
              await fetch(url);

            if (!response.ok) {
              return null;
            }

            return await response.json();
          } catch {
            return null;
          }
        };

      const [
        macro,
        markets,
        energy,
        internet,
        conflicts,
        news,
      ] =
        await Promise.all([
          safeFetch(
            `${base}/api/fred/macro`
          ),

          safeFetch(
            `${base}/api/markets/global`
          ),

          safeFetch(
            `${base}/api/eia/energy`
          ),

          safeFetch(
            `${base}/api/internet/outages`
          ),

          safeFetch(
            `${base}/api/conflicts/live`
          ),

          safeFetch(
            `${base}/api/news/breaking`
          ),
        ]);

      let globalRisk =
        null;

      try {
        const riskResponse =
          await fetch(
            `${base}/api/intelligence/global-risk`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  macro:
                    macro || {},

                  markets:
                    markets || {},

                  energy:
                    energy || {},

                  news:
                    news || {},

                  internet:
                    internet || {},
                }),
            }
          );

        if (riskResponse.ok) {
          globalRisk =
            await riskResponse.json();
        }
      } catch {
        globalRisk =
          null;
      }

      const result =
        analyzeChanges({
          globalRisk:
            globalRisk || {},

          macro:
            macro || {},

          markets:
            markets || {},

          energy:
            energy || {},

          internet:
            internet || {},

          conflicts:
            conflicts || {},
        });

      return res.json({
        ...result,

        sourceStatus: {
          macro:
            Boolean(macro),

          markets:
            Boolean(markets),

          energy:
            Boolean(energy),

          internet:
            Boolean(internet),

          conflicts:
            Boolean(conflicts),

          globalRisk:
            Boolean(globalRisk),
        },
      });
    } catch (error) {
      console.error(
        "LIVE CHANGE DETECTION ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Live change detection failed",

          details:
            error.message,
        });
    }
  }
);
// =====================================================
// GLOBAL RISK ENGINE
// POST /api/intelligence/global-risk
// =====================================================

router.post(
  "/global-risk",
  (req, res) => {
    try {
      const {
        macro = {},
        markets = {},
        energy = {},
        news = {},
        internet = {},
      } =
        req.body || {};

      const result =
        calculateGlobalRisk({
          macro,
          markets,
          energy,
          news,
          internet,
        });

      return res.json(
        result
      );
    } catch (error) {
      console.error(
        "GLOBAL RISK ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status: "error",
          error:
            "Global risk calculation failed",
          details:
            error.message,
        });
    }
  }
);


// =====================================================
// WHAT CHANGED ENGINE
// POST /api/intelligence/changes
// =====================================================

router.post(
  "/changes",
  (req, res) => {
    try {
      const result =
        analyzeChanges(
          req.body || {}
        );

      return res.json(
        result
      );
    } catch (error) {
      console.error(
        "CHANGE DETECTION ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status: "error",

          error:
            "Change detection failed",

          details:
            error.message,
        });
    }
  }
);

// =====================================================
// WHAT CHANGED — LIVE WORLD MONITOR DATA
// GET /api/intelligence/changes/live
// =====================================================

router.get(
  "/changes/live",
  async (req, res) => {
    try {
      const base =
        `http://localhost:${
          process.env.PORT || 5000
        }`;

      const safeFetch =
        async (url) => {
          try {
            const response =
              await fetch(url);

            if (!response.ok) {
              return null;
            }

            return await response.json();
          } catch {
            return null;
          }
        };

      const [
        macro,
        markets,
        energy,
        internet,
        conflicts,
        news,
      ] =
        await Promise.all([
          safeFetch(
            `${base}/api/fred/macro`
          ),

          safeFetch(
            `${base}/api/markets/global`
          ),

          safeFetch(
            `${base}/api/eia/energy`
          ),

          safeFetch(
            `${base}/api/internet/outages`
          ),

          safeFetch(
            `${base}/api/conflicts/live`
          ),

          safeFetch(
            `${base}/api/news/breaking`
          ),
        ]);

      let globalRisk =
        null;

      try {
        const riskResponse =
          await fetch(
            `${base}/api/intelligence/global-risk`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  macro:
                    macro || {},

                  markets:
                    markets || {},

                  energy:
                    energy || {},

                  news:
                    news || {},

                  internet:
                    internet || {},
                }),
            }
          );

        if (riskResponse.ok) {
          globalRisk =
            await riskResponse.json();
        }
      } catch {
        globalRisk =
          null;
      }

      const result =
        analyzeChanges({
          globalRisk:
            globalRisk || {},

          macro:
            macro || {},

          markets:
            markets || {},

          energy:
            energy || {},

          internet:
            internet || {},

          conflicts:
            conflicts || {},
        });

      return res.json({
        ...result,

        sourceStatus: {
          macro:
            Boolean(macro),

          markets:
            Boolean(markets),

          energy:
            Boolean(energy),

          internet:
            Boolean(internet),

          conflicts:
            Boolean(conflicts),

          globalRisk:
            Boolean(globalRisk),
        },
      });
    } catch (error) {
      console.error(
        "LIVE CHANGE DETECTION ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Live change detection failed",

          details:
            error.message,
        });
    }
  }
);
// =====================================================
// GLOBAL RISK ENGINE STATUS
// GET /api/intelligence/global-risk
// =====================================================

router.get(
  "/global-risk",
  (req, res) => {
    return res.json({
      status: "ready",

      engine:
        "World Monitor Global Risk Engine",

      method: "POST",

      endpoint:
        "/api/intelligence/global-risk",

      requiredData: [
        "macro",
        "markets",
        "energy",
        "news",
        "internet",
      ],

      components: [
        "Macro Risk",
        "Market Risk",
        "Energy Risk",
        "News Risk",
        "Internet Risk",
      ],

      updatedAt:
        new Date()
          .toISOString(),
    });
  }
);

export default router;

