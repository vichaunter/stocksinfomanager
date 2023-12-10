// @ts-nocheck
const { PrismaClient } = require("@prisma/client");
const seedData = require("./seedData");

const seed = async () => {
  const prisma = new PrismaClient();

  for (let i = 0; i < seedData.length; i++) {
    const ticker = seedData[i];

    let dbTicker = await prisma.ticker.findUnique({
      where: { symbol: ticker.symbol },
    });

    if (!dbTicker) {
      dbTicker = await prisma.ticker.create({
        data: { symbol: ticker.symbol },
      });
    }

    await prisma.tickerHandler.upsert({
      where: { tickerId: dbTicker.id },
      update: {
        handlers: { set: ticker.handlers },
      },
      create: {
        tickerId: dbTicker.id,
        handlers: { set: ticker.handlers },
      },
    });
  }

  return seedData[0].handlers;
};

console.log(seed());
