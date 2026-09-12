import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Paper,
  Progress,
  RingProgress,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import { LineChart } from "@mantine/charts";

import type {
  CountryIntelligence,
} from "../data/countryIntelligence";

type Metric = {
  name?: string;
  value?: number | null;
  unit?: string;
  source?: string;
  date?: string | null;
  note?: string | null;
  security?: string | null;
  percentChange?: number | null;
};

type NewsArticle = {
  title: string;
  source?: string;
  freshness?: string;
  impact?: string;
  ageHours?: number | null;
};

type CountryApiData = {
  status: string;
  liveCount?: number;
  totalCount?: number;
  updatedAt?: string;
  country?: {
    code?: string;
    name?: string;
    flag?: string;
    currency?: string;
    market?: string;
    centralBank?: string;
    region?: string | null;
    capital?: string | null;
  };
  macro?: {
    inflation?: Metric;
    policyRate?: Metric;
    gdpGrowth?: Metric;
    unemployment?: Metric;
    bondYield?: Metric;
    dollarStrength?: Metric;
  };
  markets?: {
    nifty50?: Metric;
    sp500Proxy?: Metric;
    dax?: Metric;
    nikkei225?: Metric;
    primary?: Metric;
  };
  currencyMarket?: {
    usdInr?: Metric;
    usdJpy?: Metric;
    primary?: Metric;
  };
  riskIntelligence?: {
    riskScore: number;
    riskLevel: string;
    marketBias: string;
    confidence: string;
    coveragePercent: number;
    reasons: string[];
    updatedAt?: string;
  };
  overallRisk?: {
    overallRiskScore: number;
    overallRiskLevel: string;
    confidence: string;
    calculationMethod: string;
    scores: {
      macro: number | null;
      news: number | null;
    };
    drivers: string[];
  };
  countryNews?: {
    fetchedCount: number;
    articles: NewsArticle[];
    updatedAt?: string;
  };
  currentIssues?: string[];
  newsRisk?: {
    score: number;
    level: string;
    highImpactCount: number;
    negativeCount: number;
  };
};

type HistoryPoint = {
  year: string;
  value: number;
};

type CountryHistoryData = {
  status: string;
  countryCode: string;
  years: number;
  series: {
    gdpGrowth: {
      name: string;
      unit: string;
      source: string;
      data: HistoryPoint[];
    };
    inflation: {
      name: string;
      unit: string;
      source: string;
      data: HistoryPoint[];
    };
    unemployment: {
      name: string;
      unit: string;
      source: string;
      data: HistoryPoint[];
    };
  };
  updatedAt?: string;
};

type MacroChartRow = {
  year: string;
  gdpGrowth: number | null;
  inflation: number | null;
  unemployment: number | null;
};

type Props = {
  country:
    | CountryIntelligence
    | null;
  onClose: () => void;
};

function riskColor(
  level?: string
) {
  if (
    level === "HIGH" ||
    level === "CRITICAL"
  ) {
    return "red";
  }

  if (level === "MEDIUM") {
    return "yellow";
  }

  return "green";
}

function biasColor(
  bias?: string
) {
  if (
    String(bias || "")
      .includes("NEGATIVE")
  ) {
    return "red";
  }

  if (
    String(bias || "")
      .includes("POSITIVE")
  ) {
    return "green";
  }

  return "yellow";
}

function formatMetric(
  metric?: Metric,
  decimals = 2
) {
  if (
    metric?.value === null ||
    metric?.value === undefined
  ) {
    return "Unavailable";
  }

  return `${metric.value.toFixed(
    decimals
  )}${metric.unit || ""}`;
}

function metricSource(
  metric?: Metric
) {
  return [
    metric?.source,
    metric?.date,
  ]
    .filter(Boolean)
    .join(" • ");
}

