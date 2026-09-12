import express from "express";

import { safeTwelveQuote } from "../services/twelveDataService.js";
import { safeCboeVix } from "../services/cboeService.js";
import { getFredLatest } from "../services/fredService.js";

const router = express.Router();

router.get("/global", async (req, res) => {
  try {
    const [
      spy,
      qqq,
      gold,
      vix,
      dollarIndex,
    ] = await Promise.all([
      safeTwelveQuote(
        "SPY",
        "S&P 500 Proxy"
      ),

      safeTwelveQuote(
        "QQQ",
        "Nasdaq-100 Proxy"
      ),

      safeTwelveQuote(
        "XAU/USD",
        "Gold Spot"
      ),

      safeCboeVix(),

      getFredLatest("DTWEXBGS"),
    ]);

    const dollar = {
      name: "Nominal Broad U.S. Dollar Index",
      symbol: "DTWEXBGS",
      value: dollarIndex.value,
      date: dollarIndex.date,
      unit: "Index",
      source: "FRED",
      status: "live",
    };

    const liveCount = [
      spy,
      qqq,
      gold,
      vix,
      dollar,
    ].filter(
      (item) => item.status === "live"
    ).length;

    res.json({
      source: {
        equities: "Twelve Data",
        gold: "Twelve Data",
        volatility: "CBOE",
        dollar: "FRED",
      },

      status:
        liveCount === 5
          ? "live"
          : liveCount > 0
          ? "partial"
          : "unavailable",

      liveCount,
      totalCount: 5,

      markets: {
        sp500Proxy: spy,
        nasdaqProxy: qqq,
        gold,
        vix,
        dollar,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch global markets",
      details: error.message,
    });
  }
});

export default router;