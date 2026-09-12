import express from "express";

import {
  getWorldWeather,
} from "../services/weatherService.js";

const router =
  express.Router();

// =====================================================
// WORLD CURRENT WEATHER
// GET /api/weather/world
// =====================================================

router.get(
  "/world",
  async (req, res) => {
    try {
      const data =
        await getWorldWeather();

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "WORLD WEATHER ROUTE ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Failed to fetch world weather",

          details:
            error.message,

          updatedAt:
            new Date().toISOString(),
        });
    }
  }
);

export default router;
