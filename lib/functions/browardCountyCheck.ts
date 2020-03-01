const chromium = require('chrome-aws-lambda');

export const browardCountyCDLCheck = async (dlNumber : string): Promise<any>  => {
    // DL number requried to not include dashes
    const browardDlUrl = `https://www.browardclerk.org/Clerkwebsite/BCCOC2/Pubsearch/dl_stat_verif.aspx?DRVNUM=${dlNumber}&iAction=1&go=no&shopperID=&sGo=yes`;
    let browser;
try {
     browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.puppeteer.defaultViewport,
      executablePath: await chromium.puppeteer.executablePath,
      headless: chromium.headless,
    });

    let page = await browser.newPage();
    await page.goto(browardDlUrl);
    const reportTableSelector = '.pmain_entry > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1)';
    await page.waitForSelector(reportTableSelector);
    
    const innerText = await page.$eval(reportTableSelector, e => e.innerText);
    const innerHTML = await page.$eval(reportTableSelector, e => e.innerHTML);
    // TODO? pass screenshot back to twilio cost 0.02 to send per message
    // const screenshot = await page.screenshot();
    await browser.close();
    return {
        sendReport : true,
        innerHTML,
        innerText,
        // screenshot

    };

} catch (error) {
    await browser.close();
    throw error;
  }
}

