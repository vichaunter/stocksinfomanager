const typeDefs = `#graphql
    scalar JSON

    type Ticker { 
        id:         String
        symbol:     String
        price:      Float
        dividendYield: Float
        dividendAnnualPayout: Float
        dividendPayoutRatio: Float
        dividend5YearGrowhthRate: Float
        dividendYearsGrowhth: Float
        dividendAmount: Float
        dividendExDate: String
        dividendPayoutDate: String
        dividendRecordDate: String
        dividendDeclareDate: String
        dividendFrequency: String
        nextExDate: String
        nextPayDate: String
        error:      JSON
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

    type TickerRaw {
        finviz: JSON
        nasdaq: JSON
        seekingalpha: JSON
    }

    type Query {
        ticker(symbol: String!): Ticker!
        tickers: [Ticker]
        rawTicker(symbol: String!) : TickerRaw
    }

    input TickerInput {
        id:         String
        symbol:     String
        error:      String
        updatedAt:  String
    }

    type Mutation {
        createTicker(symbol: String!) : Ticker
        updateTicker(symbol: String!) : Ticker
    }

`;

export default typeDefs;
