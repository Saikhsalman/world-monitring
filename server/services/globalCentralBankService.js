// =====================================================
// GLOBAL CENTRAL BANK SERVICE
// Official + Verified Central Bank Sources
// =====================================================

// =====================================================
// SOURCE URLS
// =====================================================

const BOE_URL =
  "https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp";

const BOC_URL =
  "https://www.bankofcanada.ca/valet/observations/V39079/json?recent=10";

const RBA_URL =
  "https://www.rba.gov.au/cash-rate-target-overview.html";

const BRAZIL_URL =
  "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/10?formato=json";

const KOREA_URL =
  "https://www.bok.or.kr/eng/main/main.do";

const SWISS_URL =
  "https://www.snb.ch/en";

const INDONESIA_URL =
  "https://www.bi.go.id/en/statistik/indikator/BI-Rate.aspx";

const SAUDI_URL =
  "https://sama.gov.sa/en-US/MediaCenter/News/pages/news-1124.aspx";

// =====================================================
// VERIFIED SNAPSHOTS
// =====================================================

const VERIFIED_SNAPSHOTS = {
  CHN: {
    name:
      "China 1-Year Loan Prime Rate",

    value:
      3.0,

    date:
      "2026-08-20",

    source:
      "PBOC / NIFC",

    series:
      "1Y LPR",

    note:
      "Verified snapshot",
  },

  MEX: {
    name:
      "Banco de Mexico Overnight Rate Target",

    value:
      6.50,

    date:
      "2026-09-06",

    source:
      "Banco de Mexico",

    series:
      "Overnight Rate Target",

    note:
      "Verified official snapshot from Banco de Mexico SIE",
  },

  ZAF: {
    name:
      "SARB Policy Rate",

    value:
      7.0,

    date:
      "2026-09-04",

    source:
      "South African Reserve Bank",

    series:
      "SARB Policy Rate",

    note:
      "Verified SARB snapshot",
  },

  ARE: {
    name:
      "UAE Base Rate",

    value:
      3.65,

    date:
      "2026-07-29",

    source:
      "Central Bank of UAE",

    series:
      "CBUAE Base Rate",

    note:
      "Verified official snapshot",
  },
};

// =====================================================
// COMMON FETCH
// =====================================================

async function fetchText(
  url,
  sourceName
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      15000
    );

  try {
    const response =
      await fetch(url, {
        signal:
          controller.signal,

        headers: {
          "User-Agent":
            "Mozilla/5.0 WorldMonitor/1.0",

          Accept:
            "text/html,application/xhtml+xml,application/json",
        },
      });

    if (!response.ok) {
      throw new Error(
        `${sourceName} HTTP ${response.status}`
      );
    }

    return await response.text();
  } finally {
    clearTimeout(
      timeout
    );
  }
}

// =====================================================
// CLEAN HTML
// =====================================================

