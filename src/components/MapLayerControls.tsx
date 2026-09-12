type LayerKey =
  | "countries"
  | "weather"
  | "flights"
  | "ships"
  | "internet"
  | "conflicts";

type Props = {
  activeLayers: Record<
    LayerKey,
    boolean
  >;

  onToggle: (
    layer: LayerKey
  ) => void;
};

const LAYERS: {
  key: LayerKey;
  label: string;
  icon: string;
}[] = [
  {
    key: "countries",
    label: "Countries",
    icon: "🌍",
  },
  {
    key: "weather",
    label: "Weather",
    icon: "🌦️",
  },
  {
    key: "flights",
    label: "Flights",
    icon: "✈️",
  },
  {
    key: "ships",
    label: "Ships",
    icon: "🚢",
  },
  {
    key: "internet",
    label: "Internet",
    icon: "🌐",
  },
  {
    key: "conflicts",
    label: "Conflicts",
    icon: "⚠️",
  },
];

function MapLayerControls({
  activeLayers,
  onToggle,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "12px",
        padding: "12px",
        border:
          "1px solid #1e293b",
        borderRadius:
          "12px",
        background:
          "#020617",
      }}
    >
      {LAYERS.map(
        (layer) => {
          const active =
            activeLayers[
              layer.key
            ];

          return (
            <button
              key={layer.key}
              type="button"
              onClick={() =>
                onToggle(
                  layer.key
                )
              }
              style={{
                border: active
                  ? layer.key ===
                    "conflicts"
                    ? "1px solid #ef4444"
                    : "1px solid #38bdf8"
                  : "1px solid #334155",

                background: active
                  ? layer.key ===
                    "conflicts"
                    ? "rgba(127,29,29,.35)"
                    : "#0f172a"
                  : "#020617",

                color:
                  "#e2e8f0",

                padding:
                  "10px 14px",

                borderRadius:
                  "10px",

                cursor:
                  "pointer",

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                fontWeight:
                  600,
              }}
            >
              <span>
                {layer.icon}
              </span>

              <span>
                {layer.label}
              </span>

              <span
                style={{
                  fontSize:
                    "11px",

                  opacity:
                    0.75,
                }}
              >
                {active
                  ? "ON"
                  : "OFF"}
              </span>
            </button>
          );
        }
      )}
    </div>
  );
}

export type {
  LayerKey,
};

export default MapLayerControls;