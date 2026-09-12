import {
  useState,
} from "react";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

import CountryIntelligencePanel from "./CountryIntelligencePanel";

import {
  getCountryIntelligence,
  type CountryIntelligence,
} from "../data/countryIntelligence";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const events = [
  {
    name: "Middle East",
    coordinates: [51.3, 32.4] as [
      number,
      number,
    ],
    type: "HIGH RISK",
  },

  {
    name: "Ukraine",
    coordinates: [31.1, 48.3] as [
      number,
      number,
    ],
    type: "CONFLICT",
  },

  {
    name: "India",
    coordinates: [78.9, 22.5] as [
      number,
      number,
    ],
    type: "MONITOR",
  },

  {
    name: "Taiwan",
    coordinates: [121, 23.7] as [
      number,
      number,
    ],
    type: "WATCH",
  },
];

function WorldMap() {
  const [
    selectedCountry,
    setSelectedCountry,
  ] =
    useState<CountryIntelligence | null>(
      null
    );

  const handleCountryClick = (
    countryName: string
  ) => {
    const data =
      getCountryIntelligence(
        countryName
      );

    if (data) {
      setSelectedCountry(data);
    }
  };

  return (
    <section className="map-panel">
      <div className="section-title">
        <div>
          <h2>
            World Intelligence Map
          </h2>

          <p>
            Click a supported country to open its
            intelligence report
          </p>
        </div>

        <span>MONITORING</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            selectedCountry
              ? "minmax(0, 2fr) minmax(300px, 1fr)"
              : "1fr",
          gap: "16px",
          padding: "16px",
          alignItems: "start",
        }}
      >
        <div className="world-map">
          <ComposableMap
            projectionConfig={{
              scale: 145,
            }}
          >
            <ZoomableGroup>
              <Geographies
                geography={geoUrl}
              >
                {({ geographies }) =>
                  geographies.map(
                    (geo) => {
                      const countryName =
                        geo.properties
                          ?.name || "";

                      const supported =
                        Boolean(
                          getCountryIntelligence(
                            countryName
                          )
                        );

                      const selected =
                        selectedCountry?.name ===
                          countryName ||
                        selectedCountry?.name ===
                          geo.properties
                            ?.name;

                      return (
                        <Geography
                          key={
                            geo.rsmKey
                          }
                          geography={
                            geo
                          }
                          onClick={() =>
                            handleCountryClick(
                              countryName
                            )
                          }
                          fill={
                            selected
                              ? "#25627f"
                              : supported
                                ? "#17415a"
                                : "#122b3d"
                          }
                          stroke="#315069"
                          strokeWidth={
                            0.5
                          }
                          style={{
                            default: {
                              outline:
                                "none",

                              cursor:
                                supported
                                  ? "pointer"
                                  : "default",
                            },

                            hover: {
                              fill:
                                supported
                                  ? "#28739a"
                                  : "#1c4964",

                              outline:
                                "none",

                              cursor:
                                supported
                                  ? "pointer"
                                  : "default",
                            },

                            pressed: {
                              fill:
                                "#25627f",

                              outline:
                                "none",
                            },
                          }}
                        >
                          <title>
                            {countryName}
                            {supported
                              ? " - Click for intelligence"
                              : ""}
                          </title>
                        </Geography>
                      );
                    }
                  )
                }
              </Geographies>

              {events.map(
                ({
                  name,
                  coordinates,
                  type,
                }) => (
                  <Marker
                    key={name}
                    coordinates={
                      coordinates
                    }
                  >
                    <circle
                      r={5}
                      fill="#ff5964"
                      stroke="#ffffff"
                      strokeWidth={
                        1
                      }
                    />

                    <text
                      textAnchor="middle"
                      y={-10}
                      style={{
                        fill:
                          "#ffffff",
                        fontSize:
                          "8px",
                        fontWeight:
                          600,
                      }}
                    >
                      {name}
                    </text>

                    <title>
                      {name} -{" "}
                      {type}
                    </title>
                  </Marker>
                )
              )}
            </ZoomableGroup>
          </ComposableMap>

          <div className="map-tags">
            <span>
              🔴 Conflict
            </span>

            <span>
              🟠 Protest
            </span>

            <span>
              🔥 Wildfire
            </span>

            <span>
              🌪 Disaster
            </span>

            <span>
              ✈ Aircraft
            </span>

            <span>
              🚢 Ships
            </span>
          </div>
        </div>

        {selectedCountry && (
          <CountryIntelligencePanel
            country={
              selectedCountry
            }
            onClose={() =>
              setSelectedCountry(
                null
              )
            }
          />
        )}
      </div>
    </section>
  );
}

export default WorldMap;