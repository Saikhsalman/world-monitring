import {
  useEffect,
  useRef,
  useState,
} from "react";

import mapboxgl from "mapbox-gl";

import MapLayerControls, {
  type LayerKey,
} from "./MapLayerControls";

import {
  clearImpactLines,
  showImpactLines,
} from "../services/impactMapService";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN;

// =====================================================
// TYPES
// =====================================================

type Props = {
  onCountrySelect?: (
    countryName: string,
    countryCode: string
  ) => void;

  onImpactSelect?: (
    eventId: string
  ) => void;
};

type CountryProps = {
  ADMIN?: string;
  NAME?: string;
  name?: string;
  "ISO3166-1-Alpha-3"?: string;
  ISO_A3?: string;
  ADM0_A3?: string;
};

type WeatherLocation = {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  status: string;

  weather?: {
    temperature?: number | null;
    feelsLike?: number | null;
    humidity?: number | null;
    rain?: number | null;
    pressure?: number | null;
    windSpeed?: number | null;
    windGust?: number | null;
    condition?: string;
  };

  observationTime?: string | null;
  source?: string;
};

type WeatherResponse = {
  locations: WeatherLocation[];
};

type LiveFlight = {
  callsign: string;

  flightIcao?: string | null;
  flightIata?: string | null;
  flightNumber?: string | null;

  regNumber?: string | null;
  aircraftIcao?: string | null;

  latitude: number | null;
  longitude: number | null;

  altitude?: number | null;
  speed?: number | null;
  direction?: number | null;
  verticalSpeed?: number | null;
};

type FlightResponse = {
  status: string;
  source: string;
  count: number;
  flights: LiveFlight[];
};

type LiveShip = {
  mmsi: string;
  shipName?: string | null;
  latitude: number | null;
  longitude: number | null;
  speedKnots?: number | null;
  course?: number | null;
  heading?: number | null;
  navigationStatus?: number | null;
  source?: string;
};

type ShipResponse = {
  status: string;
  source: string;
  connected: boolean;
  count: number;
  ships: LiveShip[];
};

type InternetOutage = {
  id?: string | null;
  eventType?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  outageType?: string | null;
  outageCause?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  source?: string | null;
};

type InternetResponse = {
  status: string;
  source: string;
  count: number;

  risk?: {
    score?: number;
    level?: string;
  };

  outages: InternetOutage[];
};

// =====================================================
// CONFLICT TYPES
// =====================================================

type ConflictEvent = {
  id: string;
  name: string;
  region: string;

  type:
    | "CONFLICT"
    | "SHIPPING_RISK"
    | "GEOPOLITICAL_TENSION"
    | "CHOKEPOINT"
    | string;

  severity:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL"
    | string;

  latitude: number;
  longitude: number;

  countries?: string[];

  description?: string;
  marketImpact?: string;
  status?: string;
};

type ConflictResponse = {
  status: string;
  source: string;

  count: number;
  conflictCount: number;
  chokepointCount: number;

  risk?: {
    score?: number;
    level?: string;
  };

  events: ConflictEvent[];

  updatedAt?: string;
};

// =====================================================
// CONFIG
// =====================================================

const COUNTRY_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

// =====================================================
// WEATHER ICON
// =====================================================

function weatherIcon(
  condition?: string
) {
  const text =
    String(
      condition || ""
    ).toLowerCase();

  if (text.includes("thunder")) {
    return "⛈️";
  }

  if (
    text.includes("rain") ||
    text.includes("drizzle")
  ) {
    return "🌧️";
  }

  if (text.includes("snow")) {
    return "🌨️";
  }

  if (text.includes("fog")) {
    return "🌫️";
  }

  if (text.includes("cloud")) {
    return "☁️";
  }

  if (text.includes("clear")) {
    return "☀️";
  }

  return "🌦️";
}

// =====================================================
// CONFLICT HELPERS
// =====================================================

function conflictColor(
  severity?: string
) {
  switch (
    String(
      severity || ""
    ).toUpperCase()
  ) {
    case "CRITICAL":
      return "#ef4444";

    case "HIGH":
      return "#f97316";

    case "MEDIUM":
      return "#facc15";

    default:
      return "#38bdf8";
  }
}

function conflictIcon(
  type?: string
) {
  switch (
    String(
      type || ""
    ).toUpperCase()
  ) {
    case "CHOKEPOINT":
      return "◆";

    case "SHIPPING_RISK":
      return "⚓";

    case "GEOPOLITICAL_TENSION":
      return "▲";

    case "CONFLICT":
      return "⚠";

    default:
      return "●";
  }
}

// =====================================================
// COMPONENT
// =====================================================

