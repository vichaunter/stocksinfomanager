import { gql } from "@apollo/client";

export const MUTATION_UPDATE_TICKER = gql`
  mutation UpdateTicker($symbol: String!) {
    updateTicker(symbol: $symbol) {
      id
      symbol
      price
      name
      payDividend
      dividendYield
      dividendAnnualPayout
      dividendPayoutRatio
      dividend5YearGrowhthRate
      dividendYearsGrowhth
      dividendAmount
      dividendExDate
      dividendPayoutDate
      dividendRecordDate
      dividendDeclareDate
      dividendFrequency
      nextExDate
      nextPayDate
      error
      updatedAt
    }
  }
`;

export const MUTATION_LOCAL_FAVORITE_TOGGLE = gql`
  mutation LocalFavoriteToggle($symbol: String!) {
    toggleLocalFavorite(symbol: $symbol) @client {
      symbol
    }
  }
`;
