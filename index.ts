import { writeFile } from 'fs/promises';

async function fetchSitemap(): Promise<string> {
  const response = await fetch('https://www.index.hr/sitemap.xml');
  return response.text();
}

async function fetchDataFromURL(url: string): Promise<string> {
  const response = await fetch(url);
  const body: string = await response.text();
  return body;
}

async function generateFilteredPages(): Promise<string[]> {
  const keywordRegex = /\b(osijek|osječki)\b/i;
  const filteredPages = [];

  try {
    const sitemap = await fetchSitemap();
    const regex = /<sitemap>\s*<loc>(.*?)<\/loc>\s*<\/sitemap>/g;

    const results: RegExpMatchArray[] = [...sitemap.matchAll(regex)];
    
    for (const match of results) {
        const cleanedURL = match[1].replace(/&amp;/g, '&');
        const pageContent = await fetchDataFromURL(cleanedURL);
    
        if (keywordRegex.test(pageContent)) {
            filteredPages.push(cleanedURL);
        }
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return filteredPages;
}

const XML_HEADER = `<?xml version='1.0' encoding='UTF-8'?>\n<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
const XML_FOOTER = `</urlset>`;

function generateSitemapXML(links: string[]): string {
  let linksXml = '';
  links.forEach(link => {
    linksXml += createListElement(link);
  });

  return XML_HEADER + linksXml + XML_FOOTER;
}

function createListElement(text: string) {
  return `<url><loc>${text}</loc></url>\n`;
}

async function saveToFile(text: string, path: string) {
  try {
    await writeFile(path, text);
    console.log('File written successfully');
  } catch (error) {
    console.error(error);
  }
}

generateFilteredPages().then(links => {
  const xml = generateSitemapXML(links);
  saveToFile(xml, './output.xml');
});
