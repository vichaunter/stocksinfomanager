import {
  Checkbox,
  CloseButton,
  Paper,
  SimpleGrid,
  TextInput,
  Tooltip,
} from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import { ApiTickersFilters } from "../api/queries/tickersQuery";
import useNextTickerUpdate from "../hooks/useNextTickerUpdate";
import TickersList from "./Tickers/TickersList";

dayjs.extend(relativeTime);

const TickersPage = () => {
  const [filters, setFilters] = useState<ApiTickersFilters>({
    withPrice: true,
    withDividend: true,
  });

  const {
    update: updateNextTicker,
    autoUpdating,
    startAutoUpdate,
    stopAutoUpdate,
  } = useNextTickerUpdate();

  const handleOnCheckboxFilter =
    (filterId: keyof ApiTickersFilters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterId]: event.target.checked,
      }));
    };

  const handleOnInputFilter =
    (filterId: keyof ApiTickersFilters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        [filterId]: event.target.value.toUpperCase().split(","),
      }));
    };

  return (
    <>
      <h2>Stocks list</h2>
      <Paper withBorder mb={10} p="md" radius="md">
        <button onClick={updateNextTicker}>Update next ticker</button>
        <button onClick={autoUpdating ? stopAutoUpdate : startAutoUpdate}>
          {autoUpdating ? "Stop" : "Start"} auto updating
        </button>
      </Paper>
      <Paper withBorder p="md" radius="md" mb={15}>
        <SimpleGrid cols={3}>
          <TextInput
            placeholder="...with symbol"
            value={filters.tickers ?? ""}
            onChange={handleOnInputFilter("tickers")}
            inputContainer={(children) => (
              <Tooltip
                label="Start writing to filter by symbol, separate multiple with comma (AAPL,MSFT,TSLA)"
                position="top-start"
              >
                {children}
              </Tooltip>
            )}
            rightSection={
              <CloseButton
                aria-label="Clear input"
                onClick={() => setFilters((prev) => ({ ...prev, tickers: "" }))}
                style={{ display: filters.tickers ? undefined : "none" }}
              />
            }
          />
          <Tooltip
            label="Show or hide stocks without found price"
            refProp="rootRef"
          >
            <Checkbox
              onChange={handleOnCheckboxFilter("withPrice")}
              label="With price"
              size="xs"
              checked={filters.withPrice}
            />
          </Tooltip>
          <Tooltip
            label="Show or hide stocks without found dividend"
            refProp="rootRef"
          >
            <Checkbox
              onChange={handleOnCheckboxFilter("withDividend")}
              label="With dividend"
              size="xs"
              defaultChecked
            />
          </Tooltip>
        </SimpleGrid>
      </Paper>
      <TickersList filters={filters} />
    </>
  );
};

export default TickersPage;
