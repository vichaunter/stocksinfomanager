import { useQuery } from "@apollo/client";
import { Group, Paper, SimpleGrid, Text } from "@mantine/core";
import dayjs from "dayjs";
import { FC } from "react";
import { useParams } from "react-router-dom";
import { QUERY_TICKER, Ticker } from "../api/queries/tickersQuery";
import { LABELS } from "../constants";
import TickerLinks from "../components/blocks/TickerLinks";

const mainInfo: (keyof Ticker)[] = [
  "dividendYield",
  "dividendAnnualPayout",
  "dividendAmount",
  "dividend5YearGrowhthRate",
  "dividendPayoutRatio",
  "dividendYearsGrowhth",
  "dividendFrequency",
];

const dateInfo: (keyof Ticker)[] = [
  "dividendExDate",
  "dividendDeclareDate",
  "dividendPayoutDate",
  "dividendRecordDate",
  "nextExDate",
  "nextPayDate",
];

type GroupProps = {
  ticker: Ticker;
  keys: (keyof Ticker)[];
};
const TickerGroup: FC<GroupProps> = ({ ticker, keys }) => {
  const parseValue = (value?: number | string | boolean, type?: string) => {
    if (type && value) {
      if (type === "boolean") {
        return "No";
      } else if (type === "date") {
        return dayjs(new Date(value as string)).format("DD/MM/YYYY");
      }
    }

    return value;
  };

  return (
    <Paper withBorder p="md" radius="md" mb="lg">
      <SimpleGrid cols={4}>
        {keys.map((k) => (
          <Group key={k} justify="apart">
            <div>
              <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                {LABELS[k].name}
              </Text>
              <Text fw={700} fz="xl">
                {LABELS[k].prefix} {parseValue(ticker[k], LABELS[k].type)}{" "}
                {LABELS[k].suffix}
              </Text>
            </div>
          </Group>
        ))}
      </SimpleGrid>
    </Paper>
  );
};

const TickerPage = () => {
  const { symbol } = useParams();
  const { loading, error, data } = useQuery<{ ticker: Ticker }>(QUERY_TICKER, {
    variables: {
      symbol,
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  if (!data?.ticker) return <>No data</>;

  return (
    <>
      <h1>
        {data.ticker.symbol} - {data.ticker.name}
      </h1>
      <TickerGroup ticker={data.ticker} keys={mainInfo} />
      <TickerGroup ticker={data.ticker} keys={dateInfo} />
      <TickerLinks symbol={data.ticker.symbol} />
    </>
  );
};

export default TickerPage;
