//@ts-nocheck
import ScraperError from "../../../errors/scraperError";
import nasdaqfinancials from "./nasdaqfinancials";

describe("nasdaqfinancials", () => {
  it("should load default handler", async () => {
    const symbol = "VZ";
    const str = await nasdaqfinancials.defaultHandler(symbol);

    expect(str).toEqual(nasdaqfinancials.tickerUrl(symbol));
  }, 30000);

  it.skip("should throw error for invalid symbol data", async () => {
    const testFunction = async () => {
      await nasdaqfinancials.defaultHandler("VZZZ");
    };

    await expect(testFunction()).rejects.toThrow(ScraperError);
  }, 30000);
});
