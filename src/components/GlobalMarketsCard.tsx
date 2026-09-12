import type {
  GlobalMarketsData,
} from "../services/marketService";

type EnergyPriceItem = {
  name: string;
  series: string;
  status: string;
  value?: number;
  unit?: string;
  date?: string;
  error?: string;
};

type EnergyData = {
  prices: {
    wti: EnergyPriceItem;
    brent: EnergyPriceItem;
  };
};

type Props = {
  globalMarkets: GlobalMarketsData | null;
  marketsLoading: boolean;
  marketsError: string;

  energy: EnergyData | null;
  energyLoading: boolean;

  getMarketClass: (
    value?: number | null
  ) => string;
};

function GlobalMarketsCard({
  globalMarkets,
  marketsLoading,
  marketsError,
  energy,
  energyLoading,
  getMarketClass,
}: Props) {
  const showEnergyValue = (
    item?: EnergyPriceItem,
    decimals = 2
  ) => {
    if (
      !item ||
      item.status !== "live" ||
      item.value === undefined
    ) {
      return "Unavailable";
    }

    return item.value.toFixed(decimals);
  };

  return (
    <div className="card">
      <div className="card-heading">
        <h3>📊 Global Markets</h3>

        <span>
          {marketsLoading
            ? "CONNECTING"
            : globalMarkets?.status === "live"
              ? "LIVE"
              : globalMarkets?.status === "partial"
                ? "PARTIAL"
                : "UNAVAILABLE"}
        </span>
      </div>

      <div className="data-row">
        <span>
          S&P 500 Proxy
          <small className="market-source">
            SPY • Twelve Data
          </small>
        </span>

        <strong
          className={getMarketClass(
            globalMarkets?.markets
              .sp500Proxy.percentChange
          )}
        >
          {globalMarkets?.markets
            .sp500Proxy.status === "live"
            ? `${globalMarkets.markets.sp500Proxy.close.toFixed(
                2
              )} (${
                globalMarkets.markets
                  .sp500Proxy.percentChange >= 0
                  ? "+"
                  : ""
              }${globalMarkets.markets.sp500Proxy.percentChange.toFixed(
                2
              )}%)`
            : marketsLoading
              ? "Loading..."
              : "Unavailable"}
        </strong>
      </div>

      <div className="data-row">
        <span>
          Nasdaq-100 Proxy
          <small className="market-source">
            QQQ • Twelve Data
          </small>
        </span>

        <strong
          className={getMarketClass(
            globalMarkets?.markets
              .nasdaqProxy.percentChange
          )}
        >
          {globalMarkets?.markets
            .nasdaqProxy.status === "live"
            ? `${globalMarkets.markets.nasdaqProxy.close.toFixed(
                2
              )} (${
                globalMarkets.markets
                  .nasdaqProxy.percentChange >= 0
                  ? "+"
                  : ""
              }${globalMarkets.markets.nasdaqProxy.percentChange.toFixed(
                2
              )}%)`
            : marketsLoading
              ? "Loading..."
              : "Unavailable"}
        </strong>
      </div>

      <div className="data-row">
        <span>
          VIX
          <small className="market-source">
            CBOE
          </small>
        </span>

        <strong
          className={getMarketClass(
            globalMarkets?.markets.vix
              .percentChange
          )}
        >
          {globalMarkets?.markets.vix
            .status === "live"
            ? `${globalMarkets.markets.vix.value.toFixed(
                2
              )}${
                globalMarkets.markets.vix
                  .percentChange !== null
                  ? ` (${
                      globalMarkets.markets.vix
                        .percentChange >= 0
                        ? "+"
                        : ""
                    }${globalMarkets.markets.vix.percentChange.toFixed(
                      2
                    )}%)`
                  : ""
              }`
            : marketsLoading
              ? "Loading..."
              : "Unavailable"}
        </strong>
      </div>

      <div className="data-row">
        <span>
          Gold
          <small className="market-source">
            XAU/USD • Twelve Data
          </small>
        </span>

        <strong
          className={getMarketClass(
            globalMarkets?.markets.gold
              .percentChange
          )}
        >
          {globalMarkets?.markets.gold
            .status === "live"
            ? `$${globalMarkets.markets.gold.close.toFixed(
                2
              )} (${
                globalMarkets.markets.gold
                  .percentChange >= 0
                  ? "+"
                  : ""
              }${globalMarkets.markets.gold.percentChange.toFixed(
                2
              )}%)`
            : marketsLoading
              ? "Loading..."
              : "Unavailable"}
        </strong>
      </div>

      <div className="data-row">
        <span>
          Dollar Strength
          <small className="market-source">
            DTWEXBGS • FRED
          </small>
        </span>

        <strong className="warning">
          {globalMarkets?.markets.dollar
            .status === "live"
            ? globalMarkets.markets.dollar.value.toFixed(
                4
              )
            : marketsLoading
              ? "Loading..."
              : "Unavailable"}
        </strong>
      </div>

      <div className="data-row">
        <span>WTI Crude</span>

        <strong className="warning">
          {energy?.prices.wti.status === "live"
            ? `$${showEnergyValue(
                energy.prices.wti
              )}`
            : energyLoading
              ? "Loading..."
              : "Unavailable"}
        </strong>
      </div>

      <div className="data-row">
        <span>Brent Crude</span>

        <strong className="warning">
          {energy?.prices.brent.status ===
          "live"
            ? `$${showEnergyValue(
                energy.prices.brent
              )}`
            : energyLoading
              ? "Loading..."
              : "Unavailable"}
        </strong>
      </div>

      {marketsError && (
        <div className="news-item high">
          {marketsError}
        </div>
      )}
    </div>
  );
}

export default GlobalMarketsCard;