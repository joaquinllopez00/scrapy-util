import axios from 'axios';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

//Make a class
export class ScrapyUtil {
  baseUrl: string;
  dataAnchorTag: string;
  constructor(url: string, anchorTag: string) {
    this.baseUrl = url;
    this.dataAnchorTag = anchorTag;
  }

  async getHtmlAndSaveLocally(url: string): Promise<string> {
    const response = await axios.get(`${this.baseUrl}${url}`);

    const rawHtml = response.data;

    //save the corresponding html to a file
    //using the current date appended to the url as the filename
    const filename = `/${url.replace(/\//g, '-')}-${Date.now()}.html`;

    //Check if the directory exists
    await this.checkForDirectory(filename);

    await this.saveRawHtml(filename, rawHtml);
    const cleanedHtml = await this.saveCleanedHtml(filename, rawHtml);

    //If the dataAnchorTag is present, then saveDataAnchorTagHtml
    if (this.dataAnchorTag) {
      await this.saveDataAnchorTagHtml(filename, cleanedHtml);
    }

    return 'Data was saved!';
  }

  async getHtmls(urls: string[]) {
    const promises = urls.map((url) => this.getHtmlAndSaveLocally(url));
    return Promise.all(promises);
  }

  //Checks for the directory of a given file name, and creates it if it doesn't exist.
  //It also creates the scraped-data directory if it doesn't exist
  async checkForDirectory(fileName: string) {
    //Get filename without filetype
    const fileNameWithoutFileType = fileName.split('.')[0];

    //Checkl for scraped-data directory and create it if it doesn't exist
    if (!fs.existsSync(`${__dirname}/scraped-data`)) {
      fs.mkdirSync(`${__dirname}/scraped-data`);
    }

    //Create the directory if it doesn't exist
    if (!fs.existsSync(`${__dirname}/scraped-data${fileNameWithoutFileType}`)) {
      fs.mkdirSync(`${__dirname}/scraped-data${fileNameWithoutFileType}`);
    }
  }

  async saveRawHtml(fileName: string, html: string) {
    //Get filename without filetype
    const fileNameWithoutFileType = fileName.split('.')[0];

    //Construct the filename(s)
    const fullRawFilePath = `${__dirname}/scraped-data${fileNameWithoutFileType}/${
      'RAW' + '-' + fileName.substring(1)
    }`;

    fs.writeFile(fullRawFilePath, html, (err) => {
      if (err) throw err;
      return `Raw File has been saved at ${fullRawFilePath}`;
    });

    return html;
  }

  async saveCleanedHtml(fileName: string, html: string) {
    //Get filename without filetype
    const fileNameWithoutFileType = fileName.split('.')[0];

    //Construct the filename(s)
    const fullCleanedFilePath = `${__dirname}/scraped-data/${fileNameWithoutFileType}/${
      'CLEAN' + '-' + fileName.substring(1)
    }`;

    //Clean the html
    const cleanedHtml: string = this.cleanHtml(html, 'body');

    //Save the cleaned html
    fs.writeFile(fullCleanedFilePath, cleanedHtml, (err) => {
      if (err) throw err;
      return `Cleaned file has been saved at ${fullCleanedFilePath}`;
    });

    return cleanedHtml;
  }

  async saveDataAnchorTagHtml(fileName: string, html: string) {
    //Get filename without filetype
    const fileNameWithoutFileType = fileName.split('.')[0];

    //Construct the filename(s)
    const fullCleanedFilePath = `${__dirname}/scraped-data/${fileNameWithoutFileType}/${
      'TAG' + '-' + fileName.substring(1)
    }`;

    //Clean the html
    const cleanedHtml: string = this.cleanHtml(html, this.dataAnchorTag);
    // console.log(cleanedHtml);
    //Save the cleaned html
    fs.writeFile(fullCleanedFilePath, cleanedHtml, (err) => {
      if (err) throw err;
      return `Cleaned file has been saved at ${fullCleanedFilePath}`;
    });
  }

  cleanHtml(html: string, tag: string): string {
    //Removes everything outside of tags of an html document
    const $: any = cheerio.load(html);

    //Get all occurances of tag and append array
    const tagElementsArr: string[] = [];
    $(tag).each((i: number, el: string) => tagElementsArr.push($(el).html()));

    const htmlInTags: string = tagElementsArr.join('');

    //Remove all script tags
    const cleanedHtml: string = htmlInTags.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      '',
    );

    return cleanedHtml;
  }

  setDataAnchorTag(dataAnchorTag: string): void {
    this.dataAnchorTag = dataAnchorTag;
  }
}
