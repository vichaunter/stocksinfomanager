import { Flex, Input, InputLabel, Paper, SimpleGrid } from "@mantine/core";
import PortfolioTotals from "../components/portfolio/PortfolioTotals";
import Table from "../components/tables/Table";
import useBrokersExtract, {
  BrokerExtractBuyLine,
  BrokerExtractDividendLine,
} from "../hooks/useBrokersExtract";
import _ from "lodash";
import dayjs from "dayjs";

const PortfolioPage = () => {
  const { portfolio, data, updateData } = useBrokersExtract();

  const buys = _.flatten(data.map((p) => p.buys)) as BrokerExtractBuyLine[];
  const dividends = _.flatten(
    data.map((p) => p.dividends)
  ) as BrokerExtractDividendLine[];
  console.log(portfolio);
  return (
    <SimpleGrid>
      <h2>Portfolio</h2>
      {portfolio && (
        <PortfolioTotals
          totals={portfolio}
          buys={_.compact(buys)}
          dividends={_.compact(dividends)}
        />
      )}

      <h2>Upload data</h2>
      <Paper withBorder p="md" radius="md">
        <Flex justify={"space-between"}>
          <InputLabel p={"md"}>
            Etoro (
            <a
              target="_blank"
              href={`https://www.etoro.com/documents/accountstatement/2009-01-01/${dayjs(
                new Date()
              ).format("YYYY-MM-DD")}`}
            >
              xlsx
            </a>
            ):
            <Input type="file" onChange={(e) => updateData("etoro", e)} />
          </InputLabel>
          <InputLabel p="md">
            Revolut (csv):
            <Input type="file" onChange={(e) => updateData("revolut", e)} />
          </InputLabel>
        </Flex>
      </Paper>
      <h2>Buys</h2>
      <Table
        headers={["Broker", "Ticker", "Amount", "Units", "Date"]}
        values={buys.map((d) => [
          d.broker,
          d.ticker,
          d.amount,
          d.units,
          d.date,
        ])}
      />
      <h2>Dividends</h2>
      <Table
        headers={["Broker", "Ticker", "Amount", "Date"]}
        values={dividends.map((d) => [d.broker, d.ticker, d.amount, d.date])}
      />
    </SimpleGrid>
  );
};

export default PortfolioPage;
