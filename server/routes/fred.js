import express from "express";

import {
  getFredLatest,
  getCpiInflationYoY,
} from "../services/fredService.js";

const router = express.Router();

// =====================================================
// US 10Y
// =====================================================

router.get("/us10y", async (req, res) => {
  try {
    const data = await getFredLatest("DGS10");

    res.json({
      indicator: "US 10-Year Treasury Yield",
      series: "DGS10",
      value: data.value,
      unit: "%",
      date: data.date,
      source: "FRED",
    });
  } catch (error) {
    console.error(
      "FRED US10Y ERROR:",
      error.message
    );

    res.status(500).json({
      error: error.message,
    });
  }
});

// =====================================================
// DOLLAR INDEX
// =====================================================

router.get("/dollar", async (req, res) => {
  try {
    const data = await getFredLatest("DTWEXBGS");

    res.json({
      indicator: "Nominal Broad U.S. Dollar Index",
      series: "DTWEXBGS",
      value: data.value,
      unit: "Index",
      date: data.date,
      source: "FRED",
    });
  } catch (error) {
    console.error(
      "FRED DOLLAR ERROR:",
      error.message
    );

    res.status(500).json({
      error: "Failed to fetch dollar index",
      details: error.message,
    });
  }
});

// =====================================================
// MACRO
// =====================================================

router.get("/macro", async (req, res) => {
  try {
    const [
      us10y,
      fedFunds,
      unemployment,
      inflation,
      dollarIndex,
    ] = await Promise.all([
      getFredLatest("DGS10"),
      getFredLatest("FEDFUNDS"),
      getFredLatest("UNRATE"),
      getCpiInflationYoY(),
      getFredLatest("DTWEXBGS"),
    ]);

    res.json({
      source: "FRED",

      us10y: {
        name: "US 10-Year Treasury Yield",
        series: "DGS10",
        value: us10y.value,
        unit: "%",
        date: us10y.date,
      },

      fedFunds: {
        name: "Federal Funds Rate",
        series: "FEDFUNDS",
        value: fedFunds.value,
        unit: "%",
        date: fedFunds.date,
      },

      inflation: {
        name: "US CPI Inflation YoY",
        series: "CPIAUCSL",
        value: inflation.value,
        unit: "%",
        date: inflation.date,
        latestCpi: inflation.latestCpi,
        previousYearCpi: inflation.previousYearCpi,
      },

      unemployment: {
        name: "US Unemployment Rate",
        series: "UNRATE",
        value: unemployment.value,
        unit: "%",
        date: unemployment.date,
      },

      dollarIndex: {
        name: "Nominal Broad U.S. Dollar Index",
        series: "DTWEXBGS",
        value: dollarIndex.value,
        unit: "Index",
        date: dollarIndex.date,
      },
    });
  } catch (error) {
    console.error(
      "FRED MACRO ERROR:",
      error.message
    );

    res.status(500).json({
      error: "Failed to fetch macro data",
      details: error.message,
    });
  }
});

// =====================================================
// EXPORT
// =====================================================

export default router;