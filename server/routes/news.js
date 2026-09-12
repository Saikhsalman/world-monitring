import express from "express";

import {
  getBreakingIntelligence,
  getNewsSearch,
} from "../services/newsService.js";

const router = express.Router();

// =====================================================
// BREAKING INTELLIGENCE
// =====================================================

router.get(
  "/breaking",
  async (req, res) => {
    try {
      const data =
        await getBreakingIntelligence();

      res.json(data);
    } catch (error) {
      console.error(
        "NEWS BREAKING ERROR:",
        error.message
      );

      res.status(500).json({
        error:
          "Failed to fetch breaking intelligence",

        details:
          error.message,
      });
    }
  }
);

// =====================================================
// NEWS SEARCH
// =====================================================

router.get(
  "/search",
  async (req, res) => {
    try {
      const query =
        req.query.q || "";

      const articles =
        await getNewsSearch(query);

      res.json({
        source: "RSS",
        query,
        count:
          articles.length,
        articles,
      });
    } catch (error) {
      console.error(
        "NEWS SEARCH ERROR:",
        error.message
      );

      res.status(500).json({
        error:
          "Failed to search news",

        details:
          error.message,
      });
    }
  }
);

export default router;