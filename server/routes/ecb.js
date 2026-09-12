import express from "express";

import {
  getEcbPolicyRates,
} from "../services/ecbService.js";

const router = express.Router();

// =====================================================
// ECB POLICY RATES
// =====================================================

router.get(
  "/policy-rates",
  async (req, res) => {
    try {
      const data =
        await getEcbPolicyRates();

      res.json(data);
    } catch (error) {
      console.error(
        "ECB ROUTE ERROR:",
        error.message
      );

      res.status(500).json({
        status: "error",
        error:
          "Failed to fetch ECB policy rates",
        details:
          error.message,
      });
    }
  }
);

export default router;