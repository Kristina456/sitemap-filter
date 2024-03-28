import * as fs from 'fs';

async function fetchSitemapFilter(): Promise<string> {
    const response = await fetch('https://www.index.hr/sitemap.xml');
    return response.text();
}

async function fetchDataFromURL(url: string): Promise<string> {
    const response = await fetch(url);
    const body: string = await response.text();
    return body
}

async function main(): Promise<string[]> {
    const keywordRegex = /\b(osijek)\b/i;
    const filteredPages: string[] = [];

    try {
        const sitemap = await fetchSitemapFilter();
        const regex = /<sitemap>\s*<loc>(.*?)<\/loc>\s*<\/sitemap>/g;

        let match: RegExpExecArray | null;
        while ((match = regex.exec(sitemap)) !== null) {
            const cleanedURL = match[1].replace(/&amp;/g, '&');
            const pageContent = await fetchDataFromURL(cleanedURL);

            if (keywordRegex.test(pageContent)) {
                filteredPages.push(cleanedURL);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
    return filteredPages;
}

async function runMain() {
    const filteredPages = await main();
    return filteredPages;
}


const XML_HEADER = `<?xml version='1.0' encoding='UTF-8'?>\n<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
const XML_FOOTER = `</urlset>`;

function generateSitemapXML(links: string[]): string {

    let linksXml = '';
    links.forEach((link) => {
        linksXml += createListElement(link);
    });

    return XML_HEADER + linksXml + XML_FOOTER;
}

function createListElement(text: string) {
     return `<url><loc>${text}</loc></url>\n`;
}

function saveToFile(text: string, path: string) {
    fs.writeFile(path, text, (err: any) => {
        if (err) {
          console.error(err);
        } else {
            console.log('File written successfully');
        }
      });
}


runMain().then((links) => {

    const xml = generateSitemapXML(links);
    saveToFile(xml, './output.xml');


});