import {
  getConflictIntelligence,
} from "../services/conflictService.js";

// =====================================================
// WORLD MONITOR
// IMPACT / CAUSE-EFFECT ENGINE
// =====================================================
//
// PURPOSE:
//
// Conflict / chokepoint event
//        ↓
// Commodity / trade impact
//        ↓
// Country exposure
//        ↓
// Macro / market impact
//
// This is a deterministic research engine.
// =====================================================


// =====================================================
// COUNTRY EXPOSURE CONFIG
// =====================================================

const COUNTRY_EXPOSURES = {
  IND: {
    name: "India",

    oilImportExposure:
      "VERY_HIGH",

    gasImportExposure:
      "HIGH",

    shippingExposure:
      "HIGH",

    semiconductorExposure:
      "HIGH",

    foodImportExposure:
      "MEDIUM",

    marketSensitivity:
      "HIGH",
  },

  CHN: {
    name: "China",

    oilImportExposure:
      "VERY_HIGH",

    gasImportExposure:
      "HIGH",

    shippingExposure:
      "VERY_HIGH",

    semiconductorExposure:
      "HIGH",

    foodImportExposure:
      "MEDIUM",

    marketSensitivity:
      "HIGH",
  },

  JPN: {
    name: "Japan",

    oilImportExposure:
      "VERY_HIGH",

    gasImportExposure:
      "VERY_HIGH",

    shippingExposure:
      "VERY_HIGH",

    semiconductorExposure:
      "HIGH",

    foodImportExposure:
      "MEDIUM",

    marketSensitivity:
      "HIGH",
  },

  KOR: {
    name: "South Korea",

    oilImportExposure:
      "VERY_HIGH",

    gasImportExposure:
      "VERY_HIGH",

    shippingExposure:
      "VERY_HIGH",

    semiconductorExposure:
      "VERY_HIGH",

    foodImportExposure:
      "LOW",

    marketSensitivity:
      "HIGH",
  },

  USA: {
    name: "United States",

    oilImportExposure:
      "MEDIUM",

    gasImportExposure:
      "LOW",

    shippingExposure:
      "HIGH",

    semiconductorExposure:
      "HIGH",

    foodImportExposure:
      "LOW",

    marketSensitivity:
      "HIGH",
  },

  DEU: {
    name: "Germany",

    oilImportExposure:
      "HIGH",

    gasImportExposure:
      "HIGH",

    shippingExposure:
      "HIGH",

    semiconductorExposure:
      "HIGH",

    foodImportExposure:
      "MEDIUM",

    marketSensitivity:
      "HIGH",
  },

  GBR: {
    name: "United Kingdom",

    oilImportExposure:
      "MEDIUM",

    gasImportExposure:
      "MEDIUM",

    shippingExposure:
      "HIGH",

    semiconductorExposure:
      "MEDIUM",

    foodImportExposure:
      "MEDIUM",

    marketSensitivity:
      "HIGH",
  },
};


// =====================================================
// EVENT IMPACT RULES
// =====================================================

