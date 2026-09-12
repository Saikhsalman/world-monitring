import {
  useMemo,
  useState,
} from "react";

type SearchItem = {
  name: string;
  code: string;
};

type Props = {
  onSelect: (
    countryName: string,
    countryCode: string
  ) => void;
};

const COUNTRIES: SearchItem[] = [
  {
    name: "India",
    code: "IND",
  },
  {
    name: "United States",
    code: "USA",
  },
  {
    name: "Germany",
    code: "DEU",
  },
  {
    name: "Japan",
    code: "JPN",
  },
  {
    name: "United Kingdom",
    code: "GBR",
  },
  {
    name: "China",
    code: "CHN",
  },
  {
    name: "France",
    code: "FRA",
  },
  {
    name: "Italy",
    code: "ITA",
  },
  {
    name: "Canada",
    code: "CAN",
  },
  {
    name: "Australia",
    code: "AUS",
  },
  {
    name: "Brazil",
    code: "BRA",
  },
  {
    name: "Russia",
    code: "RUS",
  },
  {
    name: "South Korea",
    code: "KOR",
  },
  {
    name: "Saudi Arabia",
    code: "SAU",
  },
  {
    name: "United Arab Emirates",
    code: "ARE",
  },
  {
    name: "Singapore",
    code: "SGP",
  },
  {
    name: "Switzerland",
    code: "CHE",
  },
  {
    name: "Netherlands",
    code: "NLD",
  },
];

function GlobalSearch({
  onSelect,
}: Props) {
  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const results =
    useMemo(() => {
      const text =
        query
          .trim()
          .toLowerCase();

      if (!text) {
        return [];
      }

      return COUNTRIES
        .filter(
          (item) =>
            item.name
              .toLowerCase()
              .includes(text) ||
            item.code
              .toLowerCase()
              .includes(text)
        )
        .slice(
          0,
          8
        );
    }, [query]);

  const selectCountry = (
    item: SearchItem
  ) => {
    onSelect(
      item.name,
      item.code
    );

    setQuery(
      item.name
    );

    setOpen(false);
  };

  return (
    <div className="global-search">
      <div className="global-search-input-wrap">
        <span className="global-search-icon">
          ⌕
        </span>

        <input
          value={query}
          onChange={(
            event
          ) => {
            setQuery(
              event
                .target
                .value
            );

            setOpen(
              true
            );
          }}
          onFocus={() =>
            setOpen(
              true
            )
          }
          placeholder="Search country..."
        />
      </div>

      {open &&
        query &&
        (
          <div className="global-search-results">
            {results.length >
            0 ? (
              results.map(
                (item) => (
                  <button
                    key={
                      item.code
                    }
                    type="button"
                    onClick={() =>
                      selectCountry(
                        item
                      )
                    }
                  >
                    <span>
                      {
                        item.name
                      }
                    </span>

                    <strong>
                      {
                        item.code
                      }
                    </strong>
                  </button>
                )
              )
            ) : (
              <div className="global-search-empty">
                No country found
              </div>
            )}
          </div>
        )}
    </div>
  );
}

export default GlobalSearch;