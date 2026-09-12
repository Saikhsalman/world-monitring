import express from "express";

import {
  getRbiPolicyRates,
  getRbiMarketSnapshot,
} from "../services/rbiService.js";

const router = express.Router();

// =====================================================
// GET RBI POLICY RATES
// =====================================================

router.get(
  "/policy-rates",
  async (req, res) => {
    try {
      const data =
        await getRbiPolicyRates();

      res.json(data);
    } catch (error) {
      console.error(
        "RBI POLICY ROUTE ERROR:",
        error.message
      );

      res.status(500).json({
        status: "error",

        error:
          "Failed to fetch RBI policy rates",

        details:
          error.message,
      });
    }
  }
);

// =====================================================
// GET RBI MARKET SNAPSHOT
// G-SEC + NIFTY 50 + SENSEX
// =====================================================

router.get(
  "/market-snapshot",
  async (req, res) => {
    try {
      const data =
        await getRbiMarketSnapshot();

      res.json(data);
    } catch (error) {
      console.error(
        "RBI MARKET ROUTE ERROR:",
        error.message
      );

      res.status(500).json({
        status: "error",

        error:
          "Failed to fetch RBI market snapshot",

        details:
          error.message,
      });
    }
  }
);

export default router;