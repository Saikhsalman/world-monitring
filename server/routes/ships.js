import express from "express";

import {
  getLiveShips,
} from "../services/shipService.js";

const router =
  express.Router();

// GET /api/ships/live

router.get(
  "/live",
  (req, res) => {
    try {
      return res.json(
        getLiveShips()
      );
    } catch (
      error
    ) {
      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Failed to fetch live ships",

          details:
            error.message,
        });
    }
  }
);

export default router;
