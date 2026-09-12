import {
  useState,
} from "react";

import {
  indicatorExplanations,
} from "../data/indicatorExplanations";

type Props = {
  indicatorKey: string;
  label: string;
};

function IndicatorExplanation({
  indicatorKey,
  label,
}: Props) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const explanation =
    indicatorExplanations[
      indicatorKey
    ];

  if (!explanation) {
    return <span>{label}</span>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        style={{
  background: "transparent",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  padding: 0,
  font: "inherit",
  textAlign: "left",
}}
      >
        {label}
      </button>

      {open && (
        <div
          className="reason-box"
          style={{
            marginTop: "8px",
            marginBottom: "8px",
            padding: "10px",
          }}
        >
          <strong>
            {explanation.title}
          </strong>

          <p>
            {
              explanation.shortDescription
            }
          </p>

          <p>
            <strong>
              Why it matters:
            </strong>{" "}
            {
              explanation.whyItMatters
            }
          </p>

          {explanation.highImpact && (
            <p>
              <strong>
                Higher / Stronger:
              </strong>{" "}
              {
                explanation.highImpact
              }
            </p>
          )}

          {explanation.lowImpact && (
            <p>
              <strong>
                Lower / Weaker:
              </strong>{" "}
              {
                explanation.lowImpact
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default IndicatorExplanation;