import { gql } from "@apollo/client";
import { TickerFragment } from "../queries/tickersQuery";

export const MUTATION_UPDATE_TICKER = gql`
  mutation UpdateTicker($symbol: String!) {
    updateTicker(symbol: $symbol) {
      ...TickerFragment
    }
  }
  ${TickerFragment}
`;

export const MUTATION_LOCAL_FAVORITE_TOGGLE = gql`
  mutation LocalFavoriteToggle($symbol: String!) {
    toggleLocalFavorite(symbol: $symbol) @client {
      symbol
    }
  }
`;
