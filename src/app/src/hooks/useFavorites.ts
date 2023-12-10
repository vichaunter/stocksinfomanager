import { useMutation, useQuery } from "@apollo/client";
import { QUERY_LOCAL_FAVORITES } from "../api/queries/tickersQuery";
import { MUTATION_LOCAL_FAVORITE_TOGGLE } from "../api/mutations/tickersMutation";

const useFavorites = () => {
  const {
    loading: loadingFavorites,
    error: errorFavorites,
    data: favorites,
    refetch,
  } = useQuery(QUERY_LOCAL_FAVORITES);

  const [toggle] = useMutation(MUTATION_LOCAL_FAVORITE_TOGGLE);

  const toggleFavorite = async (symbol: string) => {
    await toggle({ variables: { symbol } });
    refetch();
  };

  return {
    loadingFavorites,
    errorFavorites,
    toggleFavorite,
    favorites,
  };
};

export default useFavorites;
