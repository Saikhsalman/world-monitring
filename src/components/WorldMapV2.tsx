import {
  useEffect,
  useRef,
} from "react";

import {
  Map as MapLibreMap,
  NavigationControl,
} from "maplibre-gl";

import {
  feature,
} from "topojson-client";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  onCountrySelect?: (
    countryCode: string
  ) => void;
};

const COUNTRY_CODE_MAP: Record<
  string,
  string
> = {
  "356": "IND",
  "840": "USA",
  "276": "DEU",
  "156": "CHN",
  "643": "RUS",
  "826": "GBR",
  "250": "FRA",
  "380": "ITA",
  "724": "ESP",
  "392": "JPN",
};

const COUNTRY_NAMES: Record<
  string,
  string
> = {
  IND: "India",
  USA: "United States",
  DEU: "Germany",
  CHN: "China",
  RUS: "Russia",
  GBR: "United Kingdom",
  FRA: "France",
  ITA: "Italy",
  ESP: "Spain",
  JPN: "Japan",
};

function WorldMapV2({
  onCountrySelect,
}: Props) {
  const mapContainer =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<MapLibreMap | null>(
      null
    );

  useEffect(() => {
    if (!mapContainer.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    let destroyed = false;

    const map =
      new MapLibreMap({
        container:
          mapContainer.current,

        center: [20, 20],

        zoom: 1.5,

        minZoom: 1,

        maxZoom: 10,

        style: {
          version: 8,

          sources: {
            osm: {
              type: "raster",

              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],

              tileSize: 256,

              attribution:
                "© OpenStreetMap contributors",
            },
          },

          layers: [
            {
              id: "osm",

              type: "raster",

              source: "osm",
            },
          ],
        },
      });

    mapRef.current = map;

    map.addControl(
      new NavigationControl(),
      "top-right"
    );

    const loadCountries =
      async () => {
        try {
          const response =
            await fetch(
              "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
            );

          if (!response.ok) {
            throw new Error(
              `Country map HTTP ${response.status}`
            );
          }

          const topology =
            (await response.json()) as any;

          const geojson =
            feature(
              topology,
              topology.objects.countries
            ) as any;

          geojson.features =
            geojson.features.map(
              (countryFeature: any) => {
                const numericCode =
                  String(
                    Number(
                      countryFeature.id
                    )
                  );

                const countryCode =
                  COUNTRY_CODE_MAP[
                    numericCode
                  ] || "";

                return {
                  ...countryFeature,

                  properties: {
                    ...countryFeature.properties,

                    countryCode,

                    countryName:
                      COUNTRY_NAMES[
                        countryCode
                      ] ||
                      countryFeature
                        .properties
                        ?.name ||
                      "",
                  },
                };
              }
            );

          if (destroyed) {
            return;
          }

          map.addSource(
            "country-boundaries",
            {
              type: "geojson",

              data: geojson,
            }
          );

          // -------------------------------------------
          // COUNTRY BORDER
          // -------------------------------------------

          map.addLayer({
            id: "country-border",

            type: "line",

            source:
              "country-boundaries",

            paint: {
              "line-color":
                "#475569",

              "line-width": 0.7,

              "line-opacity": 0.65,
            },
          });

          // -------------------------------------------
          // CLICKABLE SUPPORTED COUNTRIES
          // -------------------------------------------

          map.addLayer({
            id: "country-click",

            type: "fill",

            source:
              "country-boundaries",

            filter: [
              "!=",
              [
                "get",
                "countryCode",
              ],
              "",
            ] as any,

            paint: {
              "fill-color":
                "#2563eb",

              "fill-opacity": 0.05,
            },
          });

          // -------------------------------------------
          // HOVER COUNTRY
          // -------------------------------------------

          map.addLayer({
            id: "country-hover",

            type: "fill",

            source:
              "country-boundaries",

            filter: [
              "==",
              [
                "get",
                "countryCode",
              ],
              "__NONE__",
            ] as any,

            paint: {
              "fill-color":
                "#38bdf8",

              "fill-opacity": 0.22,
            },
          });

          // -------------------------------------------
          // SELECTED COUNTRY
          // -------------------------------------------

          map.addLayer({
            id: "country-selected",

            type: "fill",

            source:
              "country-boundaries",

            filter: [
              "==",
              [
                "get",
                "countryCode",
              ],
              "__NONE__",
            ] as any,

            paint: {
              "fill-color":
                "#22c55e",

              "fill-opacity": 0.28,

              "fill-outline-color":
                "#16a34a",
            },
          });

          // -------------------------------------------
          // HOVER
          // -------------------------------------------

          map.on(
            "mousemove",
            "country-click",
            (event: any) => {
              const mapFeature =
                event.features?.[0];

              const countryCode =
                mapFeature?.properties
                  ?.countryCode;

              if (!countryCode) {
                return;
              }

              map.getCanvas().style.cursor =
                "pointer";

              map.setFilter(
                "country-hover",
                [
                  "==",
                  [
                    "get",
                    "countryCode",
                  ],
                  countryCode,
                ] as any
              );
            }
          );

          map.on(
            "mouseleave",
            "country-click",
            () => {
              map.getCanvas().style.cursor =
                "";

              map.setFilter(
                "country-hover",
                [
                  "==",
                  [
                    "get",
                    "countryCode",
                  ],
                  "__NONE__",
                ] as any
              );
            }
          );

          // -------------------------------------------
          // COUNTRY CLICK
          // -------------------------------------------

          map.on(
            "click",
            "country-click",
            (event: any) => {
              const mapFeature =
                event.features?.[0];

              const countryCode =
                mapFeature?.properties
                  ?.countryCode;

              if (!countryCode) {
                return;
              }

              console.log(
                "COUNTRY SELECTED:",
                countryCode
              );

              map.setFilter(
                "country-selected",
                [
                  "==",
                  [
                    "get",
                    "countryCode",
                  ],
                  countryCode,
                ] as any
              );

              if (
                event.lngLat
              ) {
                map.easeTo({
                  center: [
                    event.lngLat.lng,
                    event.lngLat.lat,
                  ],

                  zoom: Math.max(
                    map.getZoom(),
                    3
                  ),

                  duration: 700,
                });
              }

              onCountrySelect?.(
                countryCode
              );
            }
          );

          console.log(
            "COUNTRY CLICK LAYER READY"
          );
        } catch (error) {
          console.error(
            "COUNTRY MAP ERROR:",
            error
          );
        }
      };

    map.on(
      "load",
      () => {
        console.log(
          "MAPLIBRE MAP LOADED"
        );

        map.resize();

        loadCountries();
      }
    );

    return () => {
      destroyed = true;

      map.remove();

      mapRef.current = null;
    };
  }, [onCountrySelect]);

  return (
    <section className="map-panel">
      <div className="section-title">
        <div>
          <h2>
            🌍 World Intelligence Map
          </h2>

          <p>
            Click a highlighted country
            to open intelligence
          </p>
        </div>

        <span>
          MAPLIBRE
        </span>
      </div>

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "560px",
          minHeight: "560px",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#111827",
        }}
      />
    </section>
  );
}

export default WorldMapV2;