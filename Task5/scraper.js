const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
async function scrape(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    try {
        await page.waitForSelector('.s-result-list > div[data-component-type="s-search-result"]');
        const productContainers = await page.$$('.s-result-list > div[data-component-type="s-search-result"]');
        let products = [];
        for (const container of productContainers) {
            const productNameSelector = 'h2 > a > span';
            const priceSelector = 'span.a-price > span.a-offscreen';
            const ratingSelector = 'span.a-icon-alt';
            const productNameElement = await container.$(productNameSelector);
            const priceElement = await container.$(priceSelector);
            const ratingElement = await container.$(ratingSelector);
            if (productNameElement && priceElement && ratingElement) {
                const productName = await page.evaluate(element => element.textContent.trim(), productNameElement);
                const price = await page.evaluate(element => element.textContent.trim(), priceElement);
                const rating = await page.evaluate(element => element.textContent.trim(), ratingElement);
                products.push({ productName, price, rating });
                products.push({ productName: '', price: '', rating: '' });
            }
        }
        const csvWriter = createCsvWriter({
            path: 'products.csv',
            header: [
                { id: 'productName', title: 'Product Name' },
                { id: 'price', title: 'Price' },
                { id: 'rating', title: 'Rating' }
            ]
        });

        await csvWriter.writeRecords(products);
        console.log('Data stored in CSV file');

    } catch (error) {
        console.error('Error', error.message);
    } finally {
        await browser.close();
    }
}
scrape('https://www.amazon.in/s?k=mobiles&i=electronics&crid=1GB2BRDVN2RGV&sprefix=mobil%2Celectronics%2C316&ref=nb_sb_noss_2');