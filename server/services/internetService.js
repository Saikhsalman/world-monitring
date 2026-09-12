const CLOUDFLARE_BASE_URL =
  "https://api.cloudflare.com/client/v4";

// =====================================================
// HELPERS
// =====================================================

function normalizeOutage(
  item
) {
  const locations =
    Array.isArray(
      item?.locationsDetails
    )
      ? item.locationsDetails
      : [];

  const primaryLocation =
    locations[0] || null;

  return {
    id:
      item?.id || null,

    eventType:
      item?.eventType ||
      "OUTAGE",

    description:
      item?.description ||
      "",

    startDate:
      item?.startDate ||
      null,

    endDate:
      item?.endDate ||
      null,

    outageType:
      item?.outage
        ?.outageType ||
      null,

    outageCause:
      item?.outage
        ?.outageCause ||
      null,

    scope:
      item?.scope ||
      null,

    countryCode:
      primaryLocation
        ?.code ||
      null,

    countryName:
      primaryLocation
        ?.name ||
      null,

    locations:
      locations.map(
        (location) => ({
          code:
            location?.code ||
            null,

          name:
            location?.name ||
            null,
        })
      ),

    asns:
      Array.isArray(
        item?.asns
      )
        ? item.asns
        : [],

    tags:
      Array.isArray(
        item?.tags
      )
        ? item.tags
        : [],

    source:
      "Cloudflare Radar",

    linkedUrl:
      item?.linkedUrl ||
      null,
  };
}

// =====================================================
// RISK SCORE
// =====================================================

function calculateInternetRisk(
  outages
) {
  let score = 0;

  let cableCuts = 0;
  let cyberattacks = 0;
  let military = 0;
  let power = 0;

  for (
    const outage
    of outages
  ) {
    score += 8;

    const cause =
      String(
        outage.outageCause ||
        ""
      )
        .toUpperCase();

    if (
      cause.includes(
        "CABLE"
      )
    ) {
      score += 20;
      cableCuts++;
    }

    if (
      cause.includes(
        "CYBER"
      )
    ) {
      score += 20;
      cyberattacks++;
    }

    if (
      cause.includes(
        "MILITARY"
      )
    ) {
      score += 25;
      military++;
    }

    if (
      cause.includes(
        "POWER"
      )
    ) {
      score += 12;
      power++;
    }
  }

  score =
    Math.min(
      100,
      score
    );

  let level =
    "LOW";

  if (score >= 70) {
    level =
      "CRITICAL";
  } else if (
    score >= 50
  ) {
    level =
      "HIGH";
  } else if (
    score >= 25
  ) {
    level =
      "MEDIUM";
  }

  return {
    score,
    level,
    cableCuts,
    cyberattacks,
    military,
    power,
  };
}

// =====================================================
// FETCH OUTAGES
// =====================================================

export async function getInternetOutages() {
  const token =
    process.env
      .CLOUDFLARE_API_TOKEN;

  if (!token) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN missing"
    );
  }

  const url =
    `${CLOUDFLARE_BASE_URL}` +
    `/radar/annotations/outages` +
    `?dateRange=7d`;

  const response =
    await fetch(
      url,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Cloudflare HTTP ${response.status}: ${errorText}`
    );
  }

  const data =
    await response.json();

  const raw =
    Array.isArray(
      data?.result
        ?.annotations
    )
      ? data.result
          .annotations
      : [];

  const outages =
    raw.map(
      normalizeOutage
    );

  const risk =
    calculateInternetRisk(
      outages
    );

  return {
    status:
      outages.length > 0
        ? "live"
        : "no_recent_outages",

    source:
      "Cloudflare Radar",

    period:
      "7d",

    count:
      outages.length,

    risk,

    outages,

    updatedAt:
      new Date()
        .toISOString(),
  };
}
