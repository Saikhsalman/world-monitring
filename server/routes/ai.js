import express from "express";

const router = express.Router();

const GEMINI_MODEL =
  "gemini-3.5-flash";

// =====================================================
// HELPERS
// =====================================================

async function safeFetchJson(
  url
) {
  try {
    const response =
      await fetch(url);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function compactContext({
  macro,
  markets,
  energy,
  news,
  internet,
  conflicts,
  globalRisk,
}) {
  return {
    globalRisk: globalRisk
      ? {
          score:
            globalRisk.globalRiskScore ??
            null,

          level:
            globalRisk.globalRiskLevel ??
            null,

          bias:
            globalRisk.bias ??
            null,

          components:
            globalRisk.components ??
            null,

          drivers:
            globalRisk.drivers ??
            [],
        }
      : null,

    macro: macro
      ? {
          us10y:
            macro?.us10y?.value ??
            null,

          fedFunds:
            macro?.fedFunds?.value ??
            null,

          inflation:
            macro?.inflation ??
            null,

          unemployment:
            macro
              ?.unemployment
              ?.value ??
            null,

          dollarIndex:
            macro
              ?.dollarIndex
              ?.value ??
            null,
        }
      : null,

    markets: markets
      ? {
          status:
            markets.status ??
            null,

          data:
            markets.markets ??
            markets,
        }
      : null,

    energy: energy
      ? {
          wti:
            energy
              ?.prices
              ?.wti
              ?.value ??
            null,

          brent:
            energy
              ?.prices
              ?.brent
              ?.value ??
            null,

          energyScore:
            energy
              ?.intelligence
              ?.energyScore ??
            null,

          energyBias:
            energy
              ?.intelligence
              ?.energyBias ??
            null,

          indiaOilImpact:
            energy
              ?.intelligence
              ?.indiaOilImpact ??
            null,

          reasons:
            energy
              ?.intelligence
              ?.reasons ??
            [],
        }
      : null,

    internet: internet
      ? {
          count:
            internet.count ??
            null,

          risk:
            internet.risk ??
            null,

          outages:
            Array.isArray(
              internet.outages
            )
              ? internet.outages.slice(
                  0,
                  10
                )
              : [],
        }
      : null,

    conflicts: conflicts
      ? {
          risk:
            conflicts.risk ??
            null,

          count:
            conflicts.count ??
            null,

          conflictCount:
            conflicts.conflictCount ??
            null,

          chokepointCount:
            conflicts.chokepointCount ??
            null,

          events:
            Array.isArray(
              conflicts.events
            )
              ? conflicts.events
                  .slice(
                    0,
                    12
                  )
                  .map(
                    (item) => ({
                      id:
                        item.id,

                      name:
                        item.name,

                      region:
                        item.region,

                      type:
                        item.type,

                      severity:
                        item.severity,

                      status:
                        item.status,

                      marketImpact:
                        item.marketImpact,
                    })
                  )
              : [],
        }
      : null,

    news: news
      ? {
          riskScore:
            news.riskScore ??
            news
              ?.newsRisk
              ?.score ??
            null,

          items:
            (
              news.articles ||
              news.items ||
              news.news ||
              []
            )
              .slice(
                0,
                10
              )
              .map(
                (item) => ({
                  title:
                    item.title ??
                    item.headline ??
                    null,

                  severity:
                    item.severity ??
                    item.impact ??
                    null,

                  source:
                    item.source ??
                    null,
                })
              ),
        }
      : null,
  };
}

function buildPrompt(
  question,
  language,
  context
) {
  const languageRule =
    language === "hi"
      ? "Answer in Hindi."
      : language ===
          "hinglish"
        ? "Answer in natural Hinglish using Roman Hindi with English market terms where useful."
        : "Answer in English.";

  return `
You are World Monitor AI Intelligence Copilot.

Your job is to answer using the supplied World Monitor live context.

RULES:
1. ${languageRule}
2. Do not invent numbers or events.
3. If data is missing, say that clearly.
4. Distinguish facts from interpretation.
5. Do not present predictions as certainty.
6. Prefer cause-and-effect explanations.
7. If the question is about India, explain likely India impact where supported by the context.
8. Keep the answer concise unless the user asks for detail.
9. Use the World Monitor context as the primary source.

WORLD MONITOR LIVE CONTEXT:
${JSON.stringify(
  context,
  null,
  2
)}

USER QUESTION:
${question}
`;
}

// =====================================================
// POST /api/ai/ask
// =====================================================

router.post(
  "/ask",
  async (req, res) => {
    try {
      const {
  question,
  language = "hinglish",
  focus = {},
} =
  req.body || {};

      if (
        !question ||
        !String(question).trim()
      ) {
        return res
          .status(400)
          .json({
            status:
              "error",

            error:
              "Question is required",
          });
      }

      const apiKey =
        process.env
          .GEMINI_API_KEY;

      if (!apiKey) {
        return res
          .status(500)
          .json({
            status:
              "error",

            error:
              "GEMINI_API_KEY missing",
          });
      }

      const base =
        `http://localhost:${
          process.env.PORT ||
          5000
        }`;

      // -----------------------------------------------
      // LOAD WORLD MONITOR LIVE DATA
      // -----------------------------------------------

      const [
        macro,
        markets,
        energy,
        news,
        internet,
        conflicts,
      ] =
        await Promise.all([
          safeFetchJson(
            `${base}/api/fred/macro`
          ),

          safeFetchJson(
            `${base}/api/markets/global`
          ),

          safeFetchJson(
            `${base}/api/eia/energy`
          ),

          safeFetchJson(
            `${base}/api/news/breaking`
          ),

          safeFetchJson(
            `${base}/api/internet/outages`
          ),

          safeFetchJson(
            `${base}/api/conflicts/live`
          ),
        ]);

      // -----------------------------------------------
      // CALCULATE GLOBAL RISK
      // -----------------------------------------------

      let globalRisk =
        null;

      try {
        const riskResponse =
          await fetch(
            `${base}/api/intelligence/global-risk`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  macro:
                    macro || {},

                  markets:
                    markets || {},

                  energy:
                    energy || {},

                  news:
                    news || {},

                  internet:
                    internet || {},
                }),
            }
          );

        if (
          riskResponse.ok
        ) {
          globalRisk =
            await riskResponse.json();
        }
      } catch {
        globalRisk =
          null;
      }

      const context =
        compactContext({
          macro,
          markets,
          energy,
          news,
          internet,
          conflicts,
          globalRisk,
        });

      const prompt =
        buildPrompt(
          String(question),
          language,
          context
        );

      // -----------------------------------------------
      // GEMINI
      // -----------------------------------------------

      const geminiResponse =
        await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              "x-goog-api-key":
                apiKey,
            },

            body:
              JSON.stringify({
                contents: [
                  {
                    role:
                      "user",

                    parts: [
                      {
                        text:
                          prompt,
                      },
                    ],
                  },
                ],

                generationConfig: {
                  temperature:
                    0.2,

                  maxOutputTokens:
                    900,
                },
              }),
          }
        );

      const geminiData =
        await geminiResponse.json();

      if (
        !geminiResponse.ok
      ) {
        console.error(
          "GEMINI ERROR:",
          geminiData
        );

        return res
          .status(
            geminiResponse.status
          )
          .json({
            status:
              "error",

            error:
              "Gemini request failed",

            details:
              geminiData
                ?.error
                ?.message ||
              geminiData,
          });
      }

      const answer =
        geminiData
          ?.candidates
          ?.[0]
          ?.content
          ?.parts
          ?.map(
            (part) =>
              part?.text ||
              ""
          )
          .join("")
          .trim();

      if (!answer) {
        return res
          .status(502)
          .json({
            status:
              "error",

            error:
              "Gemini returned no answer",
          });
      }

      return res.json({
        status:
          "success",

        model:
          GEMINI_MODEL,

        language,

        question,

        answer,

        contextSummary: {
          globalRisk:
            globalRisk
              ?.globalRiskScore ??
            null,

          globalRiskLevel:
            globalRisk
              ?.globalRiskLevel ??
            null,

          conflictCount:
            conflicts
              ?.conflictCount ??
            null,

          internetRisk:
            internet
              ?.risk
              ?.score ??
            null,
        },

        dataUsed: {
          macro:
            Boolean(macro),

          markets:
            Boolean(markets),

          energy:
            Boolean(energy),

          news:
            Boolean(news),

          internet:
            Boolean(internet),

          conflicts:
            Boolean(conflicts),

          globalRisk:
            Boolean(globalRisk),
        },

        updatedAt:
          new Date()
            .toISOString(),
      });
    } catch (error) {
      console.error(
        "AI ROUTE ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          status:
            "error",

          error:
            "AI request failed",

          details:
            error.message,
        });
    }
  }
);

export default router;



