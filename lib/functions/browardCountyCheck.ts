// const chromium = require('chrome-aws-lambda');

const puppeteer = require('puppeteer');

export const browardCountyCDLCheck = async (dlNumber : string): Promise<string>  => {

    // DL number requried to not include dashes
const browardDlUrl = 'https://www.browardclerk.org/Clerkwebsite/BCCOC2/Pubsearch/dl_stat_verif.aspx?DRVNUM='+dlNumber;
try {
    const browser = await puppeteer.launch({
    //   args: chromium.args,
    //   defaultViewport: puppeteer.defaultViewport,
    //   executablePath: await puppeteer.executablePath,
    //   headless: chromium.headless,
    headless: false
    });

    let page = await browser.newPage();
    await page.goto(browardDlUrl);

    await page.waitForElement(".pmain_entry");
    const reportTable = await page.$('.pmain_entry > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1)');
    console.dir(reportTable);
    console.dir(reportTable.innerHTML);
    return reportTable.innerText;
  } catch (error) {
    throw error;
  }
}

