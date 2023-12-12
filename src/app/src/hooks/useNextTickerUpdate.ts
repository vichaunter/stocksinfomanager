import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { QUERY_TICKER_TO_UPDATE, ApiTicker } from "../api/queries/tickersQuery";

const useNextTickerUpdate = () => {
  const [autoUpdating, setAutoUpdating] = useState(false);

  const [_, { loading, error, data, refetch }] = useLazyQuery<{
    nextTickerToUpdate: ApiTicker;
  }>(QUERY_TICKER_TO_UPDATE);

  useEffect(() => {
    autoUpdating && autoUpdate();
  }, [autoUpdating]);

  const handleOnUpdateTicker = async () => {
    if (loading) return;

    return refetch();
  };

  const autoUpdate = async () => {
    if (autoUpdating) {
      await handleOnUpdateTicker();
      autoUpdate();
    }
  };

  const handleStartAutoUpdate = () => {
    setAutoUpdating(true);
  };

  const handleStopAutoUpdate = () => setAutoUpdating(false);

  return {
    update: handleOnUpdateTicker,
    autoUpdating,
    startAutoUpdate: handleStartAutoUpdate,
    stopAutoUpdate: handleStopAutoUpdate,
    loading,
    error,
    data,
  };
};

export default useNextTickerUpdate;
