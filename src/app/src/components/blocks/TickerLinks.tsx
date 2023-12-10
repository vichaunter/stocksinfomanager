import { Table } from "@mantine/core";
import { FC } from "react";

const URLS = [
  {
    name: "eToro",
    getUrl: (symbol: string) => `https://www.etoro.com/markets/${symbol}/`,
  },
  {
    name: "Seeking Alpha",
    getUrl: (symbol: string) => `https://seekingalpha.com/symbol/${symbol}`,
  },
  {
    name: "Nasdaq",
    getUrl: (symbol: string) =>
      `https://www.nasdaq.com/market-activity/stocks/${symbol}`,
  },
  {
    name: "MarketWatch",
    getUrl: (symbol: string) =>
      `https://www.marketwatch.com/investing/stock/${symbol}`,
  },
  {
    name: "StockAnalysis",
    getUrl: (symbol: string) => `https://stockanalysis.com/stocks/${symbol}/`,
  },
  {
    name: "Yahoo financial",
    getUrl: (symbol: string) => `https://finance.yahoo.com/quote/${symbol}/`,
  },
];

type Props = {
  symbol: string;
};

const TickerLinks: FC<Props> = ({ symbol }) => {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Site</Table.Th>
          <Table.Th>Url</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {URLS.map((link) => (
          <Table.Tr>
            <Table.Td>{link.name}</Table.Td>
            <Table.Td>
              <a href={link.getUrl(symbol)} target="_blank">
                {link.getUrl(symbol)}
              </a>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default TickerLinks;