const EVENT_RULES = {
  hormuz: {
    channels: [
      {
        id: "oil",
        label:
          "Crude Oil Supply",
        severity:
          "CRITICAL",
      },

      {
        id: "lng",
        label:
          "LNG Supply",
        severity:
          "HIGH",
      },

      {
        id: "shipping",
        label:
          "Tanker Shipping",
        severity:
          "CRITICAL",
      },
    ],

    countries: [
      "IND",
      "CHN",
      "JPN",
      "KOR",
      "DEU",
    ],
  },

  suez: {
    channels: [
      {
        id: "shipping",
        label:
          "Global Shipping",
        severity:
          "HIGH",
      },

      {
        id: "freight",
        label:
          "Freight Costs",
        severity:
          "HIGH",
      },

      {
        id: "energy",
        label:
          "Energy Transit",
        severity:
          "MEDIUM",
      },
    ],

    countries: [
      "IND",
      "CHN",
      "DEU",
      "GBR",
    ],
  },

  "bab-el-mandeb": {
    channels: [
      {
        id: "shipping",
        label:
          "Red Sea Shipping",
        severity:
          "CRITICAL",
      },

      {
        id: "freight",
        label:
          "Freight Costs",
        severity:
          "HIGH",
      },

      {
        id: "oil",
        label:
          "Oil Transit",
        severity:
          "HIGH",
      },
    ],

    countries: [
      "IND",
      "CHN",
      "JPN",
      "DEU",
      "GBR",
    ],
  },

  malacca: {
    channels: [
      {
        id: "shipping",
        label:
          "Asian Shipping",
        severity:
          "CRITICAL",
      },

      {
        id: "oil",
        label:
          "Asian Oil Transit",
        severity:
          "HIGH",
      },

      {
        id: "lng",
        label:
          "Asian LNG Transit",
        severity:
          "HIGH",
      },
    ],

    countries: [
      "IND",
      "CHN",
      "JPN",
      "KOR",
    ],
  },

  panama: {
    channels: [
      {
        id: "shipping",
        label:
          "Global Shipping",
        severity:
          "MEDIUM",
      },

      {
        id: "freight",
        label:
          "Freight Costs",
        severity:
          "MEDIUM",
      },

      {
        id: "commodities",
        label:
          "Commodity Transit",
        severity:
          "MEDIUM",
      },
    ],

    countries: [
      "USA",
      "CHN",
      "JPN",
    ],
  },

  "red-sea": {
    channels: [
      {
        id: "shipping",
        label:
          "Red Sea Shipping",
        severity:
          "CRITICAL",
      },

      {
        id: "freight",
        label:
          "Freight Costs",
        severity:
          "HIGH",
      },

      {
        id: "oil",
        label:
          "Energy Transit",
        severity:
          "HIGH",
      },
    ],

    countries: [
      "IND",
      "CHN",
      "DEU",
      "GBR",
    ],
  },

  "taiwan-strait": {
    channels: [
      {
        id: "semiconductors",
        label:
          "Semiconductor Supply",
        severity:
          "CRITICAL",
      },

      {
        id: "shipping",
        label:
          "Asian Shipping",
        severity:
          "HIGH",
      },

      {
        id: "technology",
        label:
          "Technology Supply Chain",
        severity:
          "CRITICAL",
      },
    ],

    countries: [
      "CHN",
      "JPN",
      "KOR",
      "USA",
      "IND",
    ],
  },

  "ukraine-war": {
    channels: [
      {
        id: "energy",
        label:
          "European Energy",
        severity:
          "HIGH",
      },

      {
        id: "food",
        label:
          "Grain Supply",
        severity:
          "HIGH",
      },

      {
        id: "defense",
        label:
          "Defense Spending",
        severity:
          "HIGH",
      },
    ],

    countries: [
      "DEU",
      "GBR",
      "IND",
      "CHN",
      "USA",
    ],
  },

  "israel-gaza": {
    channels: [
      {
        id: "geopolitics",
        label:
          "Middle East Risk",
        severity:
          "CRITICAL",
      },

      {
        id: "oil",
        label:
          "Oil Risk Premium",
        severity:
          "HIGH",
      },

      {
        id: "shipping",
        label:
          "Regional Shipping",
        severity:
          "HIGH",
      },
    ],

    countries: [
      "IND",
      "CHN",
      "JPN",
      "DEU",
      "USA",
    ],
  },
};


// =====================================================
// SCORE HELPERS
// =====================================================

function severityScore(
  severity
) {
  switch (
    String(
      severity || ""
    ).toUpperCase()
  ) {
    case "CRITICAL":
      return 90;

    case "HIGH":
      return 70;

    case "MEDIUM":
      return 45;

    case "LOW":
      return 20;

    default:
      return 30;
  }
}


function exposureScore(
  exposure
) {
  switch (
    String(
      exposure || ""
    ).toUpperCase()
  ) {
    case "VERY_HIGH":
      return 1;

    case "HIGH":
      return 0.8;

    case "MEDIUM":
      return 0.55;

    case "LOW":
      return 0.3;

    default:
      return 0.4;
  }
}


// =====================================================
// CHANNEL → EXPOSURE MAPPING
// =====================================================

function getChannelExposure(
  country,
  channelId
) {
  switch (
    channelId
  ) {
    case "oil":
    case "energy":
      return country
        .oilImportExposure;

    case "lng":
      return country
        .gasImportExposure;

    case "shipping":
    case "freight":
    case "commodities":
      return country
        .shippingExposure;

    case "semiconductors":
    case "technology":
      return country
        .semiconductorExposure;

    case "food":
      return country
        .foodImportExposure;

    case "defense":
    case "geopolitics":
      return country
        .marketSensitivity;

    default:
      return country
        .marketSensitivity;
  }
}


// =====================================================
// COUNTRY CONSEQUENCES
// =====================================================

function getCountryConsequences(
  countryCode,
  channelId
) {
  if (
    countryCode === "IND"
  ) {
    switch (
      channelId
    ) {
      case "oil":
      case "energy":
        return [
          "Import bill risk rises",
          "INR pressure can increase",
          "Inflation risk can rise",
          "Aviation and oil-sensitive sectors may face pressure",
        ];

      case "lng":
        return [
          "Gas import costs can rise",
          "Fertilizer and power costs may increase",
          "Industrial margins may face pressure",
        ];

      case "shipping":
      case "freight":
        return [
          "Freight costs can rise",
          "Import delivery times can increase",
          "Exporter and importer margins may be affected",
        ];

      case "semiconductors":
      case "technology":
        return [
          "Electronics supply-chain risk rises",
          "Auto and electronics production may face delays",
          "Technology hardware costs can increase",
        ];

      default:
        return [
          "Market volatility can rise",
          "Risk sentiment may weaken",
        ];
    }
  }

  switch (
    channelId
  ) {
    case "oil":
    case "energy":
      return [
        "Energy costs may rise",
        "Inflation risk may increase",
        "Risk sentiment may weaken",
      ];

    case "shipping":
    case "freight":
      return [
        "Shipping costs may rise",
        "Supply-chain delays may increase",
      ];

    case "semiconductors":
    case "technology":
      return [
        "Technology supply-chain risk rises",
        "Industrial production may be affected",
      ];

    default:
      return [
        "Market volatility may increase",
      ];
  }
}


