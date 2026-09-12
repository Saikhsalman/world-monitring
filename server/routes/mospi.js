import express from "express";

import {
  getIndiaInflation,
} from "../services/mospiService.js";

const router = express.Router();

// =====================================================
// INDIA CPI INFLATION
// =====================================================

router.get(
  "/inflation",
  async (req, res) => {
    try {
      const data =
        await getIndiaInflation();

      res.json(data);
    } catch (error) {
      console.error(
        "MOSPI ROUTE ERROR:",
        error.message
      );

      res.status(500).json({
        status: "error",
        error:
          "Failed to fetch India inflation",
        details: error.message,
      });
    }
  }
);

export default router;