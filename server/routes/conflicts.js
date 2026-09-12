import express from "express";

import {
  getConflictIntelligence,
} from "../services/conflictService.js";

const router =
  express.Router();

// =====================================================
// GET /api/conflicts/live
// =====================================================

router.get(
  "/live",
  (req, res) => {
    try {
      const data =
        getConflictIntelligence();

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "CONFLICT INTELLIGENCE ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status: "error",
          error:
            "Conflict intelligence failed",
          details:
            error.message,
        });
    }
  }
);

export default router;