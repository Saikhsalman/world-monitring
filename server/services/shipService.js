import WebSocket from "ws";

// =====================================================
// CONFIG
// =====================================================

const AIS_URL =
  "wss://stream.aisstream.io/v0/stream";

const MAX_SHIPS =
  1500;

const SHIP_TTL_MS =
  15 * 60 * 1000;

const RECONNECT_BASE_MS =
  3000;

const RECONNECT_MAX_MS =
  60000;

// Global-ish coverage using multiple large boxes.
// AISStream requires BoundingBoxes.
const WORLD_BOUNDING_BOXES = [
  [[-90, -180], [0, 0]],
  [[-90, 0], [0, 180]],
  [[0, -180], [90, 0]],
  [[0, 0], [90, 180]],
];

// =====================================================
// STATE
// =====================================================

const ships =
  new Map();

let socket =
  null;

let connected =
  false;

let reconnectAttempt =
  0;

let reconnectTimer =
  null;

let started =
  false;

let lastMessageAt =
  null;

// =====================================================
// HELPERS
// =====================================================

function safeNumber(
  value
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

function normalizeShip(
  event
) {
  const metadata =
    event?.MetaData || {};

  const report =
    event?.Message
      ?.PositionReport || {};

  const mmsi =
    String(
      metadata.MMSI ||
      report.UserID ||
      ""
    ).trim();

  const latitude =
    safeNumber(
      metadata.Latitude ??
      report.Latitude
    );

  const longitude =
    safeNumber(
      metadata.Longitude ??
      report.Longitude
    );

  if (
    !mmsi ||
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    mmsi,

    shipName:
      String(
        metadata.ShipName ||
        `MMSI ${mmsi}`
      ).trim(),

    latitude,

    longitude,

    speedKnots:
      safeNumber(
        report.Sog
      ),

    course:
      safeNumber(
        report.Cog
      ),

    heading:
      safeNumber(
        report.TrueHeading
      ),

    navigationStatus:
      report.NavigationalStatus ??
      null,

    valid:
      report.Valid ??
      true,

    source:
      "AISStream",

    receivedAt:
      new Date().toISOString(),

    receivedAtMs:
      Date.now(),
  };
}

// =====================================================
// CLEAN OLD SHIPS
// =====================================================

function cleanupShips() {
  const now =
    Date.now();

  for (
    const [
      mmsi,
      ship,
    ]
    of ships.entries()
  ) {
    if (
      now -
      ship.receivedAtMs >
      SHIP_TTL_MS
    ) {
      ships.delete(
        mmsi
      );
    }
  }

  if (
    ships.size >
    MAX_SHIPS
  ) {
    const sorted =
      [...ships.values()]
        .sort(
          (
            a,
            b
          ) =>
            b.receivedAtMs -
            a.receivedAtMs
        );

    ships.clear();

    for (
      const ship
      of sorted.slice(
        0,
        MAX_SHIPS
      )
    ) {
      ships.set(
        ship.mmsi,
        ship
      );
    }
  }
}

// =====================================================
// RECONNECT
// =====================================================

function scheduleReconnect() {
  if (
    reconnectTimer
  ) {
    return;
  }

  const delay =
    Math.min(
      RECONNECT_BASE_MS *
        2 **
          reconnectAttempt,
      RECONNECT_MAX_MS
    );

  reconnectAttempt++;

  reconnectTimer =
    setTimeout(
      () => {
        reconnectTimer =
          null;

        connectAISStream();
      },
      delay
    );

  console.log(
    `AIS reconnect scheduled in ${delay}ms`
  );
}

// =====================================================
// CONNECT
// =====================================================

function connectAISStream() {
  const apiKey =
    process.env
      .AISSTREAM_API_KEY;

  if (!apiKey) {
    console.error(
      "AISSTREAM_API_KEY missing"
    );

    return;
  }

  if (
    socket &&
    (
      socket.readyState ===
        WebSocket.OPEN ||
      socket.readyState ===
        WebSocket.CONNECTING
    )
  ) {
    return;
  }

  console.log(
    "CONNECTING AISSTREAM..."
  );

  socket =
    new WebSocket(
      AIS_URL,
      {
        perMessageDeflate:
          true,
      }
    );

  socket.on(
    "open",
    () => {
      connected =
        true;

      reconnectAttempt =
        0;

      console.log(
        "AISSTREAM CONNECTED"
      );

      const subscription = {
        APIKey:
          apiKey,

        BoundingBoxes:
          WORLD_BOUNDING_BOXES,

        FilterMessageTypes: [
          "PositionReport",
        ],
      };

      socket.send(
        JSON.stringify(
          subscription
        )
      );
    }
  );

  socket.on(
    "message",
    (buffer) => {
      try {
        const event =
          JSON.parse(
            buffer.toString()
          );

        if (
          event.MessageType ===
          "SubscriptionConfirmation"
        ) {
          console.log(
            "AISSTREAM SUBSCRIPTION CONFIRMED"
          );

          return;
        }

        if (
          event.MessageType !==
          "PositionReport"
        ) {
          return;
        }

        const ship =
          normalizeShip(
            event
          );

        if (!ship) {
          return;
        }

        ships.set(
          ship.mmsi,
          ship
        );

        lastMessageAt =
          new Date()
            .toISOString();

        cleanupShips();
      } catch (
        error
      ) {
        console.error(
          "AIS MESSAGE ERROR:",
          error.message
        );
      }
    }
  );

  socket.on(
    "close",
    () => {
      connected =
        false;

      console.warn(
        "AISSTREAM DISCONNECTED"
      );

      scheduleReconnect();
    }
  );

  socket.on(
    "error",
    (error) => {
      connected =
        false;

      console.error(
        "AISSTREAM ERROR:",
        error.message
      );
    }
  );
}

// =====================================================
// START STREAM
// =====================================================

export function startShipStream() {
  if (started) {
    return;
  }

  started =
    true;

  connectAISStream();

  setInterval(
    cleanupShips,
    60 * 1000
  );
}

// =====================================================
// LIVE SHIPS API DATA
// =====================================================

export function getLiveShips() {
  cleanupShips();

  const list =
    [...ships.values()]
      .sort(
        (
          a,
          b
        ) =>
          b.receivedAtMs -
          a.receivedAtMs
      )
      .map(
        ({
          receivedAtMs,
          ...ship
        }) =>
          ship
      );

  return {
    status:
      connected
        ? "live"
        : list.length > 0
          ? "stale"
          : "connecting",

    source:
      "AISStream",

    connected,

    count:
      list.length,

    ships:
      list,

    lastMessageAt,

    updatedAt:
      new Date()
        .toISOString(),
  };
}