function KpiCard({
  label,
  value,
  source,
}: {
  label: string;
  value: string;
  source?: string;
}) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      style={{
        background:
          "linear-gradient(180deg,rgba(15,23,42,.92),rgba(2,6,23,.92))",
        borderColor:
          "rgba(148,163,184,.16)",
      }}
    >
      <Text
        size="xs"
        c="dimmed"
        fw={700}
        tt="uppercase"
      >
        {label}
      </Text>

      <Text
        fw={900}
        size="xl"
        mt={5}
      >
        {value}
      </Text>

      {source && (
        <Text
          size="xs"
          c="dimmed"
          mt={4}
          lineClamp={1}
        >
          {source}
        </Text>
      )}
    </Paper>
  );
}

function CountryIntelligencePanel({
  country,
  onClose,
}: Props) {
  const [
    data,
    setData,
  ] =
    useState<CountryApiData | null>(
      null
    );

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
    history,
    setHistory,
  ] =
    useState<CountryHistoryData | null>(
      null
    );

  const [
    historyLoading,
    setHistoryLoading,
  ] =
    useState(false);

  const [
    historyError,
    setHistoryError,
  ] =
    useState("");

  useEffect(() => {
    if (!country) {
      setData(null);
      setError("");
      return;
    }

    let cancelled =
      false;

    const load =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `/api/country/${country.code}`
            );

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            );
          }

          const result =
            await response.json();

          if (!cancelled) {
            setData(result);
          }
        } catch (err) {
          console.error(
            "COUNTRY UI ERROR:",
            err
          );

          if (!cancelled) {
            setError(
              "Country intelligence unavailable"
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    load();

    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    if (!country) {
      setHistory(null);
      setHistoryError("");
      return;
    }

    let cancelled =
      false;

    const loadHistory =
      async () => {
        try {
          setHistoryLoading(
            true
          );

          setHistoryError("");

          const response =
            await fetch(
              `/api/country/${country.code}/history?years=10`
            );

          if (!response.ok) {
            throw new Error(
              `History HTTP ${response.status}`
            );
          }

          const result:
            CountryHistoryData =
            await response.json();

          if (!cancelled) {
            setHistory(
              result
            );
          }
        } catch (err) {
          console.error(
            "COUNTRY HISTORY UI ERROR:",
            err
          );

          if (!cancelled) {
            setHistoryError(
              "Historical macro data unavailable"
            );

            setHistory(
              null
            );
          }
        } finally {
          if (!cancelled) {
            setHistoryLoading(
              false
            );
          }
        }
      };

    loadHistory();

    return () => {
      cancelled =
        true;
    };
  }, [country]);

  const resolvedMarket =
    country?.code === "IND"
      ? data?.markets?.nifty50
      : country?.code === "USA"
        ? data?.markets?.sp500Proxy
        : country?.code === "DEU"
          ? data?.markets?.dax
          : country?.code === "JPN"
            ? data?.markets?.nikkei225
            : data?.markets?.primary;

  const resolvedCurrency =
    country?.code === "IND"
      ? data?.currencyMarket?.usdInr
      : country?.code === "JPN"
        ? data?.currencyMarket?.usdJpy
        : data?.currencyMarket?.primary;

  const risk =
    data?.overallRisk;

  const macroRisk =
    data?.riskIntelligence;

  const newsRisk =
    data?.newsRisk;

  const issues =
    data?.currentIssues ||
    country?.currentIssues ||
    [];

  const articles =
    useMemo(
      () =>
        (
          data
            ?.countryNews
            ?.articles ||
          []
        ).slice(
          0,
          8
        ),
      [data]
    );

  const macroChartData =
    useMemo<
      MacroChartRow[]
    >(
      () => {
        if (!history) {
          return [];
        }

        const years =
          new Set<string>();

        history.series.gdpGrowth.data.forEach(
          (item) =>
            years.add(
              item.year
            )
        );

        history.series.inflation.data.forEach(
          (item) =>
            years.add(
              item.year
            )
        );

        history.series.unemployment.data.forEach(
          (item) =>
            years.add(
              item.year
            )
        );

        const findValue = (
          items:
            HistoryPoint[],
          year:
            string
        ) =>
          items.find(
            (item) =>
              item.year ===
              year
          )?.value ??
          null;

        return Array.from(
          years
        )
          .sort(
            (
              a,
              b
            ) =>
              Number(a) -
              Number(b)
          )
          .map(
            (year) => ({
              year,

              gdpGrowth:
                findValue(
                  history.series
                    .gdpGrowth
                    .data,
                  year
                ),

              inflation:
                findValue(
                  history.series
                    .inflation
                    .data,
                  year
                ),

              unemployment:
                findValue(
                  history.series
                    .unemployment
                    .data,
                  year
                ),
            })
          );
      },
      [history]
    );

  if (!country) {
    return (
      <Card
        withBorder
        radius="xl"
        p="lg"
      >
        <Title order={3}>
          🌍 Country Intelligence
        </Title>

        <Text
          c="dimmed"
          mt="xs"
        >
          Map par country select karo.
        </Text>
      </Card>
    );
  }

  const name =
    data?.country?.name ||
    country.name;

  const flag =
    data?.country?.flag ||
    country.flag;

  const riskLevel =
    risk?.overallRiskLevel ||
    macroRisk?.riskLevel ||
    country.risk;

  const score =
    risk?.overallRiskScore ??
    macroRisk?.riskScore ??
    0;

  const marketBias =
    macroRisk?.marketBias ||
    country.marketBias;

  const coverage =
    macroRisk
      ?.coveragePercent ??
    (
      data?.liveCount !==
        undefined &&
      data?.totalCount
        ? (
            data.liveCount /
            data.totalCount
          ) *
          100
        : 0
    );

  return (
    <Card
      withBorder
      radius="xl"
      p={0}
      style={{
        overflow:
          "hidden",
        background:
          "linear-gradient(180deg,rgba(15,23,42,.98),rgba(2,6,23,.98))",
        borderColor:
          "rgba(148,163,184,.16)",
        boxShadow:
          "0 24px 70px rgba(0,0,0,.35)",
      }}
    >
      <Box
        p="lg"
        style={{
          background:
            "radial-gradient(circle at 0% 0%,rgba(34,211,238,.12),transparent 45%)",
          borderBottom:
            "1px solid rgba(148,163,184,.12)",
        }}
      >
        <Group
          justify="space-between"
          align="flex-start"
        >
          <Group
            gap="md"
            align="flex-start"
          >
            <ThemeIcon
              size={54}
              radius="lg"
              variant="light"
              color="cyan"
            >
              <Text size="xl">
                {flag}
              </Text>
            </ThemeIcon>

            <Stack gap={3}>
              <Group gap="xs">
                <Title order={2}>
                  {name}
                </Title>

                <Badge
                  color={
                    data?.status ===
                    "live"
                      ? "green"
                      : loading
                        ? "yellow"
                        : "gray"
                  }
                  variant="light"
                >
                  {loading
                    ? "LOADING"
                    : data?.status
                      ?.toUpperCase() ||
                      "OFFLINE"}
                </Badge>
              </Group>

              <Text
                size="sm"
                c="dimmed"
              >
                {data?.country
                  ?.currency ||
                  country.currency ||
                  "—"}
                {" • "}
                {data?.country
                  ?.centralBank ||
                  "—"}
                {" • "}
                {data?.country
                  ?.market ||
                  country.market ||
                  "—"}
              </Text>

              {error && (
                <Text
                  size="xs"
                  c="red"
                >
                  {error}
                </Text>
              )}
            </Stack>
          </Group>

          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
          >
            ✕
          </Button>
        </Group>
      </Box>

      <Tabs
        defaultValue="overview"
        color="cyan"
        variant="outline"
      >
        <ScrollArea
          type="never"
          scrollbarSize={0}
        >
          <Tabs.List
            px="lg"
            pt="md"
            style={{
              flexWrap:
                "nowrap",
            }}
          >
            <Tabs.Tab value="overview">
              Overview
            </Tabs.Tab>

            <Tabs.Tab value="economy">
              Economy
            </Tabs.Tab>

            <Tabs.Tab value="markets">
              Markets
            </Tabs.Tab>

            <Tabs.Tab value="risk">
              Intelligence
            </Tabs.Tab>

            <Tabs.Tab value="news">
              News
            </Tabs.Tab>
          </Tabs.List>
        </ScrollArea>

        <Tabs.Panel
          value="overview"
          p="lg"
        >
          {loading ? (
            <SimpleGrid
              cols={{
                base: 1,
                sm: 2,
                md: 3,
              }}
            >
              {Array.from({
                length: 6,
              }).map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    height={110}
                    radius="lg"
                  />
                )
              )}
            </SimpleGrid>
          ) : (
            <Stack gap="lg">
              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                  md: 3,
                }}
              >
                <KpiCard
                  label="GDP Growth"
                  value={formatMetric(
                    data?.macro
                      ?.gdpGrowth
                  )}
                  source={metricSource(
                    data?.macro
                      ?.gdpGrowth
                  )}
                />

                <KpiCard
                  label="Inflation"
                  value={formatMetric(
                    data?.macro
                      ?.inflation
                  )}
                  source={metricSource(
                    data?.macro
                      ?.inflation
                  )}
                />

                <KpiCard
                  label="Policy Rate"
                  value={formatMetric(
                    data?.macro
                      ?.policyRate,
                    3
                  )}
                  source={metricSource(
                    data?.macro
                      ?.policyRate
                  )}
                />

                <KpiCard
                  label="Unemployment"
                  value={formatMetric(
                    data?.macro
                      ?.unemployment
                  )}
                  source={metricSource(
                    data?.macro
                      ?.unemployment
                  )}
                />

                <KpiCard
                  label="10Y Bond"
                  value={formatMetric(
                    data?.macro
                      ?.bondYield,
                    country.code ===
                      "IND"
                      ? 4
                      : 2
                  )}
                  source={metricSource(
                    data?.macro
                      ?.bondYield
                  )}
                />

                <KpiCard
                  label="Stock Market"
                  value={
                    resolvedMarket
                      ?.value !==
                      null &&
                    resolvedMarket
                      ?.value !==
                      undefined
                      ? `${resolvedMarket.name || "Market"} ${resolvedMarket.value.toFixed(
                          2
                        )}`
                      : "Unavailable"
                  }
                  source={metricSource(
                    resolvedMarket
                  )}
                />
              </SimpleGrid>

              <Paper
                withBorder
                radius="lg"
                p="lg"
              >
                <Group
                  justify="space-between"
                >
                  <Stack gap={4}>
                    <Text
                      c="dimmed"
                      size="sm"
                    >
                      Data Coverage
                    </Text>

                    <Text
                      fw={800}
                      size="xl"
                    >
                      {coverage.toFixed(
                        0
                      )}
                      %
                    </Text>
                  </Stack>

                  <Badge
                    color={riskColor(
                      riskLevel
                    )}
                    size="lg"
                    variant="light"
                  >
                    {riskLevel}
                  </Badge>
                </Group>

                <Progress
                  mt="md"
                  value={coverage}
                  color="cyan"
                  size="lg"
                  radius="xl"
                />
              </Paper>
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel
          value="economy"
          p="lg"
        >
          <Stack gap="lg">
            <SimpleGrid
              cols={{
                base: 1,
                sm: 2,
              }}
            >
              <KpiCard
                label="GDP Growth"
                value={formatMetric(
                  data?.macro
                    ?.gdpGrowth
                )}
                source={metricSource(
                  data?.macro
                    ?.gdpGrowth
                )}
              />

              <KpiCard
                label="Inflation"
                value={formatMetric(
                  data?.macro
                    ?.inflation
                )}
                source={metricSource(
                  data?.macro
                    ?.inflation
                )}
              />

              <KpiCard
                label="Unemployment"
                value={formatMetric(
                  data?.macro
                    ?.unemployment
                )}
                source={metricSource(
                  data?.macro
                    ?.unemployment
                )}
              />

              <KpiCard
                label="Policy Rate"
                value={formatMetric(
                  data?.macro
                    ?.policyRate,
                  3
                )}
                source={metricSource(
                  data?.macro
                    ?.policyRate
                )}
              />
            </SimpleGrid>

            <Paper
              withBorder
              radius="lg"
              p="lg"
              style={{
                background:
                  "rgba(15,23,42,.55)",
                borderColor:
                  "rgba(148,163,184,.14)",
              }}
            >
              <Group
                justify="space-between"
                align="flex-start"
                mb="md"
              >
                <Stack gap={2}>
                  <Title order={4}>
                    📈 10-Year Macro Trends
                  </Title>

                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    GDP growth, inflation aur unemployment
                  </Text>
                </Stack>

                <Badge
                  variant="light"
                  color={
                    history?.status ===
                    "live"
                      ? "green"
                      : historyLoading
                        ? "yellow"
                        : "gray"
                  }
                >
                  {historyLoading
                    ? "LOADING"
                    : history?.status
                      ?.toUpperCase() ||
                      "OFFLINE"}
                </Badge>
              </Group>

              {historyLoading ? (
                <Skeleton
                  height={320}
                  radius="lg"
                />
              ) : historyError ? (
                <Text
                  c="red"
                  size="sm"
                >
                  {historyError}
                </Text>
              ) : macroChartData.length >
                0 ? (
                <>
                  <LineChart
                    h={320}
                    data={
                      macroChartData
                    }
                    dataKey="year"
                    withLegend
                    curveType="linear"
                    series={[
                      {
                        name:
                          "gdpGrowth",
                        label:
                          "GDP Growth",
                      },

                      {
                        name:
                          "inflation",
                        label:
                          "Inflation",
                      },

                      {
                        name:
                          "unemployment",
                        label:
                          "Unemployment",
                      },
                    ]}
                    valueFormatter={(
                      value
                    ) =>
                      `${Number(
                        value
                      ).toFixed(
                        2
                      )}%`
                    }
                    yAxisProps={{
                      domain: [
                        "auto",
                        "auto",
                      ],
                    }}
                  />

                  <Group
                    justify="space-between"
                    mt="sm"
                  >
                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      Source: World Bank
                    </Text>

                    {history?.updatedAt && (
                      <Text
                        size="xs"
                        c="dimmed"
                      >
                        Updated:{" "}
                        {new Date(
                          history.updatedAt
                        ).toLocaleString()}
                      </Text>
                    )}
                  </Group>
                </>
              ) : (
                <Text
                  c="dimmed"
                  size="sm"
                >
                  Historical data unavailable.
                </Text>
              )}
            </Paper>

            {data?.macro
              ?.policyRate
              ?.note && (
              <Paper
                withBorder
                radius="lg"
                p="md"
              >
                <Text
                  size="sm"
                  c="yellow"
                >
                  ⚠{" "}
                  {
                    data.macro
                      .policyRate
                      .note
                  }
                </Text>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel
          value="markets"
          p="lg"
        >
          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
            }}
          >
            <KpiCard
              label="Stock Market"
              value={
                resolvedMarket
                  ?.value !==
                  null &&
                resolvedMarket
                  ?.value !==
                  undefined
                  ? `${resolvedMarket.name || "Market"} ${resolvedMarket.value.toFixed(
                      2
                    )}`
                  : "Unavailable"
              }
              source={metricSource(
                resolvedMarket
              )}
            />

            <KpiCard
              label="Currency"
              value={
                country.code ===
                "USA"
                  ? data?.macro
                        ?.dollarStrength
                        ?.value !==
                      null &&
                    data?.macro
                        ?.dollarStrength
                        ?.value !==
                      undefined
                    ? `USD Index ${data.macro.dollarStrength.value.toFixed(
                        4
                      )}`
                    : "USD"
                  : resolvedCurrency
                        ?.value !==
                        null &&
                      resolvedCurrency
                        ?.value !==
                        undefined
                    ? `${resolvedCurrency.name || "FX"} ${resolvedCurrency.value.toFixed(
                        4
                      )}`
                    : data?.country
                        ?.currency ||
                      country.currency ||
                      "Unavailable"
              }
              source={metricSource(
                country.code ===
                  "USA"
                  ? data?.macro
                      ?.dollarStrength
                  : resolvedCurrency
              )}
            />

            <KpiCard
              label="Bond Yield"
              value={formatMetric(
                data?.macro
                  ?.bondYield,
                country.code ===
                  "IND"
                  ? 4
                  : 2
              )}
              source={metricSource(
                data?.macro
                  ?.bondYield
              )}
            />

            <KpiCard
              label="Central Bank"
              value={
                data?.country
                  ?.centralBank ||
                "Unavailable"
              }
            />
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel
          value="risk"
          p="lg"
        >
          <SimpleGrid
            cols={{
              base: 1,
              md: 2,
            }}
          >
            <Paper
              withBorder
              radius="lg"
              p="lg"
            >
              <Group justify="center">
                <RingProgress
                  size={180}
                  thickness={14}
                  roundCaps
                  sections={[
                    {
                      value:
                        score,
                      color:
                        riskColor(
                          riskLevel
                        ),
                    },
                  ]}
                  label={
                    <Stack
                      gap={0}
                      align="center"
                    >
                      <Text
                        fw={900}
                        size="xl"
                      >
                        {score.toFixed(
                          1
                        )}
                      </Text>

                      <Text
                        size="xs"
                        c="dimmed"
                      >
                        /100
                      </Text>
                    </Stack>
                  }
                />
              </Group>

              <Group
                justify="space-between"
                mt="md"
              >
                <Badge
                  color={riskColor(
                    riskLevel
                  )}
                  size="lg"
                  variant="light"
                >
                  {riskLevel}
                </Badge>

                <Badge
                  color={biasColor(
                    marketBias
                  )}
                  size="lg"
                  variant="light"
                >
                  {marketBias}
                </Badge>
              </Group>
            </Paper>

            <Paper
              withBorder
              radius="lg"
              p="lg"
            >
              <Stack gap="md">
                <Title order={4}>
                  Risk Breakdown
                </Title>

                <Box>
                  <Group
                    justify="space-between"
                  >
                    <Text size="sm">
                      Macro Risk
                    </Text>

                    <Text
                      size="sm"
                      fw={700}
                    >
                      {risk?.scores
                        .macro !==
                        null &&
                      risk?.scores
                        .macro !==
                        undefined
                        ? `${risk.scores.macro.toFixed(
                            1
                          )}/100`
                        : "—"}
                    </Text>
                  </Group>

                  <Progress
                    mt={5}
                    value={
                      risk?.scores
                        .macro ||
                      0
                    }
                    color="cyan"
                  />
                </Box>

                <Box>
                  <Group
                    justify="space-between"
                  >
                    <Text size="sm">
                      News Risk
                    </Text>

                    <Text
                      size="sm"
                      fw={700}
                    >
                      {newsRisk
                        ? `${newsRisk.score}/100`
                        : "—"}
                    </Text>
                  </Group>

                  <Progress
                    mt={5}
                    value={
                      newsRisk
                        ?.score ||
                      0
                    }
                    color={riskColor(
                      newsRisk
                        ?.level
                    )}
                  />
                </Box>

                <Box>
                  <Group
                    justify="space-between"
                  >
                    <Text size="sm">
                      Confidence
                    </Text>

                    <Text fw={700}>
                      {risk?.confidence ||
                        macroRisk
                          ?.confidence ||
                        "—"}
                    </Text>
                  </Group>
                </Box>

                {risk
                  ?.calculationMethod && (
                  <>
                    <Divider />

                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      Model:{" "}
                      {
                        risk.calculationMethod
                      }
                    </Text>
                  </>
                )}
              </Stack>
            </Paper>
          </SimpleGrid>

          <Paper
            withBorder
            radius="lg"
            p="lg"
            mt="lg"
          >
            <Title order={4}>
              🧠 Key Drivers
            </Title>

            <Stack
              gap="xs"
              mt="md"
            >
              {(
                risk?.drivers ||
                macroRisk
                  ?.reasons ||
                []
              ).length >
              0 ? (
                (
                  risk?.drivers ||
                  macroRisk
                    ?.reasons ||
                  []
                ).map(
                  (
                    driver,
                    index
                  ) => (
                    <Text
                      key={`${driver}-${index}`}
                      size="sm"
                    >
                      • {driver}
                    </Text>
                  )
                )
              ) : (
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Risk drivers unavailable.
                </Text>
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel
          value="news"
          p="lg"
        >
          <Stack gap="lg">
            <SimpleGrid
              cols={{
                base: 1,
                sm: 3,
              }}
            >
              <KpiCard
                label="News Risk"
                value={
                  newsRisk
                    ? `${newsRisk.level} • ${newsRisk.score}/100`
                    : "Unavailable"
                }
              />

              <KpiCard
                label="Live News"
                value={String(
                  data
                    ?.countryNews
                    ?.fetchedCount ||
                  0
                )}
              />

              <KpiCard
                label="High Impact"
                value={String(
                  newsRisk
                    ?.highImpactCount ||
                  0
                )}
              />
            </SimpleGrid>

            <Paper
              withBorder
              radius="lg"
              p="lg"
            >
              <Title order={4}>
                Current Issues
              </Title>

              <Stack
                gap="sm"
                mt="md"
              >
                {issues.length >
                0 ? (
                  issues.map(
                    (
                      issue,
                      index
                    ) => (
                      <Paper
                        key={`${issue}-${index}`}
                        withBorder
                        radius="md"
                        p="md"
                      >
                        <Text
                          size="sm"
                          fw={700}
                        >
                          {issue}
                        </Text>
                      </Paper>
                    )
                  )
                ) : (
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    No current issues available.
                  </Text>
                )}
              </Stack>
            </Paper>

            {articles.length >
              0 && (
              <Paper
                withBorder
                radius="lg"
                p="lg"
              >
                <Title order={4}>
                  Latest Articles
                </Title>

                <Stack
                  gap="sm"
                  mt="md"
                >
                  {articles.map(
                    (
                      article,
                      index
                    ) => (
                      <Box
                        key={`${article.title}-${index}`}
                      >
                        <Text
                          size="sm"
                          fw={700}
                        >
                          {article.title}
                        </Text>

                        <Text
                          size="xs"
                          c="dimmed"
                        >
                          {[
                            article.source,
                            article.freshness,
                            article.ageHours !==
                              null &&
                            article.ageHours !==
                              undefined
                              ? `${article.ageHours}h ago`
                              : null,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              " • "
                            )}
                        </Text>

                        {index <
                          articles.length -
                            1 && (
                          <Divider
                            mt="sm"
                          />
                        )}
                      </Box>
                    )
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Box
        px="lg"
        pb="lg"
      >
        <Divider mb="sm" />

        <Text
          size="xs"
          c="dimmed"
        >
          {data?.updatedAt
            ? `Data fetched: ${new Date(
                data.updatedAt
              ).toLocaleString()}`
            : "Waiting for live data"}
        </Text>
      </Box>
    </Card>
  );
}

export default CountryIntelligencePanel;
