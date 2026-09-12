type EnergyItem = {
  name: string;
  series: string;
  value?: number;
  unit?: string;
  date?: string;
  status: string;
  error?: string;
};

type CrudeInventory = {
  name: string;
  series: string;
  status: string;

  latest?: {
    value: number;
    date: string;
  };

  previous?: {
    value: number;
    date: string;
  };

  unit?: string;
  change?: number;
  changeMillionBarrels?: number;
  signal?: string;
  oilBias?: string;
  error?: string;
};

type EnergyData = {
  source: string;

  prices: {
    wti: EnergyItem;
    brent: EnergyItem;
  };

  inventories: {
    crude: CrudeInventory;
    gasoline: EnergyItem;
    distillate: EnergyItem;
  };

  supply: {
    production: EnergyItem;
    imports: EnergyItem;
    exports: EnergyItem;
  };

  refining: {
    utilization: EnergyItem;
  };

  intelligence: {
    energyScore: number;
    energyBias: string;
    indiaOilImpact: string;
    reasons: string[];
  };
};

type Props = {
  energy: EnergyData | null;
  energyLoading: boolean;
  energyError: string;
};

function PetroleumEnergySection({
  energy,
  energyLoading,
  energyError,
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

  const getImpactClass = (
    impact?: string
  ) => {
    if (!impact) {
      return "";
    }

    if (impact.includes("NEGATIVE")) {
      return "negative";
    }

    if (impact.includes("POSITIVE")) {
      return "positive";
    }

    return "warning";
  };

  return (
    <section className="india-panel">
      <div className="section-title">
        <div>
          <h2>
            🛢 Petroleum Energy Intelligence
          </h2>

          <p>
            EIA prices, inventories, supply and refinery data
          </p>
        </div>

        <div className="confidence">
          {energy
            ? "LIVE • EIA"
            : energyLoading
              ? "CONNECTING..."
              : "UNAVAILABLE"}
        </div>
      </div>

      <section className="dashboard-grid">
        {/* OIL PRICES */}

        <div className="card">
          <div className="card-heading">
            <h3>🛢 Oil Prices</h3>
            <span>LIVE</span>
          </div>

          <div className="data-row">
            <span>WTI</span>

            <strong className="warning">
              {energy?.prices.wti.status ===
              "live"
                ? `$${showEnergyValue(
                    energy.prices.wti
                  )}`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Brent</span>

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
        </div>

        {/* CRUDE INVENTORY */}

        <div className="card">
          <div className="card-heading">
            <h3>📦 Crude Inventory</h3>
            <span>WEEKLY</span>
          </div>

          <div className="data-row">
            <span>Current</span>

            <strong>
              {energy?.inventories.crude.latest
                ? `${(
                    energy.inventories.crude
                      .latest.value / 1000
                  ).toFixed(2)}M bbl`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Weekly Change</span>

            <strong
              className={getInventoryClass(
                energy?.inventories.crude
                  .signal
              )}
            >
              {energy?.inventories.crude
                .changeMillionBarrels !==
              undefined
                ? `${
                    energy.inventories.crude
                      .changeMillionBarrels > 0
                      ? "+"
                      : ""
                  }${energy.inventories.crude.changeMillionBarrels.toFixed(
                    3
                  )}M`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Signal</span>

            <strong
              className={getInventoryClass(
                energy?.inventories.crude
                  .signal
              )}
            >
              {energy?.inventories.crude
                .signal ||
                (energyLoading
                  ? "Loading..."
                  : "Unavailable")}
            </strong>
          </div>
        </div>

        {/* SUPPLY */}

        <div className="card">
          <div className="card-heading">
            <h3>🏭 US Oil Supply</h3>
            <span>LIVE</span>
          </div>

          <div className="data-row">
            <span>Production</span>

            <strong>
              {energy?.supply.production
                .value !== undefined
                ? `${(
                    energy.supply.production
                      .value / 1000
                  ).toFixed(3)}M bpd`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Imports</span>

            <strong>
              {energy?.supply.imports
                .value !== undefined
                ? `${(
                    energy.supply.imports
                      .value / 1000
                  ).toFixed(3)}M bpd`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Exports</span>

            <strong>
              {energy?.supply.exports
                .value !== undefined
                ? `${(
                    energy.supply.exports
                      .value / 1000
                  ).toFixed(3)}M bpd`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>
        </div>

        {/* FUEL STOCKS */}

        <div className="card">
          <div className="card-heading">
            <h3>⛽ Fuel Stocks</h3>
            <span>LIVE</span>
          </div>

          <div className="data-row">
            <span>Gasoline</span>

            <strong>
              {energy?.inventories.gasoline
                .value !== undefined
                ? `${(
                    energy.inventories
                      .gasoline.value / 1000
                  ).toFixed(2)}M bbl`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>

          <div className="data-row">
            <span>Distillate</span>

            <strong>
              {energy?.inventories.distillate
                .value !== undefined
                ? `${(
                    energy.inventories
                      .distillate.value / 1000
                  ).toFixed(2)}M bbl`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>
        </div>

        {/* REFINERY */}

        <div className="card">
          <div className="card-heading">
            <h3>🏭 Refinery</h3>
            <span>LIVE</span>
          </div>

          <div className="data-row">
            <span>Utilization</span>

            <strong className="warning">
              {energy?.refining.utilization
                .value !== undefined
                ? `${energy.refining.utilization.value.toFixed(
                    1
                  )}%`
                : energyLoading
                  ? "Loading..."
                  : "Unavailable"}
            </strong>
          </div>
        </div>

        {/* OIL INTELLIGENCE */}

        <div className="card">
          <div className="card-heading">
            <h3>🧠 Oil Intelligence</h3>
            <span>ENGINE</span>
          </div>

          <div className="data-row">
            <span>Energy Score</span>

            <strong>
              {energy?.intelligence
                .energyScore ?? "--"}
            </strong>
          </div>

          <div className="data-row">
            <span>Energy Bias</span>

            <strong className="warning">
              {energy?.intelligence
                .energyBias ||
                (energyLoading
                  ? "Loading..."
                  : "Unavailable")}
            </strong>
          </div>

          <div className="data-row">
            <span>India Oil Impact</span>

            <strong
              className={getImpactClass(
                energy?.intelligence
                  .indiaOilImpact
              )}
            >
              {energy?.intelligence
                .indiaOilImpact ||
                (energyLoading
                  ? "Loading..."
                  : "Unavailable")}
            </strong>
          </div>
        </div>
      </section>

      <div className="reason-box">
        <strong>
          Oil Intelligence Reasons
        </strong>

        <p>
          {energyError
            ? energyError
            : energy?.intelligence
                .reasons.length
              ? energy.intelligence.reasons.join(
                  " • "
                )
              : energyLoading
                ? "Loading oil intelligence..."
                : "Oil intelligence unavailable"}
        </p>
      </div>
    </section>
  );
}

export default PetroleumEnergySection;