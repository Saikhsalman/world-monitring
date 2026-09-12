import {
  useEffect,
  useState,
} from "react";

type TimelineEvent = {
  id: string;
  type:
    | "conflict"
    | "energy"
    | "market"
    | "internet"
    | "macro";

  title: string;
  detail?: string;

  severity:
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  eventId?: string;

  timestamp: string;
};

type Props = {
  onImpactSelect?: (
    eventId: string
  ) => void;
};

function iconFor(
  type: TimelineEvent["type"]
) {
  switch (type) {
    case "conflict":
      return "⚠";

    case "energy":
      return "🛢";

    case "market":
      return "📉";

    case "internet":
      return "🌐";

    case "macro":
      return "◈";

    default:
      return "●";
  }
}

function timeText(
  timestamp: string
) {
  try {
    return new Date(
      timestamp
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "--:--";
  }
}

function LiveEventTimeline({
  onImpactSelect,
}: Props) {
  const [
    events,
    setEvents,
  ] =
    useState<
      TimelineEvent[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        const response =
          await fetch(
            `/api/intelligence/impact-events?t=${Date.now()}`
          );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        const mapped:
          TimelineEvent[] =
          (
            data.events ||
            []
          )
            .map(
              (
                item: any
              ) => ({
                id:
                  item.id,

                eventId:
                  item.id,

                type:
                  "conflict" as const,

                title:
                  item.name,

                detail:
                  item.region ||
                  item.type ||
                  "Global event",

                severity:
                  item.severity ||
                  "MEDIUM",

                timestamp:
                  data.updatedAt ||
                  new Date()
                    .toISOString(),
              })
            )
            .slice(
              0,
              12
            );

        setEvents(
          mapped
        );
      } catch (error) {
        console.error(
          "TIMELINE ERROR:",
          error
        );

        if (
          !cancelled
        ) {
          setEvents(
            []
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }

    load();

    const timer =
      window.setInterval(
        load,
        60000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        timer
      );
    };
  }, []);

  return (
    <section className="wm-event-timeline">
      <div className="wm-timeline-header">
        <div>
          <span className="wm-live-dot" />

          <strong>
            LIVE EVENT TIMELINE
          </strong>
        </div>

        <span>
          AUTO REFRESH · 60S
        </span>
      </div>

      <div className="wm-timeline-track">
        {loading ? (
          <div className="wm-timeline-empty">
            Loading intelligence...
          </div>
        ) : events.length ===
          0 ? (
          <div className="wm-timeline-empty">
            No intelligence events
          </div>
        ) : (
          events.map(
            (event) => (
              <button
                key={
                  event.id
                }
                type="button"
                className={`wm-timeline-event severity-${event.severity.toLowerCase()}`}
                onClick={() => {
                  if (
                    event.eventId
                  ) {
                    onImpactSelect?.(
                      event.eventId
                    );
                  }
                }}
              >
                <span className="wm-timeline-time">
                  {timeText(
                    event.timestamp
                  )}
                </span>

                <span className="wm-timeline-icon">
                  {iconFor(
                    event.type
                  )}
                </span>

                <span className="wm-timeline-copy">
                  <strong>
                    {
                      event.title
                    }
                  </strong>

                  <small>
                    {event.detail}
                  </small>
                </span>

                <span className="wm-timeline-severity">
                  {
                    event.severity
                  }
                </span>
              </button>
            )
          )
        )}
      </div>
    </section>
  );
}

export default LiveEventTimeline;