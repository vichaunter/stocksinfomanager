//@ts-nocheck
import ScraperError from "../../../errors/scraperError";
import seekingalpha from "./seekingalpha";

describe("seekingalpha", () => {
  it("should load default handler", async () => {
    const symbol = "VZ";
    const str = await seekingalpha.defaultHandler(symbol);

    expect(str).toEqual(seekingalpha.tickerUrl(symbol));
  }, 30000);

  it.skip("should throw error for invalid symbol data", async () => {
    const testFunction = async () => {
      await seekingalpha.defaultHandler("VZZZ");
    };

    await expect(testFunction()).rejects.toThrow(ScraperError);
  }, 30000);
});