function MapboxWorldMap({
  onCountrySelect,
  onImpactSelect,
}: Props) {
  const mapContainer =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<mapboxgl.Map | null>(
      null
    );

  const callbackRef =
    useRef(onCountrySelect);

  const impactCallbackRef =
    useRef(
      onImpactSelect
    );

  const weatherMarkers =
    useRef<mapboxgl.Marker[]>(
      []
    );

  const flightMarkers =
    useRef<mapboxgl.Marker[]>(
      []
    );

  const shipMarkers =
    useRef<mapboxgl.Marker[]>(
      []
    );

  const internetMarkers =
    useRef<mapboxgl.Marker[]>(
      []
    );

  const conflictMarkers =
    useRef<mapboxgl.Marker[]>(
      []
    );

  const [
    activeLayers,
    setActiveLayers,
  ] = useState<
    Record<
      LayerKey,
      boolean
    >
  >({
    countries: true,
    weather: false,
    flights: false,
    ships: false,
    internet: false,
    conflicts: false,
  });

  useEffect(() => {
    callbackRef.current =
      onCountrySelect;
  }, [onCountrySelect]);

  useEffect(() => {
    impactCallbackRef.current =
      onImpactSelect;
  }, [onImpactSelect]);

  const toggleLayer = (
    layer: LayerKey
  ) => {
    setActiveLayers(
      (current) => ({
        ...current,

        [layer]:
          !current[layer],
      })
    );
  };

  // ===================================================
  // CLEAR MARKERS
  // ===================================================

  const clearWeather = () => {
    weatherMarkers.current.forEach(
      (marker) =>
        marker.remove()
    );

    weatherMarkers.current =
      [];
  };

  const clearFlights = () => {
    flightMarkers.current.forEach(
      (marker) =>
        marker.remove()
    );

    flightMarkers.current =
      [];
  };

  const clearShips = () => {
    shipMarkers.current.forEach(
      (marker) =>
        marker.remove()
    );

    shipMarkers.current =
      [];
  };

  const clearInternet = () => {
    internetMarkers.current.forEach(
      (marker) =>
        marker.remove()
    );

    internetMarkers.current =
      [];
  };

  const clearConflicts = () => {
    conflictMarkers.current.forEach(
      (marker) =>
        marker.remove()
    );

    conflictMarkers.current =
      [];
  };

  // ===================================================
  // COUNTRY VISIBILITY
  // ===================================================

  useEffect(() => {
    const map =
      mapRef.current;

    if (
      !map ||
      !map.isStyleLoaded()
    ) {
      return;
    }

    const visibility =
      activeLayers.countries
        ? "visible"
        : "none";

    [
      "countries-base",
      "countries-hover",
      "country-selected",
      "countries-border",
    ].forEach(
      (id) => {
        if (
          map.getLayer(id)
        ) {
          map.setLayoutProperty(
            id,
            "visibility",
            visibility
          );
        }
      }
    );
  }, [
    activeLayers.countries,
  ]);

  // ===================================================
  // WEATHER
  // ===================================================

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    if (
      !activeLayers.weather
    ) {
      clearWeather();

      return;
    }

    let cancelled =
      false;

    const loadWeather =
      async () => {
        try {
          const response =
            await fetch(
              "/api/weather/world"
            );

          if (!response.ok) {
            throw new Error(
              `Weather HTTP ${response.status}`
            );
          }

          const data:
            WeatherResponse =
            await response.json();

          if (cancelled) {
            return;
          }

          clearWeather();

          for (
            const item
            of data.locations || []
          ) {
            if (
              item.status !==
              "live"
            ) {
              continue;
            }

            const el =
              document.createElement(
                "button"
              );

            el.type =
              "button";

            el.style.cssText =
              `
                border:1px solid #38bdf8;
                background:rgba(2,6,23,.9);
                color:#e2e8f0;
                border-radius:9px;
                padding:5px 7px;
                cursor:pointer;
                font-size:11px;
                font-weight:700;
                white-space:nowrap;
              `;

            const icon =
              weatherIcon(
                item.weather
                  ?.condition
              );

            el.textContent =
              `${icon} ${
                item.weather
                  ?.temperature ??
                "--"
              }°C`;

            const popup =
              new mapboxgl.Popup({
                offset: 18,
              })
                .setHTML(
                  `
                  <div style="color:#0f172a;min-width:210px;line-height:1.5">
                    <strong>
                      ${icon} ${item.city}, ${item.country}
                    </strong>

                    <div>
                      Condition: ${item.weather?.condition ?? "--"}
                    </div>

                    <div>
                      Temperature: ${item.weather?.temperature ?? "--"} °C
                    </div>

                    <div>
                      Feels like: ${item.weather?.feelsLike ?? "--"} °C
                    </div>

                    <div>
                      Humidity: ${item.weather?.humidity ?? "--"}%
                    </div>

                    <div>
                      Rain: ${item.weather?.rain ?? 0} mm
                    </div>

                    <div>
                      Wind: ${item.weather?.windSpeed ?? "--"} km/h
                    </div>

                    <div>
                      Gust: ${item.weather?.windGust ?? "--"} km/h
                    </div>

                    <div>
                      Pressure: ${item.weather?.pressure ?? "--"} hPa
                    </div>

                    <small>
                      ${item.observationTime ?? ""}
                    </small>
                  </div>
                  `
                );

            const marker =
              new mapboxgl.Marker({
                element: el,
                anchor:
                  "bottom",
              })
                .setLngLat([
                  item.longitude,
                  item.latitude,
                ])
                .setPopup(
                  popup
                )
                .addTo(
                  map
                );

            weatherMarkers.current.push(
              marker
            );
          }
        } catch (error) {
          console.error(
            "WEATHER LAYER ERROR:",
            error
          );
        }
      };

    loadWeather();

    return () => {
      cancelled =
        true;

      clearWeather();
    };
  }, [
    activeLayers.weather,
  ]);

  // ===================================================
  // LIVE FLIGHTS
  // ===================================================

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    if (
      !activeLayers.flights
    ) {
      clearFlights();

      return;
    }

    let cancelled =
      false;

    const loadFlights =
      async () => {
        try {
          const response =
            await fetch(
              "/api/flights/live"
            );

          if (!response.ok) {
            throw new Error(
              `Flights HTTP ${response.status}`
            );
          }

          const data:
            FlightResponse =
            await response.json();

          if (cancelled) {
            return;
          }

          clearFlights();

          const flights =
            (data.flights || [])
              .filter(
                (flight) =>
                  flight.latitude !==
                    null &&
                  flight.longitude !==
                    null
              )
              .slice(
                0,
                500
              );

          for (
            const flight
            of flights
          ) {
            const el =
              document.createElement(
                "button"
              );

            el.type =
              "button";

            el.textContent =
              "✈";

            el.style.cssText =
              `
                border:none;
                background:transparent;
                color:#f8fafc;
                font-size:16px;
                cursor:pointer;
                width:20px;
                height:20px;
                padding:0;
                text-shadow:0 0 6px #38bdf8;
              `;

            if (
              flight.direction !==
                null &&
              flight.direction !==
                undefined
            ) {
              el.style.transform =
                `rotate(${flight.direction}deg)`;
            }

            const flightName =
              flight.flightIata ||
              flight.flightIcao ||
              flight.flightNumber ||
              flight.callsign ||
              "Unknown";

            const popup =
              new mapboxgl.Popup({
                offset: 15,
              })
                .setHTML(
                  `
                  <div style="color:#0f172a;min-width:210px;line-height:1.5">
                    <strong>
                      ✈ ${flightName}
                    </strong>

                    <div>
                      Callsign: ${flight.callsign || "--"}
                    </div>

                    <div>
                      Aircraft: ${flight.aircraftIcao || flight.regNumber || "--"}
                    </div>

                    <div>
                      Altitude: ${flight.altitude ?? "--"} m
                    </div>

                    <div>
                      Speed: ${flight.speed ?? "--"} km/h
                    </div>

                    <div>
                      Heading: ${flight.direction ?? "--"}°
                    </div>

                    <div>
                      Vertical Speed: ${flight.verticalSpeed ?? "--"}
                    </div>

                    <small>
                      Source: ${data.source || "AirLabs"}
                    </small>
                  </div>
                  `
                );

            const marker =
              new mapboxgl.Marker({
                element: el,
                anchor:
                  "center",
              })
                .setLngLat([
                  Number(
                    flight.longitude
                  ),
                  Number(
                    flight.latitude
                  ),
                ])
                .setPopup(
                  popup
                )
                .addTo(
                  map
                );

            flightMarkers.current.push(
              marker
            );
          }

          console.log(
            "LIVE FLIGHTS READY:",
            flightMarkers.current.length
          );
        } catch (error) {
          console.error(
            "FLIGHT LAYER ERROR:",
            error
          );
        }
      };

    loadFlights();

    const timer =
      window.setInterval(
        loadFlights,
        60000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        timer
      );

      clearFlights();
    };
  }, [
    activeLayers.flights,
  ]);

  // ===================================================
  // LIVE SHIPS
  // ===================================================

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    if (
      !activeLayers.ships
    ) {
      clearShips();

      return;
    }

    let cancelled =
      false;

    const loadShips =
      async () => {
        try {
          const response =
            await fetch(
              `/api/ships/live?t=${Date.now()}`
            );

          if (!response.ok) {
            throw new Error(
              `Ships HTTP ${response.status}`
            );
          }

          const data:
            ShipResponse =
            await response.json();

          if (cancelled) {
            return;
          }

          clearShips();

          const ships =
            (data.ships || [])
              .filter(
                (ship) => {
                  const lat =
                    Number(
                      ship.latitude
                    );

                  const lng =
                    Number(
                      ship.longitude
                    );

                  return (
                    Number.isFinite(
                      lat
                    ) &&
                    Number.isFinite(
                      lng
                    ) &&
                    lat >= -90 &&
                    lat <= 90 &&
                    lng >= -180 &&
                    lng <= 180
                  );
                }
              )
              .slice(
                0,
                500
              );

          for (
            const ship
            of ships
          ) {
            const el =
              document.createElement(
                "button"
              );

            el.type =
              "button";

            el.innerHTML = `
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2 L16 8 L20 10 L18 19 L12 22 L6 19 L4 10 L8 8 Z"
                  fill="#22d3ee"
                  stroke="#ecfeff"
                  stroke-width="1.4"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 4 L12 20"
                  stroke="#083344"
                  stroke-width="1.3"
                />
              </svg>
            `;

            el.style.cssText =
              `
                border:none;
                background:transparent;
                cursor:pointer;
                width:24px;
                height:24px;
                padding:0;
                display:flex;
                align-items:center;
                justify-content:center;
                filter:drop-shadow(0 0 5px #06b6d4);
              `;

            const direction =
              Number(
                ship.heading ??
                ship.course ??
                0
              );

            if (
              Number.isFinite(
                direction
              )
            ) {
              el.style.transform =
                `rotate(${direction}deg)`;
            }

            const shipName =
              ship.shipName ||
              `MMSI ${ship.mmsi}`;

            const popup =
              new mapboxgl.Popup({
                offset: 15,
              })
                .setHTML(
                  `
                  <div style="color:#0f172a;min-width:220px;line-height:1.5">
                    <strong>
                      🚢 ${shipName}
                    </strong>

                    <div>
                      MMSI: ${ship.mmsi || "--"}
                    </div>

                    <div>
                      Speed: ${ship.speedKnots ?? "--"} knots
                    </div>

                    <div>
                      Course: ${ship.course ?? "--"}°
                    </div>

                    <div>
                      Heading: ${ship.heading ?? "--"}°
                    </div>

                    <div>
                      Navigation Status: ${ship.navigationStatus ?? "--"}
                    </div>

                    <div>
                      Position: ${Number(
                        ship.latitude
                      ).toFixed(
                        4
                      )}, ${Number(
                        ship.longitude
                      ).toFixed(
                        4
                      )}
                    </div>

                    <small>
                      Source: ${ship.source || data.source || "AISStream"}
                    </small>
                  </div>
                  `
                );

            const marker =
              new mapboxgl.Marker({
                element: el,
                anchor:
                  "center",
              })
                .setLngLat([
                  Number(
                    ship.longitude
                  ),
                  Number(
                    ship.latitude
                  ),
                ])
                .setPopup(
                  popup
                )
                .addTo(
                  map
                );

            shipMarkers.current.push(
              marker
            );
          }

          console.log(
            "LIVE SHIPS READY:",
            shipMarkers.current.length,
            "API COUNT:",
            data.count
          );
        } catch (error) {
          console.error(
            "SHIP LAYER ERROR:",
            error
          );
        }
      };

    loadShips();

    const timer =
      window.setInterval(
        loadShips,
        30000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        timer
      );

      clearShips();
    };
  }, [
    activeLayers.ships,
  ]);

  // ===================================================
  // WORLD INTERNET STATUS
  // ===================================================

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    if (
      !activeLayers.internet
    ) {
      clearInternet();

      return;
    }

    let cancelled =
      false;

    const loadInternet =
      async () => {
        try {
          const [
            outageResponse,
            geoResponse,
          ] =
            await Promise.all([
              fetch(
                `/api/internet/outages?t=${Date.now()}`
              ),

              fetch(
                COUNTRY_GEOJSON_URL
              ),
            ]);

          if (
            !outageResponse.ok
          ) {
            throw new Error(
              `Internet HTTP ${outageResponse.status}`
            );
          }

          if (
            !geoResponse.ok
          ) {
            throw new Error(
              `Country GeoJSON HTTP ${geoResponse.status}`
            );
          }

          const data:
            InternetResponse =
            await outageResponse.json();

          const geojson =
            await geoResponse.json();

          if (cancelled) {
            return;
          }

          clearInternet();

          const features =
            Array.isArray(
              geojson?.features
            )
              ? geojson.features
              : [];

          const outageMap =
            new Map<
              string,
              InternetOutage[]
            >();

          for (
            const outage
            of data.outages || []
          ) {
            const keys = [
              String(
                outage.countryCode ||
                  ""
              )
                .toUpperCase()
                .trim(),

              String(
                outage.countryName ||
                  ""
              )
                .toLowerCase()
                .trim(),
            ].filter(
              Boolean
            );

            for (
              const key
              of keys
            ) {
              const current =
                outageMap.get(
                  key
                ) || [];

              if (
                !current.includes(
                  outage
                )
              ) {
                current.push(
                  outage
                );
              }

              outageMap.set(
                key,
                current
              );
            }
          }

          const centroid = (
            geometry: any
          ):
            | [
                number,
                number,
              ]
            | null => {
            const points:
              number[][] = [];

            const walk = (
              value: any
            ) => {
              if (
                Array.isArray(
                  value
                ) &&
                value.length >=
                  2 &&
                typeof value[0] ===
                  "number" &&
                typeof value[1] ===
                  "number"
              ) {
                points.push([
                  value[0],
                  value[1],
                ]);

                return;
              }

              if (
                Array.isArray(
                  value
                )
              ) {
                value.forEach(
                  walk
                );
              }
            };

            walk(
              geometry?.coordinates
            );

            if (
              !points.length
            ) {
              return null;
            }

            let sx = 0;
            let sy = 0;

            for (
              const [
                x,
                y,
              ]
              of points
            ) {
              sx += x;
              sy += y;
            }

            return [
              sx /
                points.length,

              sy /
                points.length,
            ];
          };

          for (
            const feature
            of features
          ) {
            const props =
              feature?.properties ||
              {};

            const code =
              String(
                props[
                  "ISO3166-1-Alpha-3"
                ] ||
                  props.ISO_A3 ||
                  props.ADM0_A3 ||
                  ""
              )
                .toUpperCase()
                .trim();

            const countryName =
              String(
                props.ADMIN ||
                  props.NAME ||
                  props.name ||
                  "Unknown Country"
              ).trim();

            const nameKey =
              countryName
                .toLowerCase();

            const incidents =
              outageMap.get(
                code
              ) ||
              outageMap.get(
                nameKey
              ) ||
              [];

            const position =
              centroid(
                feature.geometry
              );

            if (!position) {
              continue;
            }

            const hasOutage =
              incidents.length >
              0;

            const severe =
              incidents.some(
                (item) =>
                  String(
                    item.outageType ||
                      ""
                  )
                    .toUpperCase()
                    .includes(
                      "NATIONWIDE"
                    )
              );

            const markerColor =
              severe
                ? "#ef4444"
                : hasOutage
                  ? "#f59e0b"
                  : "#22c55e";

            const markerText =
              hasOutage
                ? String(
                    incidents.length
                  )
                : "✓";

            const el =
              document.createElement(
                "button"
              );

            el.type =
              "button";

            el.textContent =
              markerText;

            el.title =
              hasOutage
                ? `${countryName}: ${incidents.length} recent outage event(s)`
                : `${countryName}: no recent Cloudflare outage detected`;

            el.style.cssText = `
              border:1px solid rgba(255,255,255,.9);
              background:${markerColor};
              color:#fff;
              border-radius:50%;
              min-width:18px;
              width:${hasOutage ? "26px" : "18px"};
              height:${hasOutage ? "26px" : "18px"};
              padding:0;
              cursor:pointer;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:${hasOutage ? "11px" : "9px"};
              font-weight:800;
              box-shadow:0 0 ${hasOutage ? "10px" : "5px"} ${markerColor};
            `;

            const incidentHtml =
              hasOutage
                ? incidents
                    .slice(
                      0,
                      8
                    )
                    .map(
                      (
                        item,
                        index
                      ) => `
                        <div
                          style="
                            margin-top:8px;
                            padding-top:7px;
                            border-top:1px solid #cbd5e1;
                          "
                        >
                          <strong>
                            Incident ${index + 1}
                          </strong>

                          <div>
                            Cause: ${item.outageCause || "Unknown"}
                          </div>

                          <div>
                            Type: ${item.outageType || "--"}
                          </div>

                          <div>
                            Start: ${item.startDate || "--"}
                          </div>

                          <div>
                            End: ${item.endDate || "Ongoing / --"}
                          </div>
                        </div>
                      `
                    )
                    .join(
                      ""
                    )
                : `
                    <div style="margin-top:7px">
                      No recent outage detected in the
                      current Cloudflare Radar outage feed.
                    </div>
                  `;

            const status =
              severe
                ? "MAJOR OUTAGE"
                : hasOutage
                  ? "RECENT OUTAGE"
                  : "NO RECENT OUTAGE DETECTED";

            const popup =
              new mapboxgl.Popup({
                offset: 15,
                maxWidth:
                  "320px",
              })
                .setHTML(
                  `
                  <div
                    style="
                      color:#0f172a;
                      min-width:230px;
                      max-height:330px;
                      overflow:auto;
                      line-height:1.45;
                    "
                  >
                    <strong>
                      🌐 ${countryName}
                    </strong>

                    <div>
                      Status: ${status}
                    </div>

                    <div>
                      Recent incidents: ${incidents.length}
                    </div>

                    ${incidentHtml}

                    <div
                      style="
                        margin-top:9px;
                        padding-top:7px;
                        border-top:1px solid #cbd5e1;
                      "
                    >
                      Global feed risk:
                      ${data.risk?.level || "--"}
                      (${data.risk?.score ?? "--"})
                    </div>

                    <small>
                      Source:
                      ${data.source || "Cloudflare Radar"}
                    </small>
                  </div>
                  `
                );

            const marker =
              new mapboxgl.Marker({
                element: el,
                anchor:
                  "center",
              })
                .setLngLat(
                  position
                )
                .setPopup(
                  popup
                )
                .addTo(
                  map
                );

            internetMarkers.current.push(
              marker
            );
          }

          console.log(
            "WORLD INTERNET STATUS READY:",
            internetMarkers.current.length,
            "OUTAGE RECORDS:",
            data.count
          );
        } catch (error) {
          console.error(
            "INTERNET LAYER ERROR:",
            error
          );
        }
      };

    loadInternet();

    const refresh =
      window.setInterval(
        loadInternet,
        300000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        refresh
      );

      clearInternet();
    };
  }, [
    activeLayers.internet,
  ]);

  // ===================================================
  // CONFLICT / GEOPOLITICAL LAYER
  // ===================================================

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    if (
      !activeLayers.conflicts
    ) {
      clearConflicts();

      clearImpactLines(map);

      return;
    }

    let cancelled =
      false;

    const loadConflicts =
      async () => {
        try {
          const response =
            await fetch(
              `/api/conflicts/live?t=${Date.now()}`
            );

          if (!response.ok) {
            throw new Error(
              `Conflicts HTTP ${response.status}`
            );
          }

          const data:
            ConflictResponse =
            await response.json();

          if (cancelled) {
            return;
          }

          clearConflicts();

          const events =
            (
              data.events ||
              []
            ).filter(
              (event) => {
                const lat =
                  Number(
                    event.latitude
                  );

                const lng =
                  Number(
                    event.longitude
                  );

                return (
                  Number.isFinite(
                    lat
                  ) &&
                  Number.isFinite(
                    lng
                  ) &&
                  lat >= -90 &&
                  lat <= 90 &&
                  lng >= -180 &&
                  lng <= 180
                );
              }
            );

          for (
            const event
            of events
          ) {
            const color =
              conflictColor(
                event.severity
              );

            const icon =
              conflictIcon(
                event.type
              );

            const isChokepoint =
              String(
                event.type
              ).toUpperCase() ===
              "CHOKEPOINT";

            const el =
              document.createElement(
                "button"
              );

            el.type =
              "button";

            el.textContent =
              icon;

            el.title =
              `${event.name} — ${event.severity}`;
            
            el.addEventListener(
              "click",
              () => {
                impactCallbackRef
                  .current?.(
                    event.id
                  );

                showImpactLines(
                  map,
                  event.id
                ).catch((error) => {
                  console.error(
                    "IMPACT LINES ERROR:",
                    error
                  );
                });
              }
            );

            el.style.cssText = `
              width:${isChokepoint ? "25px" : "29px"};
              height:${isChokepoint ? "25px" : "29px"};
              border:1px solid rgba(255,255,255,.9);
              border-radius:${isChokepoint ? "5px" : "50%"};
              background:${color};
              color:#ffffff;
              cursor:pointer;
              padding:0;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:${isChokepoint ? "13px" : "15px"};
              font-weight:900;
              box-shadow:
                0 0 8px ${color},
                0 0 18px ${color}66;
              transition:
                transform .15s ease,
                filter .15s ease;
            `;

            el.addEventListener(
              "mouseenter",
              () => {
                el.style.transform =
                  "scale(1.25)";

                el.style.filter =
                  "brightness(1.15)";
              }
            );

            el.addEventListener(
              "mouseleave",
              () => {
                el.style.transform =
                  "scale(1)";

                el.style.filter =
                  "brightness(1)";
              }
            );

            const countries =
              Array.isArray(
                event.countries
              ) &&
              event.countries
                .length
                ? event.countries.join(
                    ", "
                  )
                : "--";

            const popup =
              new mapboxgl.Popup({
                offset: 18,
                maxWidth:
                  "330px",
              })
                .setHTML(
                  `
                  <div
                    style="
                      color:#0f172a;
                      min-width:245px;
                      line-height:1.5;
                    "
                  >
                    <div
                      style="
                        display:flex;
                        align-items:center;
                        gap:7px;
                        margin-bottom:7px;
                      "
                    >
                      <span
                        style="
                          color:${color};
                          font-size:18px;
                          font-weight:900;
                        "
                      >
                        ${icon}
                      </span>

                      <strong>
                        ${event.name}
                      </strong>
                    </div>

                    <div>
                      <strong>Severity:</strong>
                      <span style="color:${color};font-weight:800">
                        ${event.severity}
                      </span>
                    </div>

                    <div>
                      <strong>Type:</strong>
                      ${event.type}
                    </div>

                    <div>
                      <strong>Status:</strong>
                      ${event.status || "--"}
                    </div>

                    <div>
                      <strong>Region:</strong>
                      ${event.region || "--"}
                    </div>

                    ${
                      !isChokepoint
                        ? `
                          <div>
                            <strong>Countries:</strong>
                            ${countries}
                          </div>
                        `
                        : ""
                    }

                    <div
                      style="
                        margin-top:8px;
                        padding-top:7px;
                        border-top:1px solid #cbd5e1;
                      "
                    >
                      ${event.description || "No description available."}
                    </div>

                    <div
                      style="
                        margin-top:7px;
                      "
                    >
                      <strong>
                        Market Impact:
                      </strong>

                      ${event.marketImpact || "--"}
                    </div>

                    <div
                      style="
                        margin-top:8px;
                        padding-top:7px;
                        border-top:1px solid #cbd5e1;
                      "
                    >
                      Global geopolitical risk:
                      <strong>
                        ${data.risk?.level || "--"}
                      </strong>

                      (${data.risk?.score ?? "--"})
                    </div>

                    <small>
                      Source:
                      ${data.source || "World Monitor"}
                    </small>
                  </div>
                  `
                );

            const marker =
              new mapboxgl.Marker({
                element: el,
                anchor:
                  "center",
              })
                .setLngLat([
                  Number(
                    event.longitude
                  ),
                  Number(
                    event.latitude
                  ),
                ])
                .setPopup(
                  popup
                )
                .addTo(
                  map
                );

            conflictMarkers.current.push(
              marker
            );
          }

          console.log(
            "CONFLICT LAYER READY:",
            conflictMarkers.current.length,
            "GLOBAL RISK:",
            data.risk?.score,
            data.risk?.level
          );
        } catch (error) {
          console.error(
            "CONFLICT LAYER ERROR:",
            error
          );
        }
      };

    loadConflicts();

    // Refresh every 5 minutes.
    const timer =
      window.setInterval(
        loadConflicts,
        300000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        timer
      );

      clearConflicts();
    };
  }, [
    activeLayers.conflicts,
  ]);

  // ===================================================
  // MAP
  // ===================================================

  useEffect(() => {
    if (
      !mapContainer.current ||
      mapRef.current
    ) {
      return;
    }

    const map =
      new mapboxgl.Map({
        container:
          mapContainer.current,

        style:
          "mapbox://styles/mapbox/dark-v11",

        center: [
          20,
          20,
        ],

        zoom: 1.45,

        minZoom: 1,

        maxZoom: 18,

        projection:
          "globe",
      });

    mapRef.current =
      map;

    map.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    map.on(
      "load",
      async () => {
        map.setFog({
          color:
            "rgb(15,23,42)",

          "high-color":
            "rgb(30,41,59)",

          "space-color":
            "rgb(2,6,23)",

          "horizon-blend":
            0.08,

          "star-intensity":
            0.15,
        });

        try {
          const response =
            await fetch(
              COUNTRY_GEOJSON_URL
            );

          const geojson =
            await response.json();

          map.addSource(
            "countries-source",
            {
              type: "geojson",
              data: geojson,
              generateId: true,
            }
          );

          map.addLayer({
            id:
              "countries-base",

            type: "fill",

            source:
              "countries-source",

            paint: {
              "fill-color":
                "#0f172a",

              "fill-opacity":
                0.05,
            },
          });

          map.addLayer({
            id:
              "countries-hover",

            type: "fill",

            source:
              "countries-source",

            paint: {
              "fill-color":
                "#38bdf8",

              "fill-opacity": [
                "case",

                [
                  "boolean",

                  [
                    "feature-state",
                    "hover",
                  ],

                  false,
                ],

                0.25,
                0,
              ],
            },
          });

          map.addLayer({
            id:
              "country-selected",

            type: "fill",

            source:
              "countries-source",

            paint: {
              "fill-color":
                "#22c55e",

              "fill-opacity": [
                "case",

                [
                  "boolean",

                  [
                    "feature-state",
                    "selected",
                  ],

                  false,
                ],

                0.22,
                0,
              ],
            },
          });

          map.addLayer({
            id:
              "countries-border",

            type: "line",

            source:
              "countries-source",

            paint: {
              "line-color":
                "#64748b",

              "line-width":
                0.7,

              "line-opacity":
                0.7,
            },
          });

          let hoveredId:
            | number
            | string
            | null =
            null;

          let selectedId:
            | number
            | string
            | null =
            null;

          map.on(
            "mousemove",
            "countries-hover",
            (event) => {
              const feature =
                event.features?.[0];

              if (!feature) {
                return;
              }

              map.getCanvas()
                .style.cursor =
                "pointer";

              if (
                hoveredId !==
                null
              ) {
                map.setFeatureState(
                  {
                    source:
                      "countries-source",

                    id:
                      hoveredId,
                  },

                  {
                    hover:
                      false,
                  }
                );
              }

              hoveredId =
                feature.id ??
                null;

              if (
                hoveredId !==
                null
              ) {
                map.setFeatureState(
                  {
                    source:
                      "countries-source",

                    id:
                      hoveredId,
                  },

                  {
                    hover:
                      true,
                  }
                );
              }
            }
          );

          map.on(
            "mouseleave",
            "countries-hover",
            () => {
              map.getCanvas()
                .style.cursor =
                "";

              if (
                hoveredId !==
                null
              ) {
                map.setFeatureState(
                  {
                    source:
                      "countries-source",

                    id:
                      hoveredId,
                  },

                  {
                    hover:
                      false,
                  }
                );
              }

              hoveredId =
                null;
            }
          );

          map.on(
            "click",
            "countries-hover",
            (event) => {
              const feature =
                event.features?.[0];

              if (!feature) {
                return;
              }

              const props =
                feature.properties as
                  | CountryProps
                  | undefined;

              const name =
                String(
                  props?.ADMIN ||
                    props?.NAME ||
                    props?.name ||
                    "Unknown Country"
                );

              const code =
                String(
                  props?.[
                    "ISO3166-1-Alpha-3"
                  ] ||
                    props?.ISO_A3 ||
                    props?.ADM0_A3 ||
                    ""
                )
                  .toUpperCase()
                  .trim();

              if (
                selectedId !==
                null
              ) {
                map.setFeatureState(
                  {
                    source:
                      "countries-source",

                    id:
                      selectedId,
                  },

                  {
                    selected:
                      false,
                  }
                );
              }

              selectedId =
                feature.id ??
                null;

              if (
                selectedId !==
                null
              ) {
                map.setFeatureState(
                  {
                    source:
                      "countries-source",

                    id:
                      selectedId,
                  },

                  {
                    selected:
                      true,
                  }
                );
              }

              new mapboxgl.Popup()
                .setLngLat(
                  event.lngLat
                )
                .setHTML(
                  `
                  <div style="color:#0f172a">
                    <strong>
                      ${name}
                    </strong>

                    <br/>

                    <small>
                      ${code || "ISO unavailable"}
                    </small>
                  </div>
                  `
                )
                .addTo(
                  map
                );

              if (code) {
                callbackRef
                  .current?.(
                    name,
                    code
                  );
              }
            }
          );
        } catch (error) {
          console.error(
            "COUNTRY MAP ERROR:",
            error
          );
        }
      }
    );

    return () => {
      clearWeather();
      clearFlights();
      clearShips();
      clearInternet();
      clearConflicts();
      clearImpactLines(map);

      map.remove();

      mapRef.current =
        null;
    };
  }, []);

  // ===================================================
  // UI
  // ===================================================

  return (
    <section className="map-panel">
      <div className="section-title">
        <div>
          <h2>
            🌍 World Intelligence Map
          </h2>

          <p>
            Countries, live assets and geopolitical intelligence
          </p>
        </div>

        <span>
          MAPBOX
        </span>
      </div>

      <div
        ref={
          mapContainer
        }
        style={{
          width:
            "100%",

          height:
            "580px",

          minHeight:
            "580px",

          borderRadius:
            "14px",

          overflow:
            "hidden",

          background:
            "#020617",
        }}
      />

      <MapLayerControls
        activeLayers={
          activeLayers
        }
        onToggle={
          toggleLayer
        }
      />
    </section>
  );
}

export default MapboxWorldMap;



