import express from "express";

import {
  getLiveFlights,
} from "../services/flightService.js";

const router =
  express.Router();

// =====================================================
// LIVE FLIGHTS
// GET /api/flights/live
// =====================================================

router.get(
  "/live",
  async (req, res) => {
    try {
      const data =
        await getLiveFlights();

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "LIVE FLIGHTS ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Failed to fetch live flights",

          details:
            error.message,

          updatedAt:
            new Date().toISOString(),
        });
    }
  }
);

export default router;
