// =====================================================
// ECB SERVICE
// Official Euro Area Policy Rates
// =====================================================

const ECB_API =
  "https://data-api.ecb.europa.eu/service/data";

// =====================================================
// FETCH ECB SERIES
// =====================================================

async function getEcbSeries(seriesKey) {
  const url =
    `${ECB_API}/FM/${seriesKey}` +
    `?format=csvdata` +
    `&lastNObservations=5`;

  const response =
    await fetch(url, {
      headers: {
        Accept: "text/csv",
        "User-Agent":
          "WorldMonitor/1.0",
      },
    });

  if (!response.ok) {
    throw new Error(
      `ECB HTTP ${response.status}`
    );
  }

  return response.text();
}

// =====================================================
// PARSE LAST CSV VALUE
// =====================================================

function parseLastValue(csv) {
  const lines =
    String(csv || "")
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

  if (lines.length < 2) {
    return null;
  }

  const headers =
    lines[0].split(",");

  const timeIndex =
    headers.indexOf(
      "TIME_PERIOD"
    );

  const valueIndex =
    headers.indexOf(
      "OBS_VALUE"
    );

  if (
    timeIndex === -1 ||
    valueIndex === -1
  ) {
    return null;
  }

  for (
    let i =
      lines.length - 1;
    i >= 1;
    i--
  ) {
    const columns =
      lines[i].split(",");

    const value =
      Number(
        columns[valueIndex]
      );

    if (
      Number.isFinite(value)
    ) {
      return {
        value,

        date:
          columns[
            timeIndex
          ],
      };
    }
  }

  return null;
}

// =====================================================
// ECB POLICY RATES
// =====================================================

export async function getEcbPolicyRates() {
  try {
    const [
      depositCsv,
      mroCsv,
      marginalCsv,
    ] =
      await Promise.all([
        getEcbSeries(
          "B.U2.EUR.4F.KR.DFR.LEV"
        ),

        getEcbSeries(
          "D.U2.EUR.4F.KR.MRR_RT.LEV"
        ),

        getEcbSeries(
          "B.U2.EUR.4F.KR.MLFR.LEV"
        ),
      ]);

    const deposit =
      parseLastValue(
        depositCsv
      );

    const mro =
      parseLastValue(
        mroCsv
      );

    const marginal =
      parseLastValue(
        marginalCsv
      );

    return {
      source:
        "European Central Bank",

      status:
        deposit ||
        mro ||
        marginal
          ? "live"
          : "unavailable",

      rates: {
        depositFacility: {
          name:
            "ECB Deposit Facility Rate",

          value:
            deposit?.value ??
            null,

          date:
            deposit?.date ??
            null,

          unit:
            "%",
        },

        mainRefinancingOperations: {
          name:
            "ECB Main Refinancing Rate",

          value:
            mro?.value ??
            null,

          date:
            mro?.date ??
            null,

          unit:
            "%",
        },

        marginalLendingFacility: {
          name:
            "ECB Marginal Lending Facility",

          value:
            marginal?.value ??
            null,

          date:
            marginal?.date ??
            null,

          unit:
            "%",
        },
      },

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "ECB SERVICE ERROR:",
      error.message
    );

    return {
      source:
        "European Central Bank",

      status:
        "unavailable",

      error:
        error.message,

      updatedAt:
        new Date().toISOString(),

      rates: {},
    };
  }
}