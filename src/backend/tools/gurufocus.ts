const puppeteer = require("puppeteer");
import getSystemLocale from "system-locale";

async function run() {
  const locale = await getSystemLocale();

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", `--lang=${locale}`],
  });
  const page = await browser.newPage();

  // capture background requests:
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    if (request.resourceType() == 'image') {
     await request.abort()
    } else {
     await request.continue()
    }
   })
  // capture background responses:
  page.on("response", async (response) => {
    const request = response.request()
    if (request.url().includes('stock_list')) {
      console.log(await response.text());
    }
  });

  await page.goto("https://www.gurufocus.com/stocks")

  await page.waitForSelector(".aio-tabs-button.el-popover__reference");
  await page.click(".aio-tabs-button.el-popover__reference");

  await page.waitForSelector(`//div[@class='item' and text()='200']`, { visible: true })
  // await page.waitForSelector('.item:has-text("200")', { visible: true });
  await page.click(`//div[@class='item' and text()='200']`)
  
  // await browser.close();
}

run();
