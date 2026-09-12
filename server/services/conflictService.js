// =====================================================
// WORLD MONITOR
// CONFLICT / GEOPOLITICAL INTELLIGENCE SERVICE
// =====================================================

const CONFLICTS = [
  {
    id: "ukraine-war",
    name: "Russia–Ukraine War",
    region: "Eastern Europe",
    type: "CONFLICT",
    severity: "CRITICAL",
    latitude: 48.5,
    longitude: 31.2,
    countries: [
      "Ukraine",
      "Russia",
    ],
    description:
      "Active interstate conflict with major geopolitical and market implications.",
    marketImpact:
      "Energy, grains, defense, European risk sentiment",
    status: "ACTIVE",
  },

  {
    id: "israel-gaza",
    name: "Israel–Gaza Conflict",
    region: "Middle East",
    type: "CONFLICT",
    severity: "CRITICAL",
    latitude: 31.5,
    longitude: 34.5,
    countries: [
      "Israel",
      "Palestinian Territories",
    ],
    description:
      "High-intensity regional conflict with wider Middle East escalation risk.",
    marketImpact:
      "Oil, shipping, defense, regional risk",
    status: "ACTIVE",
  },

  {
    id: "red-sea",
    name: "Red Sea Shipping Risk",
    region: "Red Sea",
    type: "SHIPPING_RISK",
    severity: "HIGH",
    latitude: 15.5,
    longitude: 42.5,
    countries: [
      "Yemen",
      "Saudi Arabia",
      "Djibouti",
    ],
    description:
      "Security risk affecting commercial shipping routes through the Red Sea.",
    marketImpact:
      "Freight, oil, supply chains, insurance",
    status: "ACTIVE",
  },

  {
    id: "taiwan-strait",
    name: "Taiwan Strait Tension",
    region: "East Asia",
    type: "GEOPOLITICAL_TENSION",
    severity: "HIGH",
    latitude: 24.2,
    longitude: 120.5,
    countries: [
      "China",
      "Taiwan",
    ],
    description:
      "Persistent military and geopolitical tension around the Taiwan Strait.",
    marketImpact:
      "Semiconductors, shipping, Asian equities",
    status: "MONITOR",
  },

  {
    id: "korean-peninsula",
    name: "Korean Peninsula Tension",
    region: "East Asia",
    type: "GEOPOLITICAL_TENSION",
    severity: "HIGH",
    latitude: 38.0,
    longitude: 127.0,
    countries: [
      "North Korea",
      "South Korea",
    ],
    description:
      "Ongoing military and nuclear security risk.",
    marketImpact:
      "Asian risk sentiment, defense, currencies",
    status: "MONITOR",
  },

  {
    id: "india-pakistan",
    name: "India–Pakistan Tension",
    region: "South Asia",
    type: "GEOPOLITICAL_TENSION",
    severity: "MEDIUM",
    latitude: 32.5,
    longitude: 74.5,
    countries: [
      "India",
      "Pakistan",
    ],
    description:
      "Persistent strategic and border-related geopolitical risk.",
    marketImpact:
      "Regional sentiment, defense, currencies",
    status: "MONITOR",
  },
];

const CHOKEPOINTS = [
  {
    id: "hormuz",
    name: "Strait of Hormuz",
    region: "Persian Gulf",
    type: "CHOKEPOINT",
    severity: "CRITICAL",
    latitude: 26.5,
    longitude: 56.3,
    description:
      "Major global oil and LNG transit chokepoint.",
    marketImpact:
      "Crude oil, LNG, tanker freight",
    status: "STRATEGIC",
  },

  {
    id: "suez",
    name: "Suez Canal",
    region: "Egypt",
    type: "CHOKEPOINT",
    severity: "HIGH",
    latitude: 30.4,
    longitude: 32.4,
    description:
      "Key Europe–Asia maritime trade corridor.",
    marketImpact:
      "Container shipping, freight, energy",
    status: "STRATEGIC",
  },

  {
    id: "bab-el-mandeb",
    name: "Bab-el-Mandeb",
    region: "Red Sea",
    type: "CHOKEPOINT",
    severity: "HIGH",
    latitude: 12.6,
    longitude: 43.3,
    description:
      "Critical maritime gateway between the Red Sea and Gulf of Aden.",
    marketImpact:
      "Oil, shipping, global supply chains",
    status: "STRATEGIC",
  },

  {
    id: "malacca",
    name: "Strait of Malacca",
    region: "Southeast Asia",
    type: "CHOKEPOINT",
    severity: "HIGH",
    latitude: 2.8,
    longitude: 101.1,
    description:
      "One of the world's most important commercial shipping routes.",
    marketImpact:
      "Asian trade, oil, LNG, freight",
    status: "STRATEGIC",
  },

  {
    id: "panama",
    name: "Panama Canal",
    region: "Central America",
    type: "CHOKEPOINT",
    severity: "MEDIUM",
    latitude: 9.1,
    longitude: -79.7,
    description:
      "Major Atlantic–Pacific shipping corridor.",
    marketImpact:
      "Freight, commodities, container shipping",
    status: "STRATEGIC",
  },
];

function severityScore(
  severity
) {
  switch (severity) {
    case "CRITICAL":
      return 90;

    case "HIGH":
      return 70;

    case "MEDIUM":
      return 45;

    default:
      return 20;
  }
}

export function getConflictIntelligence() {
  const events = [
    ...CONFLICTS,
    ...CHOKEPOINTS,
  ];

  const riskScores =
    events.map(
      (event) =>
        severityScore(
          event.severity
        )
    );

  const averageRisk =
    riskScores.length
      ? riskScores.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        riskScores.length
      : 0;

  return {
    status: "live",
    source:
      "World Monitor Geopolitical Intelligence",

    count:
      events.length,

    conflictCount:
      CONFLICTS.length,

    chokepointCount:
      CHOKEPOINTS.length,

    risk: {
      score:
        Number(
          averageRisk.toFixed(
            1
          )
        ),

      level:
        averageRisk >= 75
          ? "CRITICAL"
          : averageRisk >= 50
            ? "HIGH"
            : averageRisk >= 25
              ? "MEDIUM"
              : "LOW",
    },

    events,

    updatedAt:
      new Date()
        .toISOString(),
  };
}
