//@ts-nocheck
import ScraperError from "../../../errors/scraperError";
import finviz from "./finviz";

describe("finviz", () => {
  it("should load default handler", async () => {
    const symbol = "VZ";
    const str = await finviz.defaultHandler(symbol);

    expect(str).toEqual(finviz.tickerUrl(symbol));
  }, 30000);

  it("should throw error for invalid symbol data", async () => {
    const testFunction = async () => {
      await finviz.defaultHandler("VZZZ");
    };

    await expect(testFunction()).rejects.toThrow(ScraperError);
  }, 30000);
});
