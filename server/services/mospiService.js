import {
  PDFParse,
} from "pdf-parse";

const MOSPI_ANNOUNCEMENTS =
  "https://www.mospi.gov.in/announcements";

// =====================================================
// FETCH HTML
// =====================================================

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 WorldMonitor/1.0",
      Accept:
        "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(
      `MoSPI HTTP ${response.status}`
    );
  }

  return response.text();
}

// =====================================================
// NORMALIZE URL
// =====================================================

function normalizeUrl(link) {
  if (!link) {
    return null;
  }

  if (
    link.startsWith("http://") ||
    link.startsWith("https://")
  ) {
    return link;
  }

  if (link.startsWith("//")) {
    return `https:${link}`;
  }

  if (link.startsWith("/")) {
    return `https://www.mospi.gov.in${link}`;
  }

  return `https://www.mospi.gov.in/${link}`;
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
// FIND CPI-RELATED LINKS
// =====================================================

function findCpiLinks(html) {
  const links = [];

  const anchorRegex =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while (
    (match = anchorRegex.exec(html)) !==
    null
  ) {
    const rawUrl =
      match[1];

    const anchorText =
      htmlToText(
        match[2]
      ).toLowerCase();

    const fullUrl =
      normalizeUrl(rawUrl);

    if (!fullUrl) {
      continue;
    }

    const combined =
      `${anchorText} ${fullUrl.toLowerCase()}`;

    if (
      combined.includes("cpi") ||
      combined.includes(
        "consumer price"
      ) ||
      combined.includes(
        "inflation"
      )
    ) {
      links.push({
        url: fullUrl,
        text: anchorText,
      });
    }
  }

  return links;
}

// =====================================================
// FIND PDF FROM RELEASE PAGE
// =====================================================

function findPdfInPage(html) {
  const regex =
    /href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi;

  const links = [];

  let match;

  while (
    (match = regex.exec(html)) !==
    null
  ) {
    const url =
      normalizeUrl(match[1]);

    if (url) {
      links.push(url);
    }
  }

  return [...new Set(links)];
}

// =====================================================
// PDF TO TEXT
// =====================================================

async function extractPdfText(
  pdfUrl
) {
  const parser =
    new PDFParse({
      url: pdfUrl,
    });

  try {
    const result =
      await parser.getText();

    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

// =====================================================
// EXTRACT CPI INFLATION
// =====================================================

function extractInflation(text) {
  const clean =
    String(text || "")
      .replace(/\s+/g, " ")
      .trim();

  const patterns = [
    /headline\s+inflation[^0-9]{0,150}([0-9]+(?:\.[0-9]+)?)\s*(?:%|percent)/i,

    /year[- ]on[- ]year[^0-9]{0,150}([0-9]+(?:\.[0-9]+)?)\s*(?:%|percent)/i,

    /combined[^0-9]{0,150}inflation[^0-9]{0,100}([0-9]+(?:\.[0-9]+)?)\s*(?:%|percent)/i,

    /inflation\s+rate[^0-9]{0,150}([0-9]+(?:\.[0-9]+)?)\s*(?:%|percent)/i,
  ];

  for (
    const pattern of patterns
  ) {
    const match =
      clean.match(pattern);

    if (!match) {
      continue;
    }

    const value =
      Number(match[1]);

    if (
      Number.isFinite(value) &&
      value >= -5 &&
      value <= 30
    ) {
      return value;
    }
  }

  return null;
}

// =====================================================
// EXTRACT RELEASE DATE
// =====================================================

function extractReleaseDate(text) {
  const patterns = [
    /\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2})\b/i,

    /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2})\b/i,
  ];

  for (
    const pattern of patterns
  ) {
    const match =
      text.match(pattern);

    if (match) {
      return match[1];
    }
  }

  return null;
}

// =====================================================
// GET INDIA CPI INFLATION
// =====================================================

export async function getIndiaInflation() {
  try {
    const announcementsHtml =
      await fetchHtml(
        MOSPI_ANNOUNCEMENTS
      );

    const cpiLinks =
      findCpiLinks(
        announcementsHtml
      );

    if (
      cpiLinks.length === 0
    ) {
      return {
        source:
          "MoSPI / NSO",

        status:
          "unavailable",

        indicator:
          "CPI Inflation YoY",

        value: null,

        unit: "%",

        sourceUrl:
          MOSPI_ANNOUNCEMENTS,

        reason:
          "No CPI-related announcement link found",

        updatedAt:
          new Date().toISOString(),
      };
    }

    for (
      const item of cpiLinks
    ) {
      try {
        const releaseHtml =
          await fetchHtml(
            item.url
          );

        const releaseText =
          htmlToText(
            releaseHtml
          );

        // Try direct HTML first
        const directInflation =
          extractInflation(
            releaseText
          );

        if (
          directInflation !== null
        ) {
          return {
            source:
              "MoSPI / NSO",

            status:
              "live",

            indicator:
              "CPI Inflation YoY",

            value:
              directInflation,

            unit: "%",

            releaseDate:
              extractReleaseDate(
                releaseText
              ),

            sourceUrl:
              item.url,

            updatedAt:
              new Date().toISOString(),
          };
        }

        // If not found in HTML, look for PDF
        const pdfLinks =
          findPdfInPage(
            releaseHtml
          );

        for (
          const pdfUrl of pdfLinks
        ) {
          try {
            const pdfText =
              await extractPdfText(
                pdfUrl
              );

            const inflation =
              extractInflation(
                pdfText
              );

            if (
              inflation !== null
            ) {
              return {
                source:
                  "MoSPI / NSO",

                status:
                  "live",

                indicator:
                  "CPI Inflation YoY",

                value:
                  inflation,

                unit: "%",

                releaseDate:
                  extractReleaseDate(
                    pdfText
                  ),

                sourceUrl:
                  pdfUrl,

                updatedAt:
                  new Date().toISOString(),
              };
            }
          } catch (error) {
            console.error(
              "MOSPI PDF ERROR:",
              pdfUrl,
              error.message
            );
          }
        }
      } catch (error) {
        console.error(
          "MOSPI RELEASE ERROR:",
          item.url,
          error.message
        );
      }
    }

    return {
      source:
        "MoSPI / NSO",

      status:
        "unavailable",

      indicator:
        "CPI Inflation YoY",

      value: null,

      unit: "%",

      sourceUrl:
        MOSPI_ANNOUNCEMENTS,

      reason:
        "CPI value not found in CPI announcement pages",

      updatedAt:
        new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "MOSPI CPI ERROR:",
      error.message
    );

    return {
      source:
        "MoSPI / NSO",

      status:
        "unavailable",

      indicator:
        "CPI Inflation YoY",

      value: null,

      unit: "%",

      updatedAt:
        new Date().toISOString(),

      error:
        error.message,
    };
  }
}