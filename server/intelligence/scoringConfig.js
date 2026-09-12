export const RISK_WEIGHTS = {
  macro: 0.20,
  market: 0.20,
  energy: 0.15,
  internet: 0.10,
  weather: 0.10,
  geopolitical: 0.25,
};

export const RISK_LEVELS = {
  LOW: {
    min: 0,
    max: 24,
  },

  MEDIUM: {
    min: 25,
    max: 49,
  },

  HIGH: {
    min: 50,
    max: 74,
  },

  CRITICAL: {
    min: 75,
    max: 100,
  },
};

export function getRiskLevel(
  score
) {
  if (score >= 75) {
    return "CRITICAL";
  }

  if (score >= 50) {
    return "HIGH";
  }

  if (score >= 25) {
    return "MEDIUM";
  }

  return "LOW";
}

export function clampRiskScore(
  score
) {
  if (
    !Number.isFinite(score)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
  );
}