function cleanHtmlText(
  html
) {
  return String(
    html || ""
  )
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<[^>]+>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&#37;/gi,
      "%"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

// =====================================================
// UNAVAILABLE RESPONSE
// =====================================================

function unavailable(
  countryCode,
  name,
  source,
  error
) {
  return {
    name,
    countryCode,

    value:
      null,

    unit:
      "%",

    date:
      null,

    status:
      "unavailable",

    source,

    error,

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// VERIFIED SNAPSHOT RESPONSE
// =====================================================

function getVerifiedSnapshot(
  countryCode
) {
  const item =
    VERIFIED_SNAPSHOTS[
      countryCode
    ];

  if (!item) {
    return null;
  }

  return {
    ...item,

    countryCode,

    unit:
      "%",

    status:
      "verified_snapshot",

    updatedAt:
      new Date().toISOString(),
  };
}

// =====================================================
// UNITED KINGDOM
// =====================================================

async function getBankOfEnglandRate() {
  try {
    const html =
      await fetchText(
        BOE_URL,
        "Bank of England"
      );

    const text =
      cleanHtmlText(
        html
      );

    const match =
      text.match(
        /Current official Bank Rate\s*([0-9]+(?:\.[0-9]+)?)\s*%/i
      );

    if (!match) {
      throw new Error(
        "Bank Rate not found"
      );
    }

    return {
      name:
        "Bank of England Bank Rate",

      countryCode:
        "GBR",

      value:
        Number(match[1]),

      unit:
        "%",

      date:
        null,

      status:
        "live",

      source:
        "Bank of England",

      series:
        "IUDBEDR",

      sourceUrl:
        BOE_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "GBR",
      "Bank of England Bank Rate",
      "Bank of England",
      error.message
    );
  }
}

// =====================================================
// CANADA
// =====================================================

async function getBankOfCanadaRate() {
  try {
    const response =
      await fetch(
        BOC_URL
      );

    if (!response.ok) {
      throw new Error(
        `Bank of Canada HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const latest =
      [...(data.observations || [])]
        .reverse()
        .find(
          (item) =>
            item?.V39079?.v !==
            undefined
        );

    if (!latest) {
      throw new Error(
        "Canada rate missing"
      );
    }

    return {
      name:
        "Bank of Canada Target Overnight Rate",

      countryCode:
        "CAN",

      value:
        Number(
          latest.V39079.v
        ),

      unit:
        "%",

      date:
        latest.d || null,

      status:
        "live",

      source:
        "Bank of Canada",

      series:
        "V39079",

      sourceUrl:
        BOC_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "CAN",
      "Bank of Canada Target Overnight Rate",
      "Bank of Canada",
      error.message
    );
  }
}

// =====================================================
// AUSTRALIA
// =====================================================

async function getAustraliaRate() {
  try {
    const html =
      await fetchText(
        RBA_URL,
        "Reserve Bank of Australia"
      );

    const text =
      cleanHtmlText(
        html
      );

    const match =
      text.match(
        /Cash rate target\s*([0-9]+(?:\.[0-9]+)?)\s*%/i
      );

    if (!match) {
      throw new Error(
        "RBA cash rate missing"
      );
    }

    return {
      name:
        "RBA Cash Rate Target",

      countryCode:
        "AUS",

      value:
        Number(match[1]),

      unit:
        "%",

      date:
        null,

      status:
        "live",

      source:
        "Reserve Bank of Australia",

      series:
        "Cash Rate Target",

      sourceUrl:
        RBA_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "AUS",
      "RBA Cash Rate Target",
      "Reserve Bank of Australia",
      error.message
    );
  }
}

// =====================================================
// BRAZIL
// =====================================================

async function getBrazilRate() {
  try {
    const response =
      await fetch(
        BRAZIL_URL
      );

    if (!response.ok) {
      throw new Error(
        `Brazil BCB HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const latest =
      [...data]
        .reverse()
        .find(
          (item) =>
            item?.valor !==
            undefined
        );

    if (!latest) {
      throw new Error(
        "Brazil Selic missing"
      );
    }

    const value =
      Number(
        String(
          latest.valor
        ).replace(",", ".")
      );

    return {
      name:
        "SELIC Target Rate",

      countryCode:
        "BRA",

      value,

      unit:
        "%",

      date:
        latest.data || null,

      status:
        "live",

      source:
        "Central Bank of Brazil",

      series:
        "BCB SGS 432",

      sourceUrl:
        BRAZIL_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "BRA",
      "SELIC Target Rate",
      "Central Bank of Brazil",
      error.message
    );
  }
}

// =====================================================
// SOUTH KOREA
// =====================================================

async function getKoreaRate() {
  try {
    const html =
      await fetchText(
        KOREA_URL,
        "Bank of Korea"
      );

    const text =
      cleanHtmlText(
        html
      );

    const match =
      text.match(
        /BOK Base Rate\s*([0-9]+(?:\.[0-9]+)?)\s*%/i
      );

    if (!match) {
      throw new Error(
        "BOK Base Rate missing"
      );
    }

    return {
      name:
        "Bank of Korea Base Rate",

      countryCode:
        "KOR",

      value:
        Number(match[1]),

      unit:
        "%",

      date:
        null,

      status:
        "live",

      source:
        "Bank of Korea",

      series:
        "BOK Base Rate",

      sourceUrl:
        KOREA_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "KOR",
      "Bank of Korea Base Rate",
      "Bank of Korea",
      error.message
    );
  }
}

// =====================================================
// SWITZERLAND
// =====================================================

async function getSwissRate() {
  try {
    const html =
      await fetchText(
        SWISS_URL,
        "Swiss National Bank"
      );

    const text =
      cleanHtmlText(
        html
      );

    const match =
      text.match(
        /SNB policy rate\s*([0-9]+(?:\.[0-9]+)?)\s*%/i
      );

    if (!match) {
      throw new Error(
        "SNB policy rate missing"
      );
    }

    return {
      name:
        "SNB Policy Rate",

      countryCode:
        "CHE",

      value:
        Number(match[1]),

      unit:
        "%",

      date:
        null,

      status:
        "live",

      source:
        "Swiss National Bank",

      series:
        "SNB Policy Rate",

      sourceUrl:
        SWISS_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "CHE",
      "SNB Policy Rate",
      "Swiss National Bank",
      error.message
    );
  }
}

// =====================================================
// INDONESIA
// =====================================================

async function getIndonesiaRate() {
  try {
    const html =
      await fetchText(
        INDONESIA_URL,
        "Bank Indonesia"
      );

    const text =
      cleanHtmlText(
        html
      );

    const match =
      text.match(
        /BI-Rate\s+Period[\s\S]*?([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})\s+([0-9]+(?:\.[0-9]+)?)\s*%/i
      );

    if (!match) {
      throw new Error(
        "BI-Rate missing"
      );
    }

    return {
      name:
        "BI-Rate",

      countryCode:
        "IDN",

      value:
        Number(match[2]),

      unit:
        "%",

      date:
        match[1],

      status:
        "live",

      source:
        "Bank Indonesia",

      series:
        "BI-Rate",

      sourceUrl:
        INDONESIA_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "IDN",
      "BI-Rate",
      "Bank Indonesia",
      error.message
    );
  }
}

// =====================================================
// CHINA
// =====================================================

async function getChinaRate() {
  return getVerifiedSnapshot(
    "CHN"
  );
}

// =====================================================
// MEXICO
// Verified official snapshot
// =====================================================

async function getMexicoRate() {
  return getVerifiedSnapshot(
    "MEX"
  );
}

// =====================================================
// SOUTH AFRICA
// =====================================================

async function getSouthAfricaRate() {
  return getVerifiedSnapshot(
    "ZAF"
  );
}

// =====================================================
// UAE
// =====================================================

async function getUaeRate() {
  return getVerifiedSnapshot(
    "ARE"
  );
}

// =====================================================
// SAUDI ARABIA
// =====================================================

async function getSaudiRate() {
  try {
    const html =
      await fetchText(
        SAUDI_URL,
        "Saudi Central Bank"
      );

    const text =
      cleanHtmlText(
        html
      );

    const patterns = [
      /Repurchase Agreement\s*\(Repo\)\s*rate[\s\S]{0,100}?to\s*([0-9]+(?:\.[0-9]+)?)\s*percent/i,

      /Repo rate[\s\S]{0,100}?to\s*([0-9]+(?:\.[0-9]+)?)\s*percent/i,

      /Repo Rate[\s:=-]*([0-9]+(?:\.[0-9]+)?)\s*%/i,
    ];

    let value =
      null;

    for (
      const pattern
      of patterns
    ) {
      const match =
        text.match(
          pattern
        );

      if (!match) {
        continue;
      }

      const parsed =
        Number(
          match[1]
        );

      if (
        Number.isFinite(parsed) &&
        parsed >= 0 &&
        parsed <= 25
      ) {
        value =
          parsed;

        break;
      }
    }

    if (
      value === null
    ) {
      throw new Error(
        "Saudi Repo Rate not found"
      );
    }

    return {
      name:
        "Saudi Central Bank Repo Rate",

      countryCode:
        "SAU",

      value,

      unit:
        "%",

      date:
        null,

      status:
        "live",

      source:
        "Saudi Central Bank",

      series:
        "Official Repo Rate",

      sourceUrl:
        SAUDI_URL,

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    return unavailable(
      "SAU",
      "Saudi Central Bank Repo Rate",
      "Saudi Central Bank",
      error.message
    );
  }
}

// =====================================================
// MAIN ENGINE
// =====================================================

export async function getOfficialCentralBankRate(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  if (code === "GBR") {
    return getBankOfEnglandRate();
  }

  if (code === "CAN") {
    return getBankOfCanadaRate();
  }

  if (code === "AUS") {
    return getAustraliaRate();
  }

  if (code === "BRA") {
    return getBrazilRate();
  }

  if (code === "KOR") {
    return getKoreaRate();
  }

  if (code === "CHE") {
    return getSwissRate();
  }

  if (code === "IDN") {
    return getIndonesiaRate();
  }

  if (code === "CHN") {
    return getChinaRate();
  }

  if (code === "MEX") {
    return getMexicoRate();
  }

  if (code === "ZAF") {
    return getSouthAfricaRate();
  }

  if (code === "ARE") {
    return getUaeRate();
  }

  if (code === "SAU") {
    return getSaudiRate();
  }

  return unavailable(
    code,
    "Policy Rate",
    "Central Bank",
    `Official central-bank source not configured for ${code}`
  );
}

// =====================================================
// SUPPORT
// =====================================================

export function hasOfficialCentralBankSupport(
  countryCode
) {
  const code =
    String(
      countryCode || ""
    )
      .toUpperCase()
      .trim();

  return [
    "GBR",
    "CAN",
    "AUS",
    "BRA",
    "KOR",
    "CHE",
    "IDN",
    "CHN",
    "MEX",
    "ZAF",
    "ARE",
    "SAU",
  ].includes(code);
}

// =====================================================
// SUPPORTED COUNTRIES
// =====================================================

export function getOfficialCentralBankCountries() {
  return [
    "GBR",
    "CAN",
    "AUS",
    "BRA",
    "KOR",
    "CHE",
    "IDN",
    "CHN",
    "MEX",
    "ZAF",
    "ARE",
    "SAU",
  ];
}