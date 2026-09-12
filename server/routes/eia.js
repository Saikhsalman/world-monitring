import express from "express";

import {
  safeEiaSeries,
  getEiaLatestTwo,
} from "../services/eiaService.js";

const router = express.Router();

// =====================================================
// OIL PRICES
// =====================================================

router.get("/oil-prices", async (req, res) => {
  const [wti, brent] = await Promise.all([
    safeEiaSeries(
      "PET.RWTC.D",
      "WTI Crude Oil Spot Price",
      "$/barrel"
    ),

    safeEiaSeries(
      "PET.RBRTE.D",
      "Brent Crude Oil Spot Price",
      "$/barrel"
    ),
  ]);

  res.json({
    source: "EIA",
    wti,
    brent,
  });
});

// =====================================================
// ENERGY
// =====================================================

router.get("/energy", async (req, res) => {
  try {
    const [
      wti,
      brent,
      gasoline,
      distillate,
      production,
      imports,
      exportsData,
      refineryUtilization,
    ] = await Promise.all([
      safeEiaSeries(
        "PET.RWTC.D",
        "WTI Crude Oil Spot Price",
        "$/barrel"
      ),

      safeEiaSeries(
        "PET.RBRTE.D",
        "Brent Crude Oil Spot Price",
        "$/barrel"
      ),

      safeEiaSeries(
        "PET.WGTSTUS1.W",
        "US Gasoline Stocks",
        "Thousand Barrels"
      ),

      safeEiaSeries(
        "PET.WDISTUS1.W",
        "US Distillate Stocks",
        "Thousand Barrels"
      ),

      safeEiaSeries(
        "PET.WCRFPUS2.W",
        "US Crude Oil Production",
        "Thousand Barrels/Day"
      ),

      safeEiaSeries(
        "PET.WCRIMUS2.W",
        "US Crude Oil Imports",
        "Thousand Barrels/Day"
      ),

      safeEiaSeries(
        "PET.WCREXUS2.W",
        "US Crude Oil Exports",
        "Thousand Barrels/Day"
      ),

      safeEiaSeries(
        "PET.WPULEUS3.W",
        "US Refinery Utilization",
        "%"
      ),
    ]);

    let crudeInventory;

    try {
      const inventory = await getEiaLatestTwo(
        "PET.WCESTUS1.W"
      );

      const latest = inventory.latest.value;
      const previous = inventory.previous.value;
      const change = latest - previous;

      crudeInventory = {
        name: "US Commercial Crude Oil Inventory",
        series: "PET.WCESTUS1.W",

        latest: {
          value: latest,
          date: inventory.latest.date,
        },

        previous: {
          value: previous,
          date: inventory.previous.date,
        },

        unit: "Thousand Barrels",
        change,

        changeMillionBarrels: Number(
          (change / 1000).toFixed(3)
        ),

        signal:
          change > 0
            ? "BUILD"
            : change < 0
            ? "DRAW"
            : "UNCHANGED",

        oilBias:
          change > 0
            ? "BEARISH"
            : change < 0
            ? "BULLISH"
            : "NEUTRAL",

        status: "live",
      };
    } catch (error) {
      crudeInventory = {
        name: "US Commercial Crude Oil Inventory",
        series: "PET.WCESTUS1.W",
        status: "unavailable",
        error: error.message,
      };
    }

    let energyScore = 0;
    const reasons = [];

    if (crudeInventory.status === "live") {
      if (crudeInventory.signal === "DRAW") {
        energyScore += 1;
        reasons.push(
          "US commercial crude inventories declined."
        );
      }

      if (crudeInventory.signal === "BUILD") {
        energyScore -= 1;
        reasons.push(
          "US commercial crude inventories increased."
        );
      }
    }

    if (
      wti.status === "live" &&
      wti.value >= 80
    ) {
      energyScore += 1;
      reasons.push(
        "WTI crude is above $80 per barrel."
      );
    }

    if (
      brent.status === "live" &&
      brent.value >= 85
    ) {
      energyScore += 1;
      reasons.push(
        "Brent crude is above $85 per barrel."
      );
    }

    let energyBias = "NEUTRAL";

    if (energyScore >= 2) {
      energyBias = "HIGH OIL PRESSURE";
    } else if (energyScore === 1) {
      energyBias = "MILD OIL PRESSURE";
    } else if (energyScore <= -1) {
      energyBias = "SOFTER OIL PRESSURE";
    }

    let indiaOilImpact = "NEUTRAL";

    if (energyScore >= 2) {
      indiaOilImpact = "NEGATIVE";
    } else if (energyScore === 1) {
      indiaOilImpact = "MILD NEGATIVE";
    } else if (energyScore <= -1) {
      indiaOilImpact = "POSITIVE";
    }

    res.json({
      source: "EIA",

      prices: {
        wti,
        brent,
      },

      inventories: {
        crude: crudeInventory,
        gasoline,
        distillate,
      },

      supply: {
        production,
        imports,
        exports: exportsData,
      },

      refining: {
        utilization: refineryUtilization,
      },

      intelligence: {
        energyScore,
        energyBias,
        indiaOilImpact,
        reasons,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to build EIA energy dashboard",
      details: error.message,
    });
  }
});

// =====================================================
// NATURAL GAS
// =====================================================

router.get("/natural-gas", async (req, res) => {
  try {
    const [
      henryHub,
      storage,
      production,
      consumption,
    ] = await Promise.all([
      safeEiaSeries(
        "NG.RNGWHHD.D",
        "Henry Hub Natural Gas Spot Price",
        "$/MMBtu"
      ),

      safeEiaSeries(
        "NG.NW2_EPG0_SWO_R48_BCF.W",
        "Lower 48 Working Gas Storage",
        "Bcf"
      ),

      safeEiaSeries(
        "NG.N9070US2.M",
        "US Dry Natural Gas Production",
        "Million Cubic Feet"
      ),

      safeEiaSeries(
        "NG.N9140US2.M",
        "US Natural Gas Consumption",
        "Million Cubic Feet"
      ),
    ]);

    let storageChange;

    try {
      const storageRows = await getEiaLatestTwo(
        "NG.NW2_EPG0_SWO_R48_BCF.W"
      );

      const latest = storageRows.latest.value;
      const previous = storageRows.previous.value;
      const change = latest - previous;

      storageChange = {
        status: "live",

        latest: {
          value: latest,
          date: storageRows.latest.date,
        },

        previous: {
          value: previous,
          date: storageRows.previous.date,
        },

        change,
        unit: "Bcf",

        signal:
          change > 0
            ? "INJECTION"
            : change < 0
            ? "WITHDRAWAL"
            : "UNCHANGED",
      };
    } catch (error) {
      storageChange = {
        status: "unavailable",
        error: error.message,
      };
    }

    let gasScore = 0;
    const reasons = [];

    if (
      henryHub.status === "live" &&
      henryHub.value >= 4
    ) {
      gasScore += 1;
      reasons.push(
        "Henry Hub natural gas price is above $4/MMBtu."
      );
    }

    if (
      henryHub.status === "live" &&
      henryHub.value < 3
    ) {
      gasScore -= 1;
      reasons.push(
        "Henry Hub natural gas price is below $3/MMBtu."
      );
    }

    if (
      storageChange.status === "live" &&
      storageChange.signal === "WITHDRAWAL"
    ) {
      gasScore += 1;
      reasons.push(
        "US natural gas storage recorded a withdrawal."
      );
    }

    if (
      storageChange.status === "live" &&
      storageChange.signal === "INJECTION"
    ) {
      gasScore -= 1;
      reasons.push(
        "US natural gas storage recorded an injection."
      );
    }

    let gasBias = "NEUTRAL";

    if (gasScore >= 2) {
      gasBias = "HIGH GAS PRESSURE";
    } else if (gasScore === 1) {
      gasBias = "MILD GAS PRESSURE";
    } else if (gasScore <= -2) {
      gasBias = "LOW GAS PRESSURE";
    } else if (gasScore === -1) {
      gasBias = "SOFTER GAS PRESSURE";
    }

    res.json({
      source: "EIA",

      price: {
        henryHub,
      },

      storage: {
        current: storage,
        change: storageChange,
      },

      supply: {
        production,
      },

      demand: {
        consumption,
      },

      intelligence: {
        gasScore,
        gasBias,
        reasons,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch EIA natural gas data",
      details: error.message,
    });
  }
});

export default router;
