const typeDefs = `#graphql
    scalar JSON
    scalar Void

    type Error {
        error: String!
    }

    type Task {
        url: String!
    }

    union TaskResult = Task | Error

    type Ticker { 
        id:         String
        symbol:     String
        price:      Float
        name:       String
        sector:       String
        industry:       String
        payDividend: Boolean
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
        dividendLastYearsPayingCount: Float
        nextExDate: String
        nextPayDate: String
        error:      JSON
        updatedAt:  String
    }

    type TickerRaw {
        finviz: JSON
        nasdaq: JSON
        seekingalpha: JSON
    }

    type Query {
        ticker(symbol: String!): Ticker!
        tickers(
            tickers: [String],
            withPrice: Boolean, 
            minDivYield: Float, 
            maxDivYield: Float,
            withDividend: Boolean
          ): [Ticker]
        rawTicker(symbol: String!) : TickerRaw
        nextTickerToUpdate: Ticker
        task(scraperId: String!): TaskResult
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
        updateAllFromRaw: JSON
        setTaskSource(scraperId: String!, url: String!, source: String!): Void
    }

`;

export default typeDefs;
