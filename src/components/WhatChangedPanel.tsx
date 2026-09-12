import { useEffect, useState } from "react";

type ChangeItem = {
  key: string;
  label: string;
  current: number;
  previous: number;
  unit?: string;
  direction: "UP" | "DOWN";
  severity: "LOW" | "MEDIUM" | "HIGH";
};

type ChangeResponse = {
  status:
    | "warming_up"
    | "baseline_created"
    | "ready"
    | "error";

  changeCount?: number;
  changes?: ChangeItem[];

  snapshotQuality?: {
    ready?: boolean;
    availableCount?: number;
    totalCount?: number;
    coveragePercent?: number;
  };
};

function WhatChangedPanel() {
  const [data, setData] =
    useState<ChangeResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadChanges = async () => {
      try {
        const response = await fetch(
          `/api/intelligence/changes/live?t=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const result: ChangeResponse =
          await response.json();

        if (cancelled) {
          return;
        }

        setData(result);
        setError("");
      } catch (err) {
        console.error(
          "WHAT CHANGED ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            "Change intelligence unavailable"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadChanges();

    const timer = window.setInterval(
      () => {
        void loadChanges();
      },
      60000
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const formatValue = (
    value: number,
    unit = ""
  ) => {
    const text =
      Number.isInteger(value)
        ? String(value)
        : value.toFixed(2);

    if (unit === "%") {
      return `${text}%`;
    }

    if (unit) {
      return `${text} ${unit}`;
    }

    return text;
  };

  return (
    <section className="wm-changes-panel">
      <div className="wm-changes-header">
        <div>
          <span className="wm-changes-icon">
            ◈
          </span>

          <div>
            <strong>
              WHAT CHANGED?
            </strong>

            <small>
              LIVE CHANGE INTELLIGENCE
            </small>
          </div>
        </div>

        <span className="wm-changes-live">
          60S
        </span>
      </div>

      {loading && (
        <div className="wm-changes-state">
          BUILDING INTELLIGENCE...
        </div>
      )}

      {!loading && error && (
        <div className="wm-changes-error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        data?.status === "warming_up" && (
          <div className="wm-changes-state">
            Waiting for enough live data...
          </div>
        )}

      {!loading &&
        !error &&
        data?.status ===
          "baseline_created" && (
          <div className="wm-changes-state">
            <strong>
              BASELINE READY
            </strong>

            <span>
              Monitoring live data for meaningful changes.
            </span>
          </div>
        )}

      {!loading &&
        !error &&
        data?.status === "ready" && (
          <>
            <div className="wm-changes-summary">
              <span>
                CHANGES
              </span>

              <strong>
                {data.changeCount ?? 0}
              </strong>

              <small>
                detected in latest snapshot
              </small>
            </div>

            {!data.changes?.length ? (
              <div className="wm-changes-state">
                No meaningful change detected.
              </div>
            ) : (
              <div className="wm-changes-list">
                {data.changes.map((item) => (
                  <div
                    key={item.key}
                    className={`wm-change-item wm-change-${item.severity.toLowerCase()}`}
                  >
                    <span className="wm-change-direction">
                      {item.direction === "UP"
                        ? "↑"
                        : "↓"}
                    </span>

                    <div className="wm-change-main">
                      <strong>
                        {item.label}
                      </strong>

                      <small>
                        {formatValue(
                          item.previous,
                          item.unit
                        )}

                        {" → "}

                        {formatValue(
                          item.current,
                          item.unit
                        )}
                      </small>
                    </div>

                    <span className="wm-change-severity">
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      {data?.snapshotQuality && (
        <div className="wm-changes-coverage">
          <span>
            DATA COVERAGE
          </span>

          <strong>
            {data.snapshotQuality
              .coveragePercent ?? 0}
            %
          </strong>
        </div>
      )}
    </section>
  );
}

export default WhatChangedPanel;