// =====================================================
// BUILD COUNTRY IMPACT
// =====================================================

function buildCountryImpact(
  countryCode,
  channels
) {
  const country =
    COUNTRY_EXPOSURES[
      countryCode
    ];

  if (!country) {
    return null;
  }

  const channelImpacts =
    channels.map(
      (channel) => {
        const exposure =
          getChannelExposure(
            country,
            channel.id
          );

        const score =
          severityScore(
            channel.severity
          ) *
          exposureScore(
            exposure
          );

        return {
          channel:
            channel.id,

          label:
            channel.label,

          exposure,

          score:
            Number(
              score.toFixed(
                1
              )
            ),

          consequences:
            getCountryConsequences(
              countryCode,
              channel.id
            ),
        };
      }
    );

  const impactScore =
    channelImpacts.length
      ? channelImpacts.reduce(
          (
            total,
            item
          ) =>
            total +
            item.score,
          0
        ) /
        channelImpacts.length
      : 0;

  const level =
    impactScore >= 75
      ? "CRITICAL"
      : impactScore >= 55
        ? "HIGH"
        : impactScore >= 30
          ? "MEDIUM"
          : "LOW";

  return {
    countryCode,

    countryName:
      country.name,

    impactScore:
      Number(
        impactScore.toFixed(
          1
        )
      ),

    impactLevel:
      level,

    channels:
      channelImpacts,
  };
}


// =====================================================
// BUILD IMPACT LINES
// =====================================================

function buildImpactLines(
  event,
  countries
) {
  return countries
    .map(
      (countryCode) => {
        const country =
          COUNTRY_EXPOSURES[
            countryCode
          ];

        if (!country) {
          return null;
        }

        return {
          from: {
            id:
              event.id,

            name:
              event.name,

            latitude:
              event.latitude,

            longitude:
              event.longitude,
          },

          to: {
            countryCode,

            countryName:
              country.name,
          },
        };
      }
    )
    .filter(Boolean);
}


// =====================================================
// MAIN ENGINE
// =====================================================

export function getEventImpact(
  eventId
) {
  const intelligence =
    getConflictIntelligence();

  const event =
    intelligence.events.find(
      (item) =>
        item.id ===
        eventId
    );

  if (!event) {
    return {
      status:
        "not_found",

      eventId,

      error:
        "Impact event not found",
    };
  }

  const rule =
    EVENT_RULES[
      event.id
    ];

  if (!rule) {
    return {
      status:
        "unsupported",

      event,

      error:
        "No impact rule configured for this event",
    };
  }

  const countryImpacts =
    rule.countries
      .map(
        (countryCode) =>
          buildCountryImpact(
            countryCode,
            rule.channels
          )
      )
      .filter(Boolean)
      .sort(
        (
          a,
          b
        ) =>
          b.impactScore -
          a.impactScore
      );

  return {
    status:
      "ready",

    engine:
      "World Monitor Impact Engine",

    event,

    channels:
      rule.channels,

    affectedCountries:
      countryImpacts,

    impactLines:
      buildImpactLines(
        event,
        rule.countries
      ),

    summary: {
      affectedCountryCount:
        countryImpacts.length,

      highestImpactCountry:
        countryImpacts[0] ||
        null,

      highestImpactScore:
        countryImpacts[0]
          ?.impactScore ??
        null,
    },

    methodology:
      "Event severity × country exposure model",

    updatedAt:
      new Date()
        .toISOString(),
  };
}


// =====================================================
// AVAILABLE IMPACT EVENTS
// =====================================================

export function getImpactEvents() {
  const intelligence =
    getConflictIntelligence();

  const events =
    intelligence.events
      .filter(
        (event) =>
          Boolean(
            EVENT_RULES[
              event.id
            ]
          )
      )
      .map(
        (event) => ({
          id:
            event.id,

          name:
            event.name,

          type:
            event.type,

          severity:
            event.severity,

          region:
            event.region,

          latitude:
            event.latitude,

          longitude:
            event.longitude,
        })
      );

  return {
    status:
      "ready",

    count:
      events.length,

    events,

    updatedAt:
      new Date()
        .toISOString(),
  };
}
