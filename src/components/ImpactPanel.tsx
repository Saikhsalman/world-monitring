type ImpactChannel = {
  channel: string;
  label: string;
  exposure: string;
  score: number;
  consequences?: string[];
};

type AffectedCountry = {
  countryCode: string;
  countryName: string;
  impactScore: number;
  impactLevel: string;
  channels?: ImpactChannel[];
};

export type ImpactData = {
  status: string;

  event: {
    id: string;
    name: string;
    region?: string;
    severity?: string;
    type?: string;
  };

  channels?: {
    id: string;
    label: string;
    severity: string;
  }[];

  affectedCountries: AffectedCountry[];

  summary?: {
    affectedCountryCount?: number;
    highestImpactCountry?: AffectedCountry | null;
    highestImpactScore?: number | null;
  };

  methodology?: string;
  updatedAt?: string;
};

type Props = {
  data: ImpactData | null;
  loading?: boolean;
  onClose: () => void;
};

function levelClass(
  level?: string
) {
  switch (
    String(level || "")
      .toUpperCase()
  ) {
    case "CRITICAL":
      return "impact-critical";

    case "HIGH":
      return "impact-high";

    case "MEDIUM":
      return "impact-medium";

    default:
      return "impact-low";
  }
}

function ImpactPanel({
  data,
  loading = false,
  onClose,
}: Props) {
  if (loading) {
    return (
      <section className="impact-intelligence-panel">
        <div className="impact-panel-header">
          <div>
            <span className="impact-panel-kicker">
              IMPACT ENGINE
            </span>

            <h3>
              Calculating impact...
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="impact-loading">
          Analysing event transmission channels...
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const india =
    data.affectedCountries?.find(
      (country) =>
        country.countryCode ===
        "IND"
    );

  return (
    <section className="impact-intelligence-panel">
      <div className="impact-panel-header">
        <div>
          <span className="impact-panel-kicker">
            CAUSE → EFFECT
          </span>

          <h3>
            {data.event.name}
          </h3>

          <small>
            {data.event.region ||
              "Global Event"}
          </small>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Close impact panel"
        >
          ×
        </button>
      </div>

      <div className="impact-event-status">
        <span>
          EVENT SEVERITY
        </span>

        <strong
          className={levelClass(
            data.event.severity
          )}
        >
          {data.event.severity ||
            "--"}
        </strong>
      </div>

      <div className="impact-chain">
        <div className="impact-chain-node">
          <span>⚠</span>

          <div>
            <small>
              EVENT
            </small>

            <strong>
              {data.event.name}
            </strong>
          </div>
        </div>

        <div className="impact-arrow">
          ↓
        </div>

        <div className="impact-channel-list">
          {(data.channels || []).map(
            (channel) => (
              <div
                className="impact-channel"
                key={channel.id}
              >
                <span>
                  {channel.label}
                </span>

                <strong
                  className={levelClass(
                    channel.severity
                  )}
                >
                  {channel.severity}
                </strong>
              </div>
            )
          )}
        </div>

        <div className="impact-arrow">
          ↓
        </div>

        <div className="impact-country-title">
          AFFECTED COUNTRIES
        </div>

        <div className="impact-country-list">
          {data.affectedCountries
            ?.slice(0, 8)
            .map(
              (country) => (
                <div
                  className="impact-country-row"
                  key={
                    country.countryCode
                  }
                >
                  <div>
                    <strong>
                      {
                        country.countryName
                      }
                    </strong>

                    <small>
                      {
                        country.countryCode
                      }
                    </small>
                  </div>

                  <div className="impact-country-score">
                    <strong>
                      {
                        country.impactScore
                      }
                    </strong>

                    <span
                      className={levelClass(
                        country.impactLevel
                      )}
                    >
                      {
                        country.impactLevel
                      }
                    </span>
                  </div>
                </div>
              )
            )}
        </div>
      </div>

      {india && (
        <div className="impact-india-box">
          <div className="impact-india-heading">
            <span>
              🇮🇳 INDIA IMPACT
            </span>

            <strong
              className={levelClass(
                india.impactLevel
              )}
            >
              {india.impactScore}{" "}
              {india.impactLevel}
            </strong>
          </div>

          {india.channels
            ?.slice(0, 3)
            .map(
              (channel) => (
                <div
                  className="impact-india-channel"
                  key={
                    channel.channel
                  }
                >
                  <strong>
                    {channel.label}
                  </strong>

                  <span>
                    Exposure:{" "}
                    {
                      channel.exposure
                    }
                  </span>

                  {channel.consequences
                    ?.slice(0, 3)
                    .map(
                      (
                        consequence,
                        index
                      ) => (
                        <p
                          key={
                            index
                          }
                        >
                          •{" "}
                          {
                            consequence
                          }
                        </p>
                      )
                    )}
                </div>
              )
            )}
        </div>
      )}

      <div className="impact-methodology">
        {data.methodology ||
          "World Monitor Impact Engine"}
      </div>
    </section>
  );
}

export default ImpactPanel;