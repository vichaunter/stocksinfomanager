import { SimpleGrid } from "@mantine/core";
import _ from "lodash";
import Table from "../components/tables/Table";
import usePortfolioStore from "../store/usePortfolioStore";
import PortfolioEditor from "./Portfolio/PortfolioEditor";
import PortfolioTotals from "./Portfolio/PortfolioTotals";
import useFakePortfolioStore from "../store/useFakePortfolioStore";

const PortfolioPage = () => {
  const portfolio = usePortfolioStore((state) => state.portfolio);
  const buys = usePortfolioStore((state) => state.buys);
  const dividends = usePortfolioStore((state) => state.dividends);

  const fakeBuys = useFakePortfolioStore((state) => state.lines);
  const fakePortfolio = useFakePortfolioStore((state) => state.portfolio);

  return (
    <SimpleGrid>
      <h2>Portfolio</h2>
      {portfolio && (
        <PortfolioTotals
          totals={[...portfolio, ...fakePortfolio]}
          buys={_.compact([...buys, ...fakeBuys])}
          dividends={_.compact(dividends)}
        />
      )}

      <PortfolioEditor />

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
