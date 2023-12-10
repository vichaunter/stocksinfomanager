import Dexie from "dexie";

interface Favorites {
  symbol: string;
}

class LocalDatabase extends Dexie {
  favorites: Dexie.Table<Favorites, string>;

  constructor() {
    super("LocalDatabase");

    // Define the schema
    this.version(1).stores({
      favorites: "symbol",
    });

    this.favorites = this.table("favorites");
  }
}

const db = new LocalDatabase();

export default db;
