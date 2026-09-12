import { API_BASE_URL } from "../config";
export type RbiRateItem = {
  name: string;
  value: number | null;
  unit: string;
};

export type RbiPolicyRatesData = {
  source: string;
  sourceUrl?: string;
  status: string;
  foundCount?: number;
  totalCount?: number;
  updatedAt: string;

  rates: {
    repoRate?: RbiRateItem;
    standingDepositFacility?: RbiRateItem;
    marginalStandingFacility?: RbiRateItem;
    bankRate?: RbiRateItem;
    fixedReverseRepoRate?: RbiRateItem;
  };
};

export type RbiMarketSnapshotData = {
  source: string;
  status: string;

  governmentSecurities?: {
    tenYearProxy?: {
      name: string;
      security: string;
      value: number | null;
      unit: string;
    };
  };

  markets?: {
    nifty50?: {
      name: string;
      value: number | null;
    };

    sensex?: {
      name: string;
      value: number | null;
    };
  };

  exchangeRates?: {
    usdInr?: {
      name: string;
      value: number | null;
      unit: string;
    };

    gbpInr?: {
      name: string;
      value: number | null;
      unit: string;
    };

    eurInr?: {
      name: string;
      value: number | null;
      unit: string;
    };

    jpyInr?: {
      name: string;
      value: number | null;
      unit: string;
    };

    aedInr?: {
      name: string;
      value: number | null;
      unit: string;
    };
  };

  marketDate?: string | null;
  exchangeRateDate?: string | null;
  exchangeRateSource?: string | null;

  updatedAt: string;
};

export async function getRbiPolicyRates(): Promise<RbiPolicyRatesData> {
  const response = await fetch(
    `${API_BASE_URL}/api/rbi/policy-rates`
  );

  if (!response.ok) {
    throw new Error(
      `RBI Policy Rates HTTP ${response.status}`
    );
  }

  const data: RbiPolicyRatesData =
    await response.json();

  return data;
}

export async function getRbiMarketSnapshot(): Promise<RbiMarketSnapshotData> {
  const response = await fetch(
    "/api/rbi/market-snapshot"
  );

  if (!response.ok) {
    throw new Error(
      `RBI Market Snapshot HTTP ${response.status}`
    );
  }

  const data: RbiMarketSnapshotData =
    await response.json();

  return data;
}
