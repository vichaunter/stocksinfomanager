import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_TICKER } from "../api/mutations/tickersMutation";
import { Ticker } from "../api/queries/tickersQuery";
import { useState } from "react";

const useUpdateTicker = () => {
  const [symbol, setSymbol] = useState("");
  const [updateTicker, { loading, error }] = useMutation<
    Ticker,
    { symbol: string }
  >(MUTATION_UPDATE_TICKER);

  const handleOnUpdateTicker = (symbol: Ticker["symbol"]) => {
    setSymbol(symbol);

    updateTicker({
      variables: {
        symbol,
      },
    });
  };

  return {
    update: handleOnUpdateTicker,
    symbol,
    loading,
    error,
  };
};

export default useUpdateTicker;
