"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeDefs = `#graphql

    type Ticker { 
        id:         String
        symbol:     String
        tickerData: TickerData
        error:      String
        updatedAt:  String
    }

    type TickerData {
        id:                       String
        price:                    String
        dividend:                 String
        dividendYield:            String
        dividendAnnualized:       Float
        dividend5YearGrowhthRate: String
        dividendYearsGrowhth:     String
        dividendPayoutRatio:      String
        dividendFrequency:        String
        lastExDate:               String
        lastPayoutDate:           String
        nextPayDate:              String
        nextExDate:               String
    }

    type Query {
        ticker(symbol: String!): Ticker!
        tickers: [Ticker]
    }

`;
exports.default = typeDefs;
