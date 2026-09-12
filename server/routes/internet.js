import express from "express";

import {
  getInternetOutages,
} from "../services/internetService.js";

const router =
  express.Router();

router.get(
  "/outages",
  async (req, res) => {
    try {
      const data =
        await getInternetOutages();

      return res.json(
        data
      );
    } catch (error) {
      console.error(
        "INTERNET OUTAGE ERROR:",
        error.message
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "Failed to fetch Internet outages",

          details:
            error.message,

          updatedAt:
            new Date().toISOString(),
        });
    }
  }
);

export default router;
