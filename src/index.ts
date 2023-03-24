import { ScrapyUtil } from './ScrapyUtil';

async function main() {
  //Instantiate a new ScraperUtil
  const scraper = new ScrapyUtil(
    'https://www.entrepreneur.com/',
    'table[class="w-full bg-white shadow overflow-hidden sm:rounded-md table-fixed"]',
  );

  await scraper.getHtmlAndSaveLocally(
    '/franchises/directory/fastest-growing-ranking',
  );
}

main();
