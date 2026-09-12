type MacroItem = {
  name: string;
  series: string;
  value: number;
  unit: string;
  date: string;
};

type InflationItem = MacroItem & {
  latestCpi?: number;
  previousYearCpi?: number;
};

type MacroData = {
  source: string;
  us10y: MacroItem;
  fedFunds: MacroItem;
  inflation: InflationItem;
  unemployment: MacroItem;
  dollarIndex: MacroItem;
};

type Props = {
  macro: MacroData | null;
  macroLoading: boolean;
  macroError: string;
};

function GlobalMacroCard({
  macro,
  macroLoading,
  macroError,
}: Props) {
  const showMacroValue = (
    item: MacroItem | undefined,
    decimals = 2
  ) => {
    if (macroLoading) {
      return "Loading...";
    }

    if (!item) {
      return macroError || "Unavailable";
    }

    return `${item.value.toFixed(decimals)}${
      item.unit === "%" ? "%" : ""
    }`;
  };

  return (
    <div className="card">
      <div className="card-heading">
        <h3>🌎 Global Macro</h3>

        <span>
          {macroLoading
            ? "CONNECTING"
            : macroError
              ? "UNAVAILABLE"
              : "LIVE • FRED"}
        </span>
      </div>

      <div className="data-row">
        <span>
          US 10Y Yield
          <small className="market-source">
            {macro?.us10y.date || "FRED"}
          </small>
        </span>

        <strong className="warning">
          {showMacroValue(
            macro?.us10y,
            2
          )}
        </strong>
      </div>

      <div className="data-row">
        <span>
          Fed Funds Rate
          <small className="market-source">
            {macro?.fedFunds.date || "FRED"}
          </small>
        </span>

        <strong>
          {showMacroValue(
            macro?.fedFunds,
            2
          )}
        </strong>
      </div>

      <div className="data-row">
        <span>
          US Inflation YoY
          <small className="market-source">
            {macro?.inflation.date || "FRED"}
          </small>
        </span>

        <strong className="warning">
          {showMacroValue(
            macro?.inflation,
            2
          )}
        </strong>
      </div>

      <div className="data-row">
        <span>
          US Unemployment
          <small className="market-source">
            {macro?.unemployment.date || "FRED"}
          </small>
        </span>

        <strong>
          {showMacroValue(
            macro?.unemployment,
            1
          )}
        </strong>
      </div>

      <div className="data-row">
        <span>
          Dollar Index
          <small className="market-source">
            {macro?.dollarIndex.date || "FRED"}
          </small>
        </span>

        <strong className="warning">
          {showMacroValue(
            macro?.dollarIndex,
            4
          )}
        </strong>
      </div>

      {macroError && (
        <div className="news-item high">
          {macroError}
        </div>
      )}
    </div>
  );
}

export default GlobalMacroCard;