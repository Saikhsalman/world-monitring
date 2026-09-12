// =====================================================
// RBI SERVICE
// Policy Rates + Market Snapshot + FX Rates
// =====================================================

const RBI_URL =
  "https://m.rbi.org.in/Scripts/NotificationUser.aspx?Id=10001&Mode=0";

// =====================================================
// FETCH RBI PAGE
// =====================================================

async function fetchRbiPage() {
  const response = await fetch(RBI_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 WorldMonitor/1.0",
      Accept:
        "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(
      `RBI HTTP ${response.status}`
    );
  }

  return response.text();
}

// =====================================================
// HTML TO PLAIN TEXT
// =====================================================

function htmlToText(html) {
  return html
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// =====================================================
// EXTRACT RATE
// =====================================================

function extractRate(text, label) {
  const escapedLabel =
    label.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const pattern = new RegExp(
    `${escapedLabel}\\s*:?\\s*([0-9]+(?:\\.[0-9]+)?)\\s*%`,
    "i"
  );

  const match =
    text.match(pattern);

  return match
    ? Number(match[1])
    : null;
}

// =====================================================
// GET POLICY RATES
// =====================================================

export async function getRbiPolicyRates() {
  try {
    const html =
      await fetchRbiPage();

    const text =
      htmlToText(html);

    const repoRate =
      extractRate(
        text,
        "Policy Repo Rate"
      );

    const sdfRate =
      extractRate(
        text,
        "Standing Deposit Facility Rate"
      );

    const msfRate =
      extractRate(
        text,
        "Marginal Standing Facility Rate"
      );

    const bankRate =
      extractRate(
        text,
        "Bank Rate"
      );

    const reverseRepoRate =
      extractRate(
        text,
        "Fixed Reverse Repo Rate"
      );

    const ratesFound = [
      repoRate,
      sdfRate,
      msfRate,
      bankRate,
      reverseRepoRate,
    ].filter(
      (value) => value !== null
    ).length;

    return {
      source:
        "Reserve Bank of India",

      sourceUrl:
        RBI_URL,

      status:
        ratesFound > 0
          ? "live"
          : "unavailable",

      foundCount:
        ratesFound,

      totalCount: 5,

      updatedAt:
        new Date().toISOString(),

      rates: {
        repoRate: {
          name:
            "Policy Repo Rate",
          value: repoRate,
          unit: "%",
        },

        standingDepositFacility: {
          name:
            "Standing Deposit Facility Rate",
          value: sdfRate,
          unit: "%",
        },

        marginalStandingFacility: {
          name:
            "Marginal Standing Facility Rate",
          value: msfRate,
          unit: "%",
        },

        bankRate: {
          name:
            "Bank Rate",
          value: bankRate,
          unit: "%",
        },

        fixedReverseRepoRate: {
          name:
            "Fixed Reverse Repo Rate",
          value:
            reverseRepoRate,
          unit: "%",
        },
      },
    };
  } catch (error) {
    console.error(
      "RBI SERVICE ERROR:",
      error.message
    );

    return {
      source:
        "Reserve Bank of India",

      status:
        "unavailable",

      updatedAt:
        new Date().toISOString(),

      error:
        error.message,

      rates: {},
    };
  }
}

// =====================================================
// RBI MARKET SNAPSHOT
// G-Sec + NIFTY + Sensex + FX Rates
// =====================================================

export async function getRbiMarketSnapshot() {
  try {
    const html =
      await fetchRbiPage();

    const text =
      htmlToText(html);

    // =================================================
    // GOVERNMENT SECURITIES
    // =================================================

    const tenYearMatch =
      text.match(
        /6\.94%\s*GS\s*2036\s*:\s*([0-9]+(?:\.[0-9]+)?)%/i
      );

    // =================================================
    // STOCK MARKETS
    // =================================================

    const niftyMatch =
      text.match(
        /Nifty\s*50\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
      );

    const sensexMatch =
      text.match(
        /S&P\s*BSE\s*Sensex\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
      );

    // =================================================
    // FX RATES
    // =================================================

    const usdInrMatch =
      text.match(
        /INR\s*\/\s*1\s*USD\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
      );

    const gbpInrMatch =
      text.match(
        /INR\s*\/\s*1\s*GBP\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
      );

    const eurInrMatch =
      text.match(
        /INR\s*\/\s*1\s*EUR\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
      );

    const jpyInrMatch =
      text.match(
        /INR\s*\/\s*100\s*JPY\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
      );

    const aedInrMatch =
      text.match(
        /INR\s*\/\s*1\s*AED\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
      );

    // =================================================
    // FX DATE / SOURCE
    // =================================================

    const fxDateMatch =
      text.match(
        /As\s+at\s+1\.00pm\s+of\s+([A-Za-z]+\s+\d{1,2},\s+20\d{2})/i
      );

    const fxSourceMatch =
      text.match(
        /\(Source\s*:\s*([^)]+)\)/i
      );

    // =================================================
    // MARKET DATE
    // =================================================

    const marketDateMatch =
      text.match(
        /as on\s+([A-Za-z]+\s+\d{1,2},\s+20\d{2})/i
      );

    // =================================================
    // STATUS
    // =================================================

    const hasData =
      tenYearMatch ||
      niftyMatch ||
      sensexMatch ||
      usdInrMatch ||
      gbpInrMatch ||
      eurInrMatch ||
      jpyInrMatch ||
      aedInrMatch;

    return {
      source:
        "Reserve Bank of India",

      status:
        hasData
          ? "live"
          : "unavailable",

      // ===============================================
      // GOVERNMENT SECURITIES
      // ===============================================

      governmentSecurities: {
        tenYearProxy: {
          name:
            "India 10Y G-Sec Proxy",

          security:
            "6.94% GS 2036",

          value:
            tenYearMatch
              ? Number(
                  tenYearMatch[1]
                )
              : null,

          unit: "%",
        },
      },

      // ===============================================
      // MARKETS
      // ===============================================

      markets: {
        nifty50: {
          name:
            "NIFTY 50",

          value:
            niftyMatch
              ? Number(
                  niftyMatch[1]
                )
              : null,
        },

        sensex: {
          name:
            "S&P BSE Sensex",

          value:
            sensexMatch
              ? Number(
                  sensexMatch[1]
                )
              : null,
        },
      },

      // ===============================================
      // EXCHANGE RATES
      // ===============================================

      exchangeRates: {
        usdInr: {
          name:
            "USD/INR",

          value:
            usdInrMatch
              ? Number(
                  usdInrMatch[1]
                )
              : null,

          unit:
            "INR per USD",
        },

        gbpInr: {
          name:
            "GBP/INR",

          value:
            gbpInrMatch
              ? Number(
                  gbpInrMatch[1]
                )
              : null,

          unit:
            "INR per GBP",
        },

        eurInr: {
          name:
            "EUR/INR",

          value:
            eurInrMatch
              ? Number(
                  eurInrMatch[1]
                )
              : null,

          unit:
            "INR per EUR",
        },

        jpyInr: {
          name:
            "JPY/INR",

          value:
            jpyInrMatch
              ? Number(
                  jpyInrMatch[1]
                )
              : null,

          unit:
            "INR per 100 JPY",
        },

        aedInr: {
          name:
            "AED/INR",

          value:
            aedInrMatch
              ? Number(
                  aedInrMatch[1]
                )
              : null,

          unit:
            "INR per AED",
        },
      },

      // ===============================================
      // DATES / SOURCES
      // ===============================================

      marketDate:
        marketDateMatch
          ? marketDateMatch[1]
          : null,

      exchangeRateDate:
        fxDateMatch
          ? fxDateMatch[1]
          : null,

      exchangeRateSource:
        fxSourceMatch
          ? fxSourceMatch[1].trim()
          : "FBIL",

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "RBI MARKET SNAPSHOT ERROR:",
      error.message
    );

    return {
      source:
        "Reserve Bank of India",

      status:
        "unavailable",

      error:
        error.message,

      updatedAt:
        new Date().toISOString(),
    };
  }
}