import { useMutation } from "@apollo/client";
import { MUTATION_UPDATE_TICKER } from "../api/mutations/tickersMutation";
import { ApiTicker } from "../api/queries/tickersQuery";
import { useState } from "react";

const useUpdateTicker = () => {
  const [symbol, setSymbol] = useState("");
  const [updateTicker, { loading, error }] = useMutation<
    ApiTicker,
    { symbol: string }
  >(MUTATION_UPDATE_TICKER);

  const handleOnUpdateTicker = (symbol: ApiTicker["symbol"]) => {
    setSymbol(symbol);

    return updateTicker({
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
