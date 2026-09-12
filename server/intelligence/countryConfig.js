const COUNTRY_CONFIG = {
  IND: {
    code: "IND",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    centralBank: "Reserve Bank of India",
    marketIndex: "NIFTY 50",
  },

  USA: {
    code: "USA",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    centralBank: "Federal Reserve",
    marketIndex: "S&P 500",
  },
};

export function getCountryConfig(
  countryCode
) {
  const code =
    String(countryCode || "")
      .toUpperCase()
      .trim();

  return (
    COUNTRY_CONFIG[code] || {
      code,
      name: code,
      flag: "🌍",
      currency: null,
      centralBank: null,
      marketIndex: null,
    }
  );
}

export default COUNTRY_CONFIG;
