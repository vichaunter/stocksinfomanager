const fs = require('fs');
const cheerio = require('cheerio');
const Papa = require('papaparse');
const moment = require('moment');
const puppeteer = require('puppeteer');
const yargs = require('yargs');

const ticker = yargs.argv._[0] || process.argv[2]


const contentToCsv = (htmlContent) => {
const $ = cheerio.load(htmlContent);

const rows = [];


$('table.dividend-history__table tbody tr').each((i, row) => {
  const rowData = [];
  $(row).find('th, td').each((j, cell) => {
    rowData.push($(cell).text().trim());
  });

  // Format dates from mm/dd/yyyy to dd/mm/yyyy
  const dateColumns = [0, 3, 4, 5]; 
  dateColumns.forEach(colIndex => {
    rowData[colIndex] = moment(rowData[colIndex], 'MM/DD/YYYY').format('DD/MM/YYYY');
  });

  rowData[2] = rowData[2].replace('$', '').replace('.', ',');

  rows.push(rowData);
});

const csvData = Papa.unparse(rows, { delimiter: '\t' });

fs.writeFileSync('output.csv', csvData, 'utf8');

console.log('CSV file successfully written!');
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
}

const url = `https://www.nasdaq.com/market-activity/stocks/${ticker}/dividend-history`; 
getRenderedPageSource(url)
  .then((source) => {
    contentToCsv(source); 
  })
  .catch((error) => {
    console.error('Error:', error);
  });