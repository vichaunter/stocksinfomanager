import { useQuery } from "@apollo/client";
import { Button, Flex, NumberFormatter, Table, Text } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconRefresh,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ApiTickers,
  ApiTickersFilters,
  QUERY_TICKERS,
} from "../../api/queries/tickersQuery";
import useFavorites from "../../hooks/useFavorites";
import useUpdateTicker from "../../hooks/useUpdateTicker";

dayjs.extend(relativeTime);

const COLUMNS = [
  { id: "symbol", name: "Symbol" },
  { id: "price", name: "Price" },
  { id: "dividendAnnualPayout", name: "Div Annual Payout" },
  { id: "dividendYield", name: "Div Yield" },
  { id: "dividendLastYearsPayingCount", name: "Div Y paying" },
  { id: "dividendYearsGrowhth", name: "Div Y growth" },
  { id: "dividendFrequency", name: "Div Freq" },
  { id: "updatedAt", name: "LastUpdate" },
];

type Props = {
  filters: ApiTickersFilters;
};

const TickersList: FC<Props> = ({ filters }) => {
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sorting, setSorting] = useState<string>("dividendYield");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const { favorites, toggleFavorite } = useFavorites();

  const { loading, error, data, refetch } = useQuery<{ tickers: ApiTickers }>(
    QUERY_TICKERS,
    {
      variables: {
        ...filters,
      },
      fetchPolicy: "cache-first",
      pollInterval: 0,
    }
  );

  const {
    symbol: updateSymbol,
    update: updateTicker,
    loading: loadingUpdateTicker,
    responseDuration,
  } = useUpdateTicker();

  useEffect(() => {
    refetch(filters);
  }, [filters]);

  const handleUpdateTickers = async (symbols: string[]) => {
    for (const symbol of symbols) {
      await updateTicker(symbol);
    }
  };

  const handleToggleFavorites = () => {
    setOnlyFavorites((prev) => !prev);
  };

  const handleOnSetSorting = (id: string) => {
    if (id === sorting) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    }
    setSorting(id);
  };

  if (!data?.tickers?.length) return <>No data</>;
  if (error) return <p>Error : {error.message}</p>;

  let tickers =
    data?.tickers
      ?.filter((t) =>
        onlyFavorites
          ? favorites?.localFavorites?.find((f: any) => f.symbol === t.symbol)
          : true
      )
      ?.map((t) => ({
        ...t,
        updatedAt: dayjs(t.updatedAt),
      })) || [];

  tickers.sort((a: any, b: any) => a[sorting] - b[sorting]);
  if (sortDir === "desc") tickers.reverse();

  const chevron = sortDir === "desc" ? <IconChevronDown /> : <IconChevronUp />;

  const startOffset = page < 2 ? 0 : (page - 1) * perPage;
  const endOffset = startOffset + perPage;

  const visibleTickers = tickers.slice(startOffset, endOffset);
  const rows = visibleTickers.map((ticker) => {
    const FavIcon = favorites?.localFavorites?.find(
      (f: any) => f.symbol === ticker.symbol
    )
      ? IconStarFilled
      : IconStar;

    return (
      <Table.Tr key={ticker.symbol}>
        <Table.Td>
          <Button variant="transparent" color="yellow">
            <FavIcon onClick={() => toggleFavorite(ticker.symbol)} />
          </Button>
        </Table.Td>
        <Table.Td>
          <Link to={`/ticker/${ticker.symbol}`} target="_blank">
            {ticker.symbol}
          </Link>
        </Table.Td>
        <Table.Td>$ {ticker.price}</Table.Td>
        <Table.Td>$ {ticker.dividendAnnualPayout}</Table.Td>
        <Table.Td>{ticker.dividendYield} %</Table.Td>
        <Table.Td>{ticker.dividendLastYearsPayingCount}</Table.Td>
        <Table.Td>{ticker.dividendYearsGrowhth}</Table.Td>
        <Table.Td>{ticker.dividendFrequency}</Table.Td>
        <Table.Td>{ticker.updatedAt && ticker.updatedAt.fromNow()}</Table.Td>
        <Table.Td>
          <IconRefresh
            className={
              updateSymbol === ticker.symbol && loadingUpdateTicker
                ? "spin"
                : ""
            }
            onClick={() => !loadingUpdateTicker && updateTicker(ticker.symbol)}
          />
        </Table.Td>
      </Table.Tr>
    );
  });
  return (
    <>
      <Flex justify="space-between" mb={15}>
        <Button
          color="dark"
          variant="transparent"
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page < 2}
        >
          <IconChevronLeft />
          Previous page
        </Button>
        <Flex direction="column" align={"center"}>
          {page} / {Math.ceil(tickers.length / perPage)}{" "}
          <Text size="xs" c="gray.5">
            (found {tickers.length})
          </Text>
        </Flex>
        <Button
          color="dark"
          variant="transparent"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page > Math.ceil(tickers.length / perPage)}
        >
          Next page <IconChevronRight />
        </Button>
      </Flex>
      <Table highlightOnHover striped stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th onClick={handleToggleFavorites}>
              <Button variant="transparent" color="yellow">
                {onlyFavorites ? <IconStarFilled /> : <IconStar />}
              </Button>
            </Table.Th>
            {COLUMNS.map((h) => (
              <Table.Th key={h.id}>
                {h.name && (
                  <Button
                    color={h.id === sorting ? "dark" : "blue"}
                    onClick={() => handleOnSetSorting(h.id)}
                  >
                    {h.name} {h.id === sorting && chevron}
                  </Button>
                )}
              </Table.Th>
            ))}
            <Table.Th>
              Actions{" "}
              <IconRefresh
                onClick={() =>
                  handleUpdateTickers(visibleTickers.map((t) => t.symbol))
                }
              />
              <NumberFormatter
                value={(responseDuration * tickers.length) / 60}
                decimalScale={2}
              />
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </>
  );
};

export default TickersList;
