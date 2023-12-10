const fs = require('fs');
const cheerio = require('cheerio');
const Papa = require('papaparse');
const moment = require('moment');
const puppeteer = require('puppeteer');
const yargs = require('yargs');
const {tickers} = require('./finviz/tickers')

// const ticker = yargs.argv._[0] || process.argv[2]


const contentToCsv = async (htmlContent, ticker) => {
const $ = cheerio.load(htmlContent);

  const rows = [];
  const mapped = {}
  $('.snapshot-table-wrapper table  tr').each((i, row) => {
    const rowData = [];
    $(row).find('td').each((j, cell) => {
      rowData.push($(cell).text().trim());
    });

    for(let i = 0; i < rowData.length; i+=2){
        mapped[rowData[i]] = rowData[i+1]
    }
    rows.push(rowData);
  });

  fs.writeFileSync(`finviz/${ticker}.json`, JSON.stringify(mapped), 'utf8');

  console.log('CSV file successfully written!');
  return true
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getRenderedPageSource(url) {
  const browser = await puppeteer.launch({ headless: false }); // Set headless to false

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const pageSource = await page.content();

    return pageSource;
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close();
  }

  return true
}

const downloadTicker = async (ticker) => {
  const url = `https://finviz.com/quote.ashx?t=${ticker}`; 
  const source = await getRenderedPageSource(url)
  await contentToCsv(source, ticker)
}

const init = async () => {
  for(let i = 0; i < tickers.length; i++){
    await downloadTicker(tickers[i])
  }
}

init()