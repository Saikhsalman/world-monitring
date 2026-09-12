// =====================================================
// INDICATOR EXPLANATIONS
// Reusable definitions for Country Intelligence
// =====================================================

export type IndicatorExplanation = {
  title: string;
  shortDescription: string;
  whyItMatters: string;
  highImpact?: string;
  lowImpact?: string;
};

// =====================================================
// INDICATOR DATABASE
// =====================================================

export const indicatorExplanations: Record<
  string,
  IndicatorExplanation
> = {
  inflation: {
    title: "Inflation",

    shortDescription:
      "Inflation batata hai ki goods aur services ki overall prices time ke saath kitni tezi se badh rahi hain.",

    whyItMatters:
      "Inflation central bank policy, interest rates, consumer spending, bonds, currency aur stock market ko affect kar sakta hai.",

    highImpact:
      "High inflation se central bank rates high rakh sakta hai ya rate hike kar sakta hai.",

    lowImpact:
      "Controlled inflation rate cuts aur economic growth ke liye supportive ho sakti hai.",
  },

  policyRate: {
    title: "Policy Rate",

    shortDescription:
      "Policy Rate central bank ka key interest rate hota hai, jiske through borrowing cost aur liquidity ko influence kiya jata hai.",

    whyItMatters:
      "Policy rate loans, deposits, bond yields, currency aur stock-market valuations ko affect kar sakta hai.",

    highImpact:
      "Higher rates borrowing ko expensive bana sakte hain aur inflation control karne me help karte hain.",

    lowImpact:
      "Lower rates borrowing ko cheaper bana sakte hain aur economic activity ko support karte hain.",
  },

  gdpGrowth: {
    title: "GDP Growth",

    shortDescription:
      "GDP Growth batata hai ki country ki economy ek period ke comparison me kitni tezi se expand ya contract ho rahi hai.",

    whyItMatters:
      "Strong GDP growth business activity, employment, corporate earnings aur government revenue ke liye supportive ho sakti hai.",

    highImpact:
      "Strong growth generally healthy economic activity indicate karti hai, lekin bahut fast growth inflation pressure bhi create kar sakti hai.",

    lowImpact:
      "Weak ya negative growth economic slowdown ya recession risk ka signal ho sakti hai.",
  },

  unemployment: {
    title: "Unemployment",

    shortDescription:
      "Unemployment rate labour force ka woh percentage batata hai jo job dhundh raha hai lekin employed nahi hai.",

    whyItMatters:
      "Employment consumer spending, economic growth aur central-bank decisions ke liye important indicator hai.",

    highImpact:
      "High unemployment weak labour market aur slower economic activity indicate kar sakta hai.",

    lowImpact:
      "Low unemployment generally strong labour demand indicate karta hai, although extremely tight labour markets wage inflation badha sakte hain.",
  },

  currency: {
    title: "Currency",

    shortDescription:
      "Currency country ki official money unit hoti hai. India ki currency Indian Rupee (INR) hai.",

    whyItMatters:
      "Currency movement imports, exports, inflation, foreign investment aur companies ke earnings ko affect kar sakta hai.",

    highImpact:
      "Weak currency imports ko expensive bana sakti hai, especially crude oil jaise imported commodities.",

    lowImpact:
      "Strong currency imports ko cheaper bana sakti hai, lekin exporters ki competitiveness par effect pad sakta hai.",
  },

  stockMarket: {
    title: "Stock Market",

    shortDescription:
      "Stock-market index selected companies ke share-price performance ko track karta hai. India me NIFTY 50 ek major benchmark index hai.",

    whyItMatters:
      "Market index investor sentiment, corporate expectations aur broader financial conditions ka useful signal ho sakta hai.",

    highImpact:
      "Strong rally improving sentiment ya earnings expectations indicate kar sakti hai.",

    lowImpact:
      "Sharp decline risk aversion, economic concerns ya company earnings pressure indicate kar sakta hai.",
  },

  bondYield: {
    title: "Bond Yield",

    shortDescription:
      "Bond Yield government ya corporate bond se milne wale market-based return ko represent karta hai.",

    whyItMatters:
      "Government bond yields borrowing costs, bank rates, equity valuations aur foreign capital flows ko influence kar sakte hain.",

    highImpact:
      "Rising yields tighter financial conditions aur higher borrowing costs create kar sakte hain.",

    lowImpact:
      "Falling yields borrowing conditions ko easier bana sakte hain, although kabhi-kabhi weak growth expectations bhi reason hoti hain.",
  },

  energyRisk: {
    title: "Energy Risk",

    shortDescription:
      "Energy Risk batata hai ki oil, gas aur dusre energy sources ke price ya supply changes se country kitni vulnerable ho sakti hai.",

    whyItMatters:
      "Energy prices inflation, trade balance, currency, transport costs aur corporate margins ko directly affect kar sakte hain.",

    highImpact:
      "Import-dependent countries ke liye high crude prices inflation aur trade deficit pressure badha sakte hain.",

    lowImpact:
      "Stable ya lower energy prices import costs aur inflation pressure ko reduce kar sakte hain.",
  },
};
