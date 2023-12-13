import { useQuery } from "@apollo/client";
import {
  ActionIcon,
  Flex,
  InputLabel,
  NumberFormatter,
  NumberInput,
  Table,
  TextInput,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import {
  ApiTicker,
  ApiTickers,
  QUERY_TICKERS,
} from "../../api/queries/tickersQuery";
import useFakePortfolioStore from "../../store/useFakePortfolioStore";
import NumberCurrency from "../text/NumberCurrency";

const FakeTickerForm = ({}) => {
  const [ticker, setTicker] = useState("");
  const [units, setUnits] = useState<number>(0);
  const addLine = useFakePortfolioStore((state) => state.addLine);

  const { loading, data, refetch } = useQuery<{ tickers: ApiTickers }>(
    QUERY_TICKERS,
    {
      variables: {
        tickers: [ticker],
      },
      fetchPolicy: "cache-first",
    }
  );

  useEffect(() => {
    !!ticker &&
      refetch({
        tickers: [ticker, "UNDEFINED"], //trick to force exact match in api
      });
  }, [ticker]);

  const handleOnChangeTicker = (e: ChangeEvent<HTMLInputElement>) => {
    setTicker(e.target.value.toUpperCase());
  };

  const handleOnChangeUnits = (value: string | number) => {
    const parsedValue = parseInt(value as any);
    if (isNaN(parsedValue) || parsedValue < 0) return;

    setUnits(parsedValue);
  };

  const handleOnSelectTicker = (ticker: ApiTicker) => {
    if (!ticker.price || units < 0) return;

    addLine({
      ticker: ticker.symbol,
      amount: ticker.price * units,
      broker: "fake" as any,
      currency: "USD",
      date: dayjs().format(),
      units: units,
    });
  };

  const tableData =
    !!ticker &&
    data?.tickers?.map((ticker) => {
      return [
        ticker.symbol,
        <NumberCurrency value={ticker.price} />,
        <NumberCurrency
          value={ticker.dividendYield}
          suffix="%"
          prefix={false}
        />,
        <ActionIcon variant="transparent" color="green" size="xl" radius="md">
          <IconCheck onClick={() => handleOnSelectTicker(ticker)} />
        </ActionIcon>,
      ];
    });

  return (
    <>
      <Flex justify={"space-between"} mb={40} align="end">
        <InputLabel>
          Ticker:
          <TextInput value={ticker} onChange={handleOnChangeTicker} />
        </InputLabel>
        <InputLabel>
          Units:
          <NumberInput value={units} onChange={handleOnChangeUnits} />
        </InputLabel>
      </Flex>
      {!ticker && loading ? (
        <>Loading...</>
      ) : (
        <Table
          striped
          data={{
            head: ["symbol", "price", "Div Yield", "actions"],
            body: (!!ticker && tableData) || [],
          }}
        />
      )}
    </>
  );
};

export default FakeTickerForm;
