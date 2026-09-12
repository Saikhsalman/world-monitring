let previousSnapshot = null;
let lastAnalysis = null;

// =====================================================
// WORLD MONITOR
// CHANGE DETECTION ENGINE
// =====================================================

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n)
    ? n
    : null;
}

function percentChange(
  current,
  previous
) {
  if (
    current === null ||
    previous === null ||
    previous === 0
  ) {
    return null;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
}

function buildSnapshot({
  globalRisk,
  macro,
  markets,
  energy,
  internet,
  conflicts,
}) {
  const marketRoot =
    markets?.markets ||
    markets ||
    {};

  return {
    timestamp:
      new Date()
        .toISOString(),

    globalRisk:
      numberOrNull(
        globalRisk
          ?.globalRiskScore
      ),

    globalRiskLevel:
      globalRisk
        ?.globalRiskLevel ??
      null,

    us10y:
      numberOrNull(
        macro
          ?.us10y
          ?.value
      ),

    fedFunds:
      numberOrNull(
        macro
          ?.fedFunds
          ?.value
      ),

    brent:
      numberOrNull(
        energy
          ?.prices
          ?.brent
          ?.value
      ),

    wti:
      numberOrNull(
        energy
          ?.prices
          ?.wti
          ?.value
      ),

    sp500:
      numberOrNull(
        marketRoot
          ?.sp500Proxy
          ?.percentChange ??
        marketRoot
          ?.sp500
          ?.percentChange
      ),

    nasdaq:
      numberOrNull(
        marketRoot
          ?.nasdaqProxy
          ?.percentChange ??
        marketRoot
          ?.nasdaq
          ?.percentChange
      ),

    internetRisk:
      numberOrNull(
        internet
          ?.risk
          ?.score ??
        internet
          ?.riskScore
      ),

    conflictCount:
      numberOrNull(
        conflicts
          ?.conflictCount
      ),

    chokepointCount:
      numberOrNull(
        conflicts
          ?.chokepointCount
      ),
  };
}

function pushChange(
  changes,
  {
    key,
    label,
    current,
    previous,
    unit = "",
    direction,
    severity = "INFO",
  }
) {
  changes.push({
    key,
    label,
    current,
    previous,
    unit,
    direction,
    severity,
  });
}

function detectChanges(
  current,
  previous
) {
  const changes = [];

  if (!previous) {
    return changes;
  }

  if (
    current.globalRisk !== null &&
    previous.globalRisk !== null &&
    current.globalRisk !==
      previous.globalRisk
  ) {
    const diff =
      current.globalRisk -
      previous.globalRisk;

    pushChange(
      changes,
      {
        key:
          "globalRisk",

        label:
          "Global Risk",

        current:
          current.globalRisk,

        previous:
          previous.globalRisk,

        direction:
          diff > 0
            ? "UP"
            : "DOWN",

        severity:
          Math.abs(diff) >= 10
            ? "HIGH"
            : Math.abs(diff) >= 5
              ? "MEDIUM"
              : "LOW",
      }
    );
  }

  if (
    current.brent !== null &&
    previous.brent !== null
  ) {
    const pct =
      percentChange(
        current.brent,
        previous.brent
      );

    if (
      pct !== null &&
      Math.abs(pct) >= 0.5
    ) {
      pushChange(
        changes,
        {
          key:
            "brent",

          label:
            "Brent Crude",

          current:
            current.brent,

          previous:
            previous.brent,

          unit:
            "$/bbl",

          direction:
            pct > 0
              ? "UP"
              : "DOWN",

          severity:
            Math.abs(pct) >= 3
              ? "HIGH"
              : Math.abs(pct) >= 1.5
                ? "MEDIUM"
                : "LOW",
        }
      );
    }
  }

  if (
    current.us10y !== null &&
    previous.us10y !== null
  ) {
    const diff =
      current.us10y -
      previous.us10y;

    if (
      Math.abs(diff) >= 0.05
    ) {
      pushChange(
        changes,
        {
          key:
            "us10y",

          label:
            "US 10Y Yield",

          current:
            current.us10y,

          previous:
            previous.us10y,

          unit:
            "%",

          direction:
            diff > 0
              ? "UP"
              : "DOWN",

          severity:
            Math.abs(diff) >= 0.20
              ? "HIGH"
              : Math.abs(diff) >= 0.10
                ? "MEDIUM"
                : "LOW",
        }
      );
    }
  }

  if (
    current.internetRisk !==
      null &&
    previous.internetRisk !==
      null &&
    current.internetRisk !==
      previous.internetRisk
  ) {
    const diff =
      current.internetRisk -
      previous.internetRisk;

    pushChange(
      changes,
      {
        key:
          "internetRisk",

        label:
          "Internet Risk",

        current:
          current.internetRisk,

        previous:
          previous.internetRisk,

        direction:
          diff > 0
            ? "UP"
            : "DOWN",

        severity:
          Math.abs(diff) >= 20
            ? "HIGH"
            : Math.abs(diff) >= 10
              ? "MEDIUM"
              : "LOW",
      }
    );
  }

  if (
    current.conflictCount !==
      null &&
    previous.conflictCount !==
      null &&
    current.conflictCount !==
      previous.conflictCount
  ) {
    const diff =
      current.conflictCount -
      previous.conflictCount;

    pushChange(
      changes,
      {
        key:
          "conflictCount",

        label:
          "Conflict Events",

        current:
          current.conflictCount,

        previous:
          previous.conflictCount,

        direction:
          diff > 0
            ? "UP"
            : "DOWN",

        severity:
          "HIGH",
      }
    );
  }

  if (
    current.sp500 !== null &&
    previous.sp500 !== null &&
    current.sp500 !==
      previous.sp500
  ) {
    const diff =
      current.sp500 -
      previous.sp500;

    if (
      Math.abs(diff) >= 0.5
    ) {
      pushChange(
        changes,
        {
          key:
            "sp500",

          label:
            "S&P 500",

          current:
            current.sp500,

          previous:
            previous.sp500,

          unit:
            "%",

          direction:
            diff > 0
              ? "UP"
              : "DOWN",

          severity:
            Math.abs(diff) >= 2
              ? "HIGH"
              : Math.abs(diff) >= 1
                ? "MEDIUM"
                : "LOW",
        }
      );
    }
  }

  return changes;
}


function isUsableSnapshot(
  snapshot
) {
  const importantValues = [
    snapshot.globalRisk,
    snapshot.us10y,
    snapshot.fedFunds,
    snapshot.brent,
    snapshot.wti,
    snapshot.sp500,
    snapshot.nasdaq,
    snapshot.internetRisk,
    snapshot.conflictCount,
  ];

  const availableCount =
    importantValues.filter(
      (value) =>
        value !== null &&
        value !== undefined
    ).length;

  return {
    ready:
      availableCount >= 6,

    availableCount,

    totalCount:
      importantValues.length,

    coveragePercent:
      Math.round(
        (
          availableCount /
          importantValues.length
        ) *
        100
      ),
  };
}
export function analyzeChanges(
  data
) {
  const currentSnapshot =
    buildSnapshot(
      data
    );

  const quality =
    isUsableSnapshot(
      currentSnapshot
    );

  // ---------------------------------------------------
  // DO NOT CREATE BASELINE FROM INCOMPLETE LIVE DATA
  // ---------------------------------------------------

  if (!quality.ready) {
    lastAnalysis = {
      status:
        "warming_up",

      previousSnapshot,

      currentSnapshot,

      changeCount:
        0,

      changes:
        [],

      snapshotQuality:
        quality,

      message:
        "Waiting for enough live data before creating baseline.",

      updatedAt:
        new Date()
          .toISOString(),
    };

    return lastAnalysis;
  }

  // ---------------------------------------------------
  // FIRST VALID SNAPSHOT
  // ---------------------------------------------------

  if (!previousSnapshot) {
    previousSnapshot =
      currentSnapshot;

    lastAnalysis = {
      status:
        "baseline_created",

      previousSnapshot:
        null,

      currentSnapshot,

      changeCount:
        0,

      changes:
        [],

      snapshotQuality:
        quality,

      updatedAt:
        new Date()
          .toISOString(),
    };

    return lastAnalysis;
  }

  // ---------------------------------------------------
  // COMPARE WITH PREVIOUS VALID SNAPSHOT
  // ---------------------------------------------------

  const changes =
    detectChanges(
      currentSnapshot,
      previousSnapshot
    );

  const oldSnapshot =
    previousSnapshot;

  previousSnapshot =
    currentSnapshot;

  lastAnalysis = {
    status:
      "ready",

    previousSnapshot:
      oldSnapshot,

    currentSnapshot,

    changeCount:
      changes.length,

    changes,

    snapshotQuality:
      quality,

    updatedAt:
      new Date()
        .toISOString(),
  };

  return lastAnalysis;
}

export function getLatestChangeAnalysis() {
  return lastAnalysis;
}



