import type {
  BreakingNewsData,
} from "../services/newsService";

type Props = {
  breakingNews: BreakingNewsData | null;
  newsLoading: boolean;
  newsError: string;
};

function BreakingIntelligenceSection({
  breakingNews,
  newsLoading,
  newsError,
}: Props) {
  return (
    <section>
      {/* BREAKING INTELLIGENCE */}

      <div className="card">
        <div className="card-heading">
          <h3>📰 Breaking Intelligence</h3>

          <span>
            {newsLoading
              ? "CONNECTING"
              : breakingNews?.status === "live"
                ? "LIVE"
                : "UNAVAILABLE"}
          </span>
        </div>

        {breakingNews?.impact && (
          <div className="market-source">
            🔴 High: {breakingNews.impact.high.length}
            {" • "}
            🟠 Medium: {breakingNews.impact.medium.length}
            {" • "}
            🟢 Low: {breakingNews.impact.low.length}
          </div>
        )}

        {newsError && (
          <div className="news-item high">
            {newsError}
          </div>
        )}

        {/* HIGH IMPACT */}

        {!newsError &&
          breakingNews?.impact?.high
            .slice(0, 2)
            .map((article) => (
              <div
                key={article.url}
                className="news-item high"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  🔴 {article.title}
                </a>

                <small className="market-source">
                  {article.source}
                  {" • "}
                  HIGH

                  {article.intelligence && (
                    <>
                      {" • "}
                      Score {article.intelligence.score}
                      {" • "}
                      {article.intelligence.categories.join(
                        " / "
                      )}
                    </>
                  )}

                  {article.publishedAt && (
                    <>
                      {" • "}
                      {new Date(
                        article.publishedAt
                      ).toLocaleString()}
                    </>
                  )}
                </small>
              </div>
            ))}

        {/* MEDIUM IMPACT */}

        {!newsError &&
          breakingNews?.impact?.medium
            .slice(0, 2)
            .map((article) => (
              <div
                key={article.url}
                className="news-item medium"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  🟠 {article.title}
                </a>

                <small className="market-source">
                  {article.source}
                  {" • "}
                  MEDIUM

                  {article.intelligence && (
                    <>
                      {" • "}
                      Score {article.intelligence.score}
                      {" • "}
                      {article.intelligence.categories.join(
                        " / "
                      )}
                    </>
                  )}

                  {article.publishedAt && (
                    <>
                      {" • "}
                      {new Date(
                        article.publishedAt
                      ).toLocaleString()}
                    </>
                  )}
                </small>
              </div>
            ))}

        {/* LOW IMPACT */}

        {!newsError &&
          breakingNews?.impact?.low
            .slice(0, 1)
            .map((article) => (
              <div
                key={article.url}
                className="news-item low"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  🟢 {article.title}
                </a>

                <small className="market-source">
                  {article.source}
                  {" • "}
                  LOW

                  {article.intelligence && (
                    <>
                      {" • "}
                      Score {article.intelligence.score}
                      {" • "}
                      {article.intelligence.categories.join(
                        " / "
                      )}
                    </>
                  )}

                  {article.publishedAt && (
                    <>
                      {" • "}
                      {new Date(
                        article.publishedAt
                      ).toLocaleString()}
                    </>
                  )}
                </small>
              </div>
            ))}
      </div>

      {/* GLOBAL RISK */}

      <div className="card">
        <div className="card-heading">
          <h3>🌍 Global Risk Signal</h3>

          <span>
            {newsLoading
              ? "CALCULATING"
              : "LIVE"}
          </span>
        </div>

        {!breakingNews?.marketImpact ? (
          <div className="market-source">
            Market risk data unavailable
          </div>
        ) : (
          <>
            <div className="market-source">
              🟢 Positive:{" "}
              {
                breakingNews.marketImpact
                  .positive.length
              }
              {" • "}
              🔴 Negative:{" "}
              {
                breakingNews.marketImpact
                  .negative.length
              }
              {" • "}
              ⚪ Neutral:{" "}
              {
                breakingNews.marketImpact
                  .neutral.length
              }
            </div>

            <div
              className={
                breakingNews.marketImpact
                  .negative.length >
                breakingNews.marketImpact
                  .positive.length
                  ? "news-item high"
                  : breakingNews.marketImpact
                        .positive.length >
                      breakingNews.marketImpact
                        .negative.length
                    ? "news-item low"
                    : "news-item medium"
              }
            >
              <strong>
                GLOBAL RISK:{" "}
                {breakingNews.marketImpact
                  .negative.length >
                breakingNews.marketImpact
                  .positive.length
                  ? "RISK-OFF"
                  : breakingNews.marketImpact
                        .positive.length >
                      breakingNews.marketImpact
                        .negative.length
                    ? "RISK-ON"
                    : "NEUTRAL"}
              </strong>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default BreakingIntelligenceSection;
