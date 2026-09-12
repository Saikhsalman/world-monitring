import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import newsRoutes from "./routes/news.js";
import fredRoutes from "./routes/fred.js";
import marketRoutes from "./routes/markets.js";
import eiaRoutes from "./routes/eia.js";
import mospiRoutes from "./routes/mospi.js";
import countryRoutes from "./routes/country.js";
import rbiRoutes from "./routes/rbi.js";
import ecbRoutes from "./routes/ecb.js";
import weatherRoutes from "./routes/weather.js";
import flightRoutes from "./routes/flights.js";
import shipRoutes from "./routes/ships.js";
import internetRoutes from "./routes/internet.js";
import intelligenceRoutes from "./routes/intelligence.js";
import aiRoutes from "./routes/ai.js";
import conflictRoutes from "./routes/conflicts.js";

import {
  startShipStream,
} from "./services/shipService.js";

dotenv.config();

const app = express();

const PORT =
  process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
  express.json({
    limit: "5mb",
  })
);

// =====================================================
// START LIVE SHIP STREAM
// =====================================================

startShipStream();

// =====================================================
// HOME
// =====================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      status: "ok",
      message:
        "World Monitor Backend Running",
    });
  }
);

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/news",
  newsRoutes
);

app.use(
  "/api/fred",
  fredRoutes
);

app.use(
  "/api/markets",
  marketRoutes
);

app.use(
  "/api/eia",
  eiaRoutes
);

app.use(
  "/api/rbi",
  rbiRoutes
);

app.use(
  "/api/mospi",
  mospiRoutes
);

app.use(
  "/api/country",
  countryRoutes
);

app.use(
  "/api/ecb",
  ecbRoutes
);

app.use(
  "/api/weather",
  weatherRoutes
);

app.use(
  "/api/flights",
  flightRoutes
);

app.use(
  "/api/ships",
  shipRoutes
);

app.use(
  "/api/internet",
  internetRoutes
);

app.use(
  "/api/intelligence",
  intelligenceRoutes
);

app.use(
  "/api/conflicts",
  conflictRoutes
);


app.use(
  "/api/ai",
  aiRoutes
);
// =====================================================
// 404
// =====================================================

app.use(
  (req, res) => {
    res
      .status(404)
      .json({
        status:
          "error",

        error:
          "Route not found",

        path:
          req.originalUrl,
      });
  }
);

// =====================================================
// SERVER START
// =====================================================

app.listen(
  PORT,"0.0.0.0",
  () => {
    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      " WORLD MONITOR BACKEND RUNNING"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Server: http://localhost:${PORT}`
    );

    console.log(
      `FRED Macro: http://localhost:${PORT}/api/fred/macro`
    );

    console.log(
      `FRED Dollar: http://localhost:${PORT}/api/fred/dollar`
    );

    console.log(
      `FRED US10Y: http://localhost:${PORT}/api/fred/us10y`
    );

    console.log(
      `Global Markets: http://localhost:${PORT}/api/markets/global`
    );

    console.log(
      `EIA Oil: http://localhost:${PORT}/api/eia/oil-prices`
    );

    console.log(
      `EIA Energy: http://localhost:${PORT}/api/eia/energy`
    );

    console.log(
      `EIA Natural Gas: http://localhost:${PORT}/api/eia/natural-gas`
    );

    console.log(
      `RBI Policy Rates: http://localhost:${PORT}/api/rbi/policy-rates`
    );

    console.log(
      `RBI Market Snapshot: http://localhost:${PORT}/api/rbi/market-snapshot`
    );

    console.log(
      `ECB Policy Rates: http://localhost:${PORT}/api/ecb/policy-rates`
    );

    console.log(
      `Country India: http://localhost:${PORT}/api/country/IND`
    );

    console.log(
      `Country USA: http://localhost:${PORT}/api/country/USA`
    );

    console.log(
      `World Weather: http://localhost:${PORT}/api/weather/world`
    );

    console.log(
      `Live Flights: http://localhost:${PORT}/api/flights/live`
    );

    console.log(
      `Live Ships: http://localhost:${PORT}/api/ships/live`
    );

    console.log(
      `Internet Outages: http://localhost:${PORT}/api/internet/outages`
    );

    console.log(
      `Global Risk: http://localhost:${PORT}/api/intelligence/global-risk`
    );

    console.log(
      `Country Intelligence India: http://localhost:${PORT}/api/intelligence/country/IND`
    );

    console.log(
      `Country Intelligence USA: http://localhost:${PORT}/api/intelligence/country/USA`
    );

    console.log(
      `Conflict Intelligence: http://localhost:${PORT}/api/conflicts/live`
    );

    console.log(
      "========================================"
    );
  }
);



