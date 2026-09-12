import mapboxgl from "mapbox-gl";
import { API_BASE_URL } from "../config";

type ImpactCountry = {
  countryCode: string;
  countryName: string;
  impactScore: number;
  impactLevel: string;
};

type ImpactResponse = {
  status: string;

  event: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  };

  affectedCountries: ImpactCountry[];
};

const COUNTRY_CENTERS: Record<
  string,
  [number, number]
> = {
  IND: [78.9629, 20.5937],
  CHN: [104.1954, 35.8617],
  JPN: [138.2529, 36.2048],
  KOR: [127.7669, 35.9078],
  DEU: [10.4515, 51.1657],
  GBR: [-3.4360, 55.3781],
  USA: [-95.7129, 37.0902],
};

const SOURCE_ID =
  "impact-lines-source";

const LINE_LAYER =
  "impact-lines-layer";

const POINT_LAYER =
  "impact-destination-layer";

let animationTimer:
  number | null =
  null;

// =====================================================
// CLEAR
// =====================================================

export function clearImpactLines(
  map: mapboxgl.Map
) {
  if (
    animationTimer !== null
  ) {
    window.clearInterval(
      animationTimer
    );

    animationTimer =
      null;
  }

  if (
    map.getLayer(
      POINT_LAYER
    )
  ) {
    map.removeLayer(
      POINT_LAYER
    );
  }

  if (
    map.getLayer(
      LINE_LAYER
    )
  ) {
    map.removeLayer(
      LINE_LAYER
    );
  }

  if (
    map.getSource(
      SOURCE_ID
    )
  ) {
    map.removeSource(
      SOURCE_ID
    );
  }
}

// =====================================================
// IMPACT COLOR
// =====================================================

function impactColor(
  level: string
) {
  switch (
    String(level)
      .toUpperCase()
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

// =====================================================
// SHOW IMPACT LINES
// =====================================================

export async function showImpactLines(
  map: mapboxgl.Map,
  eventId: string
) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/intelligence/impact/${eventId}?t=${Date.now()}`
    );

  if (!response.ok) {
    throw new Error(
      `Impact HTTP ${response.status}`
    );
  }

  const data:
    ImpactResponse =
    await response.json();

  if (
    data.status !==
    "ready"
  ) {
    throw new Error(
      "Impact data unavailable"
    );
  }

  clearImpactLines(
    map
  );

  const origin:
    [number, number] = [
      Number(
        data.event.longitude
      ),

      Number(
        data.event.latitude
      ),
    ];

  const lineFeatures:
    GeoJSON.Feature[] =
    [];

  const pointFeatures:
    GeoJSON.Feature[] =
    [];

  for (
    const country
    of data.affectedCountries ||
    []
  ) {
    const destination =
      COUNTRY_CENTERS[
        country.countryCode
      ];

    if (!destination) {
      continue;
    }

    const color =
      impactColor(
        country.impactLevel
      );

    lineFeatures.push({
      type: "Feature",

      properties: {
        countryCode:
          country.countryCode,

        countryName:
          country.countryName,

        impactScore:
          country.impactScore,

        impactLevel:
          country.impactLevel,

        color,
      },

      geometry: {
        type:
          "LineString",

        coordinates: [
          origin,
          destination,
        ],
      },
    });

    pointFeatures.push({
      type: "Feature",

      properties: {
        countryCode:
          country.countryCode,

        countryName:
          country.countryName,

        impactScore:
          country.impactScore,

        impactLevel:
          country.impactLevel,

        color,
      },

      geometry: {
        type:
          "Point",

        coordinates:
          destination,
      },
    });
  }

  const geojson:
    GeoJSON.FeatureCollection =
    {
      type:
        "FeatureCollection",

      features: [
        ...lineFeatures,
        ...pointFeatures,
      ],
    };

  map.addSource(
    SOURCE_ID,
    {
      type: "geojson",
      data: geojson,
    }
  );

  // ===================================================
  // IMPACT LINES
  // ===================================================

  map.addLayer({
    id:
      LINE_LAYER,

    type:
      "line",

    source:
      SOURCE_ID,

    filter: [
      "==",
      [
        "geometry-type",
      ],
      "LineString",
    ],

    paint: {
      "line-color": [
        "get",
        "color",
      ],

      "line-width": [
        "interpolate",
        [
          "linear",
        ],
        [
          "get",
          "impactScore",
        ],
        0,
        1.5,
        100,
        4,
      ],

      "line-opacity":
        0.8,

      "line-blur":
        0.5,
    },
  });

  // ===================================================
  // DESTINATION COUNTRIES
  // ===================================================

  map.addLayer({
    id:
      POINT_LAYER,

    type:
      "circle",

    source:
      SOURCE_ID,

    filter: [
      "==",
      [
        "geometry-type",
      ],
      "Point",
    ],

    paint: {
      "circle-radius": [
        "interpolate",
        [
          "linear",
        ],
        [
          "get",
          "impactScore",
        ],
        0,
        6,
        100,
        13,
      ],

      "circle-color": [
        "get",
        "color",
      ],

      "circle-opacity":
        0.9,

      "circle-stroke-color":
        "#ffffff",

      "circle-stroke-width":
        1.5,

      "circle-blur":
        0.1,
    },
  });

  // ===================================================
  // ANIMATION
  // ===================================================

  let pulse =
    false;

  animationTimer =
    window.setInterval(
      () => {
        if (
          !map.getLayer(
            LINE_LAYER
          )
        ) {
          return;
        }

        pulse =
          !pulse;

        map.setPaintProperty(
          LINE_LAYER,
          "line-opacity",
          pulse
            ? 0.95
            : 0.45
        );

        map.setPaintProperty(
          LINE_LAYER,
          "line-blur",
          pulse
            ? 0
            : 1.5
        );
      },
      650
    );

  // ===================================================
  // COUNTRY IMPACT POPUP
  // ===================================================

  map.on(
    "click",
    POINT_LAYER,
    (event) => {
      const feature =
        event.features?.[0];

      if (!feature) {
        return;
      }

      const props =
        feature.properties;

      new mapboxgl.Popup({
        offset: 12,
      })
        .setLngLat(
          event.lngLat
        )
        .setHTML(
          `
          <div
            style="
              color:#0f172a;
              min-width:210px;
              line-height:1.5;
            "
          >
            <strong>
              ${props?.countryName || "--"}
            </strong>

            <div>
              Event:
              ${data.event.name}
            </div>

            <div>
              Impact Score:
              <strong>
                ${props?.impactScore || "--"}
              </strong>
            </div>

            <div>
              Impact Level:
              <strong
                style="
                  color:${props?.color || "#0f172a"};
                "
              >
                ${props?.impactLevel || "--"}
              </strong>
            </div>

            <small>
              World Monitor Impact Engine
            </small>
          </div>
          `
        )
        .addTo(
          map
        );
    }
  );

  map.on(
    "mouseenter",
    POINT_LAYER,
    () => {
      map.getCanvas()
        .style.cursor =
        "pointer";
    }
  );

  map.on(
    "mouseleave",
    POINT_LAYER,
    () => {
      map.getCanvas()
        .style.cursor =
        "";
    }
  );

  console.log(
    "IMPACT LINES READY:",
    lineFeatures.length,
    data.event.name
  );
}
