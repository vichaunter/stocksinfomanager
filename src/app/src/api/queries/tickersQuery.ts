import { gql } from "@apollo/client";

export const TickerFragment = gql`
  fragment TickerFragment on Ticker {
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
`;

export const QUERY_TICKER = gql`
  query Tickers($symbol: String!) {
    ticker(symbol: $symbol) {
      ...TickerFragment
    }
  }
  ${TickerFragment}
`;

export type ApiTickersFilters = {
  tickers?: string | string[];
  withPrice?: boolean;
  withDividend?: boolean;
  maxDivYield?: number;
  minDivYield?: number;
};

export const QUERY_TICKERS = gql`
  query Tickers(
    $tickers: [String]
    $withPrice: Boolean
    $minDivYield: Float
    $maxDivYield: Float
    $withDividend: Boolean
  ) {
    tickers(
      tickers: $tickers
      withPrice: $withPrice
      minDivYield: $minDivYield
      maxDivYield: $maxDivYield
      withDividend: $withDividend
    ) {
      ...TickerFragment
    }
  }
  ${TickerFragment}
`;

export const QUERY_TICKER_TO_UPDATE = gql`
  query GetTickerToUpdate {
    nextTickerToUpdate {
      ...TickerFragment
    }
  }
  ${TickerFragment}
`;

export const QUERY_LOCAL_FAVORITES = gql`
  query {
    localFavorites @client
  }
`;

export type ApiTicker = {
  id: string;
  symbol: string;
  price?: number;
  name?: string;
  payDividend?: boolean;
  dividendYield?: number;
  dividendAnnualPayout?: number;
  dividendPayoutRatio?: number;
  dividend5YearGrowhthRate?: number;
  dividendYearsGrowhth?: number;
  dividendAmount?: number;
  dividendExDate?: string;
  dividendPayoutDate?: string;
  dividendRecordDate?: string;
  dividendDeclareDate?: string;
  dividendFrequency?: string;
  nextExDate?: string;
  nextPayDate?: string;
  error?: string;
  updatedAt?: string;
};

export type ApiTickers = ApiTicker[];
