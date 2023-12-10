import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import db from "./database";

const restLink = new HttpLink({ uri: "http://192.168.0.105:4000/graphql" });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: restLink,
  connectToDevTools: true,
  resolvers: {
    Query: {
      localFavorites: async () => {
        return await db.favorites.toArray();
      },
    },
    Mutation: {
      toggleLocalFavorite: async (_, { symbol }) => {
        if (typeof symbol !== "string") {
          throw new Error("Invalid symbol type. Symbol must be a string.");
        }

        const existing = await db.favorites.get(symbol);

        if (existing) {
          db.favorites.delete(symbol);
        } else {
          db.favorites.add({ symbol });
        }
      },
    },
  },
});

export default {
  client,
};
