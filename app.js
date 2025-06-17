import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

// Add Stealth plugin to Puppeteer
puppeteer.use(StealthPlugin());

// List of companies with Moneycontrol-specific details
const companies = [
  { name: "Reliance Industries Limited", ticker: "RI", company_name: "relianceindustries", sector: "refineries" },
  { name: "Tata Consultancy Services Limited", ticker: "TCS", company_name: "tataconsultancyservices", sector: "computers-software" },
  { name: "Infosys Limited", ticker: "IT", company_name: "infosys", sector: "computers-software" },
  { name: "HDFC Bank Limited", ticker: "HDF01", company_name: "hdfcbank", sector: "banks-private-sector" },
  { name: "ICICI Bank Limited", ticker: "ICI02", company_name: "icicibank", sector: "banks-private-sector" },
  { name: "Hindustan Unilever Limited", ticker: "HU", company_name: "hindustanunilever", sector: "personal-care" },
  { name: "State Bank of India", ticker: "SBI", company_name: "statebankindia", sector: "banks-public-sector" },
  { name: "Kotak Mahindra Bank Limited", ticker: "KMB", company_name: "kotakmahindrabank", sector: "banks-private-sector" },
  { name: "ITC Limited", ticker: "ITC", company_name: "itc", sector: "diversified" },
  { name: "Larsen & Toubro Limited", ticker: "LT", company_name: "larsentoubro", sector: "infrastructure-general" }
];

// Function to scrape SWOT counts from the main company page
async function getSWOTCounts(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log(`Navigated to company page: ${url}`);
    const content = await page.content();
    const $ = cheerio.load(content);
    const swotElements = $('ul.clearfix li.swotliClass a strong');

    if (swotElements.length >= 4) {
      return {
        strengths: parseInt(swotElements.eq(0).text().match(/\((\d+)\)/)?.[1] || 0),
        weaknesses: parseInt(swotElements.eq(1).text().match(/\((\d+)\)/)?.[1] || 0),
        opportunities: parseInt(swotElements.eq(2).text().match(/\((\d+)\)/)?.[1] || 0),
        threats: parseInt(swotElements.eq(3).text().match(/\((\d+)\)/)?.[1] || 0)
      };
    } else {
      console.log(`Insufficient SWOT elements found for ${url}`);
      return { strengths: 0, weaknesses: 0, opportunities: 0, threats: 0 };
    }
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error.message);
    return { strengths: 0, weaknesses: 0, opportunities: 0, threats: 0 };
  }
}

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main scraping function
async function scrapeData() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });
  const page = await browser.newPage();

  // Set a realistic user agent
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
  await page.setUserAgent(userAgent);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });
  console.log('Set user agent and headers');

  // Navigate to Moneycontrol homepage
  try {
    await page.goto('https://www.moneycontrol.com', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Navigated to Moneycontrol homepage');
  } catch (error) {
    console.error('Try again, Failed to load homepage:', error.message);
    await browser.close();
    return [];
  }

  // Click the "Log-in" link to open the modal
  try {
    await page.evaluate(() => {
      const element = document.querySelector('div.log_signup a.linkSignIn');
      if (element) element.click();
    });
    console.log('Clicked Log-in link');
  } catch (error) {
    console.error('Failed to click login link:', error.message);
    await browser.close();
    return [];
  }

  await delay(5000); // Wait for modal to appear

  // Interact with the login modal and iframe
  try {
    // Wait for the modal
    await page.waitForSelector('#LoginModal', { timeout: 30000 });
    console.log('Login modal appeared');

    // Access the iframe
    const frameHandle = await page.$('iframe#myframe');
    if (!frameHandle) {
      console.error('Iframe handle not found');
      await browser.close();
      return [];
    }
    const frame = await frameHandle.contentFrame();
    if (!frame) {
      console.error('Failed to access iframe content');
      await browser.close();
      return [];
    }
    console.log('Accessed iframe content');

    // Fill out the login form and submit
    const loginResult = await frame.evaluate((username, password) => {
      try {
        // Find the form
        const form = document.querySelector('form.login_form');
        if (!form) {
          return { success: false, reason: 'Login form not found' };
        }
        console.log('Login form found in iframe');

        // Fill email field
        const emailInput = form.querySelector('input[name="email"]');
        if (!emailInput) {
          return { success: false, reason: 'Email input not found' };
        }
        emailInput.value = username;

        // Fill password field
        const passwordInput = form.querySelector('input[name="pwd"]');
        if (!passwordInput) {
          return { success: false, reason: 'Password input not found' };
        }
        passwordInput.value = password;

        // Click the login button
        const loginButton = form.querySelector('button.login_verify_btn');
        if (!loginButton) {
          return { success: false, reason: 'Login button not found' };
        }
        loginButton.classList.remove('disable');
        loginButton.removeAttribute('disabled');
        loginButton.click();

        return { success: true };
      } catch (error) {
        return { success: false, reason: `Error in iframe evaluation: ${error.message}` };
      }
    }, process.env.MC_USERNAME || '8320504721', process.env.MC_PASSWORD || 'Moneycontrol@1408');

    if (!loginResult.success) {
      console.error('Login form interaction failed in iframe:', loginResult.reason);
      await browser.close();
      return [];
    }

    console.log('Filled login form and submitted');

    // Wait for login to complete
    await delay(10000);
    console.log('Login process completed');
  } catch (error) {
    console.error('Login failed:', error.message);
    await browser.close();
    return [];
  }

  // Proceed with scraping
  const data = [];
  for (const company of companies) {
    const mainUrl = `https://www.moneycontrol.com/india/stockpricequote/${company.sector}/${company.company_name}/${company.ticker}`;
    const swotData = await getSWOTCounts(page, mainUrl);

    data.push({
      name: company.name,
      strengths: swotData.strengths,
      weaknesses: swotData.weaknesses,
      opportunities: swotData.opportunities,
      threats: swotData.threats,
      timestamp: new Date().toISOString()
    });
  }

  await browser.close();
  return data;
}

// Function to store data in Google Sheet
async function storeInGoogleSheet(data) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID not set in .env');
    }
    const range = 'Sheet1!A1';

    const values = [
      ['Name', 'Strengths', 'Weaknesses', 'Opportunities', 'Threats', 'Timestamp'],
      ...data.map(d => [d.name, d.strengths, d.weaknesses, d.opportunities, d.threats, d.timestamp])
    ];

    const request = {
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values }
    };

    await sheets.spreadsheets.values.update(request);
    console.log('Data updated in Google Sheet');
  } catch (error) {
    console.error('Error updating Google Sheet:', error.message);
  }
}


// Run the script
async function main() {
  const scrapedData = await scrapeData();
  if (scrapedData.length > 0) {
    await storeInGoogleSheet(scrapedData);
  } else {
    console.log('No data scraped due to login or other issues.');
  }
};

main();