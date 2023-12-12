import { useQuery } from "@apollo/client";
import { Flex, NumberFormatter, SimpleGrid, Table, Text } from "@mantine/core";
import { getPercentColor } from "@packages/utils";
import { IconRefresh } from "@tabler/icons-react";
import _ from "lodash";
import { FC, useEffect, useMemo } from "react";
import { QUERY_TICKERS, ApiTickers } from "../../api/queries/tickersQuery";
import {
  BrokerExtractBuyLine,
  BrokerExtractDividendLine,
  Portfolio,
} from "../../hooks/useBrokers";
import useUpdateTicker from "../../hooks/useUpdateTicker";
import InfostatBlock from "../../components/blocks/InfostatBlock";
import NumberCurrency from "../../components/text/NumberCurrency";

const HEADS = [
  "Ticker",
  "Price",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "Div Received",
];

const CALCULATIONS = [
  "Stocks",
  "Price",
  "Units",
  "Invested",
  "% Cartera",
  "YIELD",
  "Current Value",
  "Actions",
];

type Props = {
  totals: Portfolio[];
  buys?: BrokerExtractBuyLine[];
  dividends?: BrokerExtractDividendLine[];
};
const PortfolioTotals: FC<Props> = ({ totals, buys, dividends }) => {
  const totalInvested = _.sumBy(buys, "amount");
  const tickersList: string[] = useMemo(
    () => totals.map((t) => t.ticker) || [],
    [totals]
  );

  const getPercentage = (amount: number) => (amount / totalInvested) * 100;
  const percentMedian =
    buys?.reduce((acc, cur) => {
      const percent = getPercentage(cur.amount);
      return acc < percent ? percent : acc;
    }, 0) || 2;

  const {
    symbol: updateSymbol,
    update: updateTicker,
    loading: loadingUpdateTicker,
  } = useUpdateTicker();

  const { data, refetch } = useQuery<{ tickers: ApiTickers }>(QUERY_TICKERS, {
    variables: {
      tickers: tickersList,
    },
  });

  useEffect(() => {
    refetch({ tickers: tickersList });
  }, [totals]);

  if (!data) return <>No data yet...</>;

  const getTickerInfo = (symbol: string) =>
    data.tickers.find((t) => t.symbol === symbol);

  const totalCurrentValue = totals.reduce((acc, cur) => {
    const info = getTickerInfo(cur.ticker);
    return acc + (info?.price ? info?.price * cur.units : 0);
  }, 0);

  const expectedAnnualDividends = _.sum(
    totals.map((t) => {
      const dataTicker = data.tickers.find(
        (ticker) => ticker.symbol === t.ticker
      );
      if (!dataTicker?.dividendAnnualPayout) return 0;
      return dataTicker?.dividendAnnualPayout * t.units;
    })
  );
  const expectedMonthlyDividends = expectedAnnualDividends / 12;
  const dividendReceived = _.sumBy(dividends, "amount");
  const goal = 2000;
  const currentPercentegeReached =
    ((expectedAnnualDividends / 12) * 100) / goal;
  const totalNeededForGoal = (goal * totalInvested) / expectedMonthlyDividends;

  const resume = (
    <>
      <h3>Resume</h3>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <InfostatBlock
          title="Total invested"
          value={totalInvested}
          secondLineValue={<NumberCurrency value={totalNeededForGoal} />}
          secondLineLegend={
            <NumberCurrency
              value={totalNeededForGoal - totalInvested}
              prefix="remaining $"
            />
          }
        />
        <InfostatBlock
          title="Total current value"
          value={totalCurrentValue}
          previousValue={totalInvested}
        />
        <InfostatBlock
          title="Total dividends received"
          value={dividendReceived}
        />
        <InfostatBlock
          title="Yearly Dividend Expected"
          value={expectedAnnualDividends}
          positive
          secondLineValue={
            <NumberCurrency
              value={(expectedAnnualDividends * 100) / totalInvested}
              suffix="%"
              prefix={false}
            />
          }
          secondLineLegend={"YIELD"}
        />
        <InfostatBlock
          title="Monthly Dividend Expected"
          value={expectedAnnualDividends / 12}
        />
        <InfostatBlock
          title="Monthly Goal"
          value={goal}
          secondLineValue={
            <NumberCurrency
              value={currentPercentegeReached}
              suffix="%"
              prefix={false}
            />
          }
          secondLineLegend={
            <NumberCurrency
              value={goal - expectedMonthlyDividends}
              prefix="remaining $"
            />
          }
        />
      </SimpleGrid>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {CALCULATIONS.map((h) => (
              <Table.Th key={`head-calc-${h}`}>{h}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {totals?.map(({ ticker, units, amount }) => {
            const info = getTickerInfo(ticker);
            const percentage = getPercentage(amount);

            return (
              <Table.Tr key={`row-${ticker}`}>
                <Table.Td>{ticker}</Table.Td>
                <Table.Td>$ {info?.price}</Table.Td>
                <Table.Td>{units.toFixed(2)}</Table.Td>
                <Table.Td>$ {amount.toFixed(2)}</Table.Td>
                <Table.Td>
                  <Flex>
                    <Text
                      display={"flex"}
                      w={5}
                      mr={15}
                      bg={getPercentColor(percentage, percentMedian / 2)}
                    />
                    {percentage.toFixed(2)} %
                  </Flex>
                </Table.Td>
                <Table.Td></Table.Td>
                <Table.Td>
                  {info?.price ? (info.price * units).toFixed(2) : null}
                </Table.Td>
                <Table.Td>
                  <IconRefresh
                    className={
                      updateSymbol === ticker && loadingUpdateTicker
                        ? "spin"
                        : ""
                    }
                    onClick={() => !loadingUpdateTicker && updateTicker(ticker)}
                  />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </>
  );

  const groupedByTicker = _.groupBy(dividends, "ticker");
  const dividendPerTickerMonth = _.mapValues(
    groupedByTicker,
    (entriesByTicker) => {
      const groupedByYearMonth = _.groupBy(entriesByTicker, (entry) => {
        const date = new Date(entry.date);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      });

      return _.mapValues(groupedByYearMonth, (entriesByYearMonth) =>
        _.sumBy(entriesByYearMonth, "amount")
      );
    }
  );

  const diviYear = new Date().getFullYear();
  return (
    <>
      <h2>Year {diviYear}</h2>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            {HEADS.map((h) => (
              <Table.Th key={h}>{h}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {totals.map((row) => {
            const tickerInfo = getTickerInfo(row.ticker);
            let divReceived = 0;
            return (
              <Table.Tr key={`totals-${row.ticker}`}>
                <Table.Td>{row.ticker}</Table.Td>
                <Table.Td>{tickerInfo?.price}</Table.Td>
                {Array.from(Array(12).keys()).map((m) => {
                  const monthDividend =
                    dividendPerTickerMonth?.[row.ticker]?.[
                      `${diviYear}-${m + 1}`
                    ];
                  divReceived += monthDividend ?? 0;
                  return (
                    <Table.Td key={`totals-${row.ticker}-${m}`}>
                      {monthDividend?.toFixed(2)}
                    </Table.Td>
                  );
                })}
                <Table.Td align="right">{divReceived}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      {resume}
    </>
  );
};

export default PortfolioTotals;
