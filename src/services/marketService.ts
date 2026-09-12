export type TwelveMarketItem = {
  label: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  close: number;
  previousClose: number;
  change: number;
  percentChange: number;
  datetime: string;
  timestamp: number | null;
  source: string;
  status: string;
  error?: string;
};

export type VixItem = {
  name: string;
  symbol: string;
  value: number;
  previousClose: number | null;
  change: number | null;
  percentChange: number | null;
  timestamp: string | null;
  source: string;
  status: string;
  error?: string;
};

export type DollarItem = {
  name: string;
  symbol: string;
  value: number;
  date: string;
  unit: string;
  source: string;
  status: string;
};

export type GlobalMarketsData = {
  source: {
    equities: string;
    gold: string;
    volatility: string;
    dollar: string;
  };

  status: string;
  liveCount: number;
  totalCount: number;

  markets: {
    sp500Proxy: TwelveMarketItem;
    nasdaqProxy: TwelveMarketItem;
    gold: TwelveMarketItem;
    vix: VixItem;
    dollar: DollarItem;
  };
};

export async function getGlobalMarkets(): Promise<GlobalMarketsData> {
  const response = await fetch("/api/markets/global");

  if (!response.ok) {
    throw new Error(
      `Global Markets HTTP ${response.status}`
    );
  }

  return response.json();
}
