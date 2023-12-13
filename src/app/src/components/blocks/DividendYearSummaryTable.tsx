import { Table } from "@mantine/core";
import usePortfolioStore from "../../store/usePortfolioStore";
import { ApiTickers } from "../../api/queries/tickersQuery";
import { FC } from "react";
import _ from "lodash";

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

type Props = {
  tickers: ApiTickers;
};
const DividendYearSummaryTable: FC<Props> = ({ tickers }) => {
  const dividends = usePortfolioStore((state) => state.dividends);
  const portfolio = usePortfolioStore((state) => state.portfolio);

  const getTickerInfo = (symbol: string) =>
    tickers.find((t) => t.symbol === symbol);

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
          {portfolio.map((row) => {
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
    </>
  );
};

export default DividendYearSummaryTable;
