import {
  useState,
} from "react";

type Language =
  | "hinglish"
  | "hi"
  | "en";

type Props = {
  selectedCountryName?: string;

  selectedEvent?: {
    id?: string;
    name?: string;
    region?: string;
    severity?: string;
    type?: string;
  } | null;
};

type DataUsed = {
  macro?: boolean;
  markets?: boolean;
  energy?: boolean;
  news?: boolean;
  internet?: boolean;
  conflicts?: boolean;
  globalRisk?: boolean;
};

type AIResponse = {
  status: string;
  model?: string;
  answer?: string;

  contextSummary?: {
    globalRisk?: number | null;
    globalRiskLevel?: string | null;
    conflictCount?: number | null;
    internetRisk?: number | null;
  };

  dataUsed?: DataUsed;
};

function AIIntelligencePanel({
  selectedCountryName = "",
  selectedEvent = null,
}: Props) {
  const [
    question,
    setQuestion,
  ] =
    useState("");

  const [
    language,
    setLanguage,
  ] =
    useState<Language>(
      "hinglish"
    );

  const [
    answer,
    setAnswer,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    context,
    setContext,
  ] =
    useState<
      AIResponse["contextSummary"]
    >(undefined);

  const [
    dataUsed,
    setDataUsed,
  ] =
    useState<
      DataUsed | undefined
    >(undefined);

  const askAI =
    async () => {
      const cleanQuestion =
        question.trim();

      if (!cleanQuestion) {
        setError(
          "Pehle question likho."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/ai/ask",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  question:
                    cleanQuestion,

                  language,

                  focus: {
                    country:
                      selectedCountryName ||
                      null,

                    event:
                      selectedEvent
                        ? {
                            id:
                              selectedEvent.id,

                            name:
                              selectedEvent.name,

                            region:
                              selectedEvent.region,

                            severity:
                              selectedEvent.severity,

                            type:
                              selectedEvent.type,
                          }
                        : null,
                  },
                }),
            }
          );

        const data:
          AIResponse & {
            error?: string;
            details?: string;
          } =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              `HTTP ${response.status}`
          );
        }

        if (!data.answer) {
          throw new Error(
            "AI returned no answer"
          );
        }

        setAnswer(
          data.answer
        );

        setContext(
          data.contextSummary
        );

        setDataUsed(
          data.dataUsed
        );
      } catch (err) {
        console.error(
          "AI INTELLIGENCE ERROR:",
          err
        );

        setAnswer("");
        setContext(undefined);
        setDataUsed(undefined);

        setError(
          err instanceof Error
            ? err.message
            : "AI unavailable"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="wm-ai-panel">
      <div className="wm-ai-header">
        <div>
          <span className="wm-ai-icon">
            ✦
          </span>

          <div>
            <strong>
              AI INTELLIGENCE
            </strong>

            <small>
              WORLD MONITOR COPILOT
            </small>
          </div>
        </div>

        <span className="wm-ai-live">
          LIVE DATA
        </span>
      </div>

      {(selectedCountryName ||
        selectedEvent) && (
        <div className="wm-ai-context">
          {selectedCountryName && (
            <span>
              COUNTRY
              <strong>
                {
                  selectedCountryName
                }
              </strong>
            </span>
          )}

          {selectedEvent?.name && (
            <span>
              EVENT
              <strong>
                {
                  selectedEvent.name
                }
              </strong>
            </span>
          )}
        </div>
      )}

      <div className="wm-ai-language">
        <button
          type="button"
          className={
            language ===
            "hinglish"
              ? "active"
              : ""
          }
          onClick={() =>
            setLanguage(
              "hinglish"
            )
          }
        >
          Hinglish
        </button>

        <button
          type="button"
          className={
            language === "hi"
              ? "active"
              : ""
          }
          onClick={() =>
            setLanguage("hi")
          }
        >
          हिंदी
        </button>

        <button
          type="button"
          className={
            language === "en"
              ? "active"
              : ""
          }
          onClick={() =>
            setLanguage("en")
          }
        >
          English
        </button>
      </div>

      <div className="wm-ai-quick">
        <button
          type="button"
          onClick={() =>
            setQuestion(
              selectedCountryName
                ? `${selectedCountryName} par current global situation ka kya impact hai?`
                : "Abhi global risk kyu elevated hai?"
            )
          }
        >
          Explain Impact
        </button>

        <button
          type="button"
          onClick={() =>
            setQuestion(
              selectedEvent?.name
                ? `${selectedEvent.name} ka global aur India impact explain karo.`
                : "Current geopolitical risks summarize karo."
            )
          }
        >
          Explain Event
        </button>

        <button
          type="button"
          onClick={() =>
            setQuestion(
              "Current World Monitor dashboard ka complete intelligence brief do. Global risk, macro, markets, energy, news, internet aur conflicts ko combine karke batao. Sabse important risks aur India ke liye watch points bhi batao."
            )
          }
        >
          Dashboard Brief
        </button>
        <button
          type="button"
          onClick={() =>
            setQuestion(
              "Current Global Risk score ke main drivers kya hain? Har driver ka reason aur possible market impact simple Hinglish me explain karo."
            )
          }
        >
          Risk Drivers
        </button>
      </div>

      <textarea
        className="wm-ai-input"
        value={question}
        onChange={(
          event
        ) =>
          setQuestion(
            event.target.value
          )
        }
        onKeyDown={(
          event
        ) => {
          if (
            event.key ===
              "Enter" &&
            !event.shiftKey
          ) {
            event.preventDefault();

            if (!loading) {
              void askAI();
            }
          }
        }}
        placeholder="Ask about selected country, event, global risk, markets, energy..."
        rows={3}
      />

      <button
        type="button"
        className="wm-ai-ask"
        disabled={
          loading ||
          !question.trim()
        }
        onClick={() =>
          void askAI()
        }
      >
        {loading
          ? "ANALYZING..."
          : "ASK WORLD MONITOR"}
      </button>

      {error && (
        <div className="wm-ai-error">
          {error}
        </div>
      )}

      {answer && (
        <div className="wm-ai-answer">
          <div className="wm-ai-answer-title">
            ✦ AI ANALYSIS
          </div>

          <div className="wm-ai-answer-text">
            {answer}
          </div>

          {context && (
            <div className="wm-ai-context">
              <span>
                RISK
                <strong>
                  {context.globalRisk ??
                    "--"}
                </strong>
              </span>

              <span>
                LEVEL
                <strong>
                  {context.globalRiskLevel ??
                    "UNKNOWN"}
                </strong>
              </span>

              <span>
                CONFLICTS
                <strong>
                  {context.conflictCount ??
                    "--"}
                </strong>
              </span>

              <span>
                INTERNET
                <strong>
                  {context.internetRisk ??
                    "--"}
                </strong>
              </span>
            </div>
          )}

          {dataUsed && (
            <div className="wm-ai-data-used">
              <strong>
                DATA USED
              </strong>

              <div>
                {dataUsed.globalRisk && (
                  <span>
                    GLOBAL RISK
                  </span>
                )}

                {dataUsed.macro && (
                  <span>
                    FRED MACRO
                  </span>
                )}

                {dataUsed.markets && (
                  <span>
                    MARKETS
                  </span>
                )}

                {dataUsed.energy && (
                  <span>
                    EIA ENERGY
                  </span>
                )}

                {dataUsed.news && (
                  <span>
                    NEWS
                  </span>
                )}

                {dataUsed.internet && (
                  <span>
                    INTERNET
                  </span>
                )}

                {dataUsed.conflicts && (
                  <span>
                    CONFLICTS
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AIIntelligencePanel;


