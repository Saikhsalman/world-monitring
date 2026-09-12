type EnergyItem = {
  name: string;
  series: string;
  value?: number;
  unit?: string;
  date?: string;
  status: string;
  error?: string;
};

type GasStorageChange = {
  status: string;

  latest?: {
    value: number;
    date: string;
  };

  previous?: {
    value: number;
    date: string;
  };

  change?: number;
  unit?: string;
  signal?: string;
  error?: string;
};

type NaturalGasData = {
  source: string;

  price: {
    henryHub: EnergyItem;
  };

  storage: {
    current: EnergyItem;
    change: GasStorageChange;
  };

  supply: {
    production: EnergyItem;
  };

  demand: {
    consumption: EnergyItem;
  };

  intelligence: {
    gasScore: number;
    gasBias: string;
    reasons: string[];
  };
};

type Props = {
  naturalGas: NaturalGasData | null;
  gasLoading: boolean;
  gasError: string;
};

function NaturalGasSection({
  naturalGas,
  gasLoading,
  gasError,
}: Props) {
  const showEnergyValue = (
    item: EnergyItem | undefined,
    decimals = 2
  ) => {
    if (!item) {
      return "Loading...";
    }

    if (
      item.status !== "live" ||
      item.value === undefined
    ) {
      return "Unavailable";
    }

    return item.value.toFixed(decimals);
  };

  const getInventoryClass = (
    signal?: string
  ) => {
    if (
      signal === "DRAW" ||
      signal === "WITHDRAWAL"
    ) {
      return "positive";
    }

    if (
      signal === "BUILD" ||
      signal === "INJECTION"
    ) {
      return "negative";
    }

    return "warning";
  };

  const getGasBiasClass = (
    bias?: string
  ) => {
    if (!bias) {
      return "";
    }

    if (
      bias.includes("HIGH") ||
      bias.includes("MILD GAS")
    ) {
      return "warning";
    }

    if (
      bias.includes("LOW") ||
      bias.includes("SOFTER")
    ) {
      return "positive";
    }

    return "";
  };

  return (
    <section className="india-panel">
      <div className="section-title">
        <div>
          <h2>
            🔥 Natural Gas Intelligence
          </h2>

          <p>
            Henry Hub, storage, production and consumption
          </p>
        </div>

        <div className="confidence">
          {naturalGas
            ? "LIVE • EIA"
            : gasLoading
              ? "CONNECTING..."
              : "UNAVAILABLE"}
        </div>
      </div>

      <section className="dashboard-grid">
        {/* HENRY HUB */}

        <div className="card">
          <div className="card-heading">
            <h3>🔥 Henry Hub</h3>
            <span>LIVE</span>
          </div>

          <div className="data-row">
            <span>
              Spot Price

              <small className="market-source">
                {naturalGas?.price.henryHub
                  .date || "EIA"}
              </small>
            </span>

            <strong className="warning">
              {naturalGas?.price.henryHub
                .status === "live"
                ? `$${showEnergyValue(
                    naturalGas.price.henryHub,
                    2
                  )}/MMBtu`
                : gasLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>
        </div>

        {/* GAS STORAGE */}

        <div className="card">
          <div className="card-heading">
            <h3>📦 Gas Storage</h3>
            <span>WEEKLY</span>
          </div>

          <div className="data-row">
            <span>Working Gas</span>

            <strong>
              {naturalGas?.storage.current
                .value !== undefined
                ? `${naturalGas.storage.current.value.toFixed(
                    0
                  )} Bcf`
                : gasLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Weekly Change</span>

            <strong
              className={getInventoryClass(
                naturalGas?.storage.change
                  .signal
              )}
            >
              {naturalGas?.storage.change
                .change !== undefined
                ? `${
                    naturalGas.storage.change
                      .change > 0
                      ? "+"
                      : ""
                  }${naturalGas.storage.change.change.toFixed(
                    0
                  )} Bcf`
                : gasLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Storage Signal</span>

            <strong
              className={getInventoryClass(
                naturalGas?.storage.change
                  .signal
              )}
            >
              {naturalGas?.storage.change
                .signal ||
                (gasLoading
                  ? "Loading..."
                  : "Unavailable")}
            </strong>
          </div>
        </div>

        {/* GAS SUPPLY */}

        <div className="card">
          <div className="card-heading">
            <h3>🏭 Gas Supply</h3>
            <span>LIVE</span>
          </div>

          <div className="data-row">
            <span>
              Dry Production

              <small className="market-source">
                {naturalGas?.supply.production
                  .date || "EIA"}
              </small>
            </span>

            <strong>
              {naturalGas?.supply.production
                .value !== undefined
                ? `${(
                    naturalGas.supply
                      .production.value / 1000
                  ).toFixed(2)} Bcf`
                : gasLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>
        </div>

        {/* GAS DEMAND */}

        <div className="card">
          <div className="card-heading">
            <h3>📈 Gas Demand</h3>
            <span>LIVE</span>
          </div>

          <div className="data-row">
            <span>
              Consumption

              <small className="market-source">
                {naturalGas?.demand.consumption
                  .date || "EIA"}
              </small>
            </span>

            <strong>
              {naturalGas?.demand.consumption
                .value !== undefined
                ? `${(
                    naturalGas.demand
                      .consumption.value / 1000
                  ).toFixed(2)} Bcf`
                : gasLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>
        </div>

        {/* GAS ANALYSIS */}

        <div className="card">
          <div className="card-heading">
            <h3>🧠 Gas Analysis</h3>
            <span>ENGINE</span>
          </div>

          <div className="data-row">
            <span>Gas Score</span>

            <strong>
              {naturalGas?.intelligence
                .gasScore ?? "--"}
            </strong>
          </div>

          <div className="data-row">
            <span>Gas Bias</span>

            <strong
              className={getGasBiasClass(
                naturalGas?.intelligence
                  .gasBias
              )}
            >
              {naturalGas?.intelligence
                .gasBias ||
                (gasLoading
                  ? "Loading..."
                  : "Unavailable")}
            </strong>
          </div>
        </div>
      </section>

      <div className="reason-box">
        <strong>
          Natural Gas Intelligence Reasons
        </strong>

        <p>
          {gasError
            ? gasError
            : naturalGas?.intelligence
                .reasons.length
              ? naturalGas.intelligence.reasons.join(
                  " • "
                )
              : gasLoading
                ? "Loading natural gas intelligence..."
                : "Natural gas intelligence unavailable"}
        </p>
      </div>
    </section>
  );
}

export default NaturalGasSection;