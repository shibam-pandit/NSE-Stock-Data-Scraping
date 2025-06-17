# Moneycontrol SWOT Scraper

## Overview

This project is a Node.js script that scrapes SWOT (Strengths, Weaknesses, Opportunities, Threats) data for a predefined list of companies from Moneycontrol.com. The script logs into Moneycontrol to access premium content, extracts SWOT counts for each company, and stores the data in a Google Sheet for analysis. It is designed for users with a Moneycontrol Pro subscription.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Companies Scraped](#companies-scraped)
- [Troubleshooting](#troubleshooting)
- [Potential Improvements](#potential-improvements)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Automated Login**: Logs into Moneycontrol using provided credentials to access premium SWOT data.
- **SWOT Data Extraction**: Scrapes SWOT counts for 10 major Indian companies.
- **Google Sheets Integration**: Stores the scraped data in a Google Sheet for easy access and analysis.
- **Error Handling**: Includes robust error handling and logging for debugging.

## Prerequisites

Before running the script, ensure you have the following:

- Node.js (v18 or higher) installed on your system. [Download Node.js](https://nodejs.org/).
- A Moneycontrol Pro account (required to access SWOT data).
- A Google Cloud project with the Google Sheets API enabled and a service account key.
- A Google Sheet shared with the service account email (with Editor access).

## Installation

1. **Clone the Repository** (or download the script files):
   ```bash
   git clone https://github.com/your-username/moneycontrol-swot-scraper.git
   cd moneycontrol-swot-scraper
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   This will install the required packages: puppeteer-extra, puppeteer-extra-plugin-stealth, cheerio, googleapis, and dotenv.

3. **Set Up Environment Variables**:
   - Create a `.env` file in the project root:
     ```bash
     touch .env
     ```
   - Add the following variables to the `.env` file:
     ```
     MC_USERNAME=your-moneycontrol-username
     MC_PASSWORD=your-moneycontrol-password
     SPREADSHEET_ID=your-google-sheet-id
     ```
     - `MC_USERNAME` and `MC_PASSWORD`: Your Moneycontrol Pro login credentials.
     - `SPREADSHEET_ID`: The ID of your Google Sheet (found in the URL: https://docs.google.com/spreadsheets/d/\<SPREADSHEET_ID>/edit).

4. **Set Up Google Sheets API**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.
   - Enable the Google Sheets API under "APIs & Services > Library".
   - Create a service account under "APIs & Services > Credentials":
     - Select "Service Account", fill in the details, and create.
     - Generate a JSON key for the service account and download it.
     - Rename the JSON key file to `service-account-key.json` and place it in the project root.
   - Share your Google Sheet with the service account email (found in `service-account-key.json` under `client_email`) with Editor access.

## Usage

1. **Run the Script**:
   ```bash
   node app.js
   ```
   The script will:
   - Log into Moneycontrol using the provided credentials.
   - Scrape SWOT data for the listed companies.
   - Store the data in the specified Google Sheet.

2. **Check the Output**:
   - Open your Google Sheet to view the scraped data. It will look like:

     | Name | Strengths | Weaknesses | Opportunities | Threats | Timestamp |
     |------|-----------|------------|--------------|---------|-----------|
     | Reliance Industries Limited | 5 | 2 | 4 | 3 | 2025-06-16T18:26:00.000Z |
     | Tata Consultancy Services | 6 | 1 | 5 | 2 | 2025-06-16T18:26:00.000Z |
     | ... | ... | ... | ... | ... | ... |

     Note: Values depend on actual SWOT data; timestamps are in UTC, 5:30 hours behind IST.

3. **Monitor Logs**:
   - The script logs key steps to the console for debugging:
     - Set user agent and headers
     - Navigated to Moneycontrol homepage
     - Clicked Log-in link
     - Login modal appeared
     - Accessed iframe content
     - Filled login form and submitted
     - Login process completed
     - Navigated to company page: <URL>
     - Data updated in Google Sheet

## Project Structure

```
moneycontrol-swot-scraper/
├── .env                    # Environment variables (MC_USERNAME, MC_PASSWORD, SPREADSHEET_ID)
├── package.json            # Project dependencies and scripts
├── app.js              # Main script for scraping and storing data
└── service-account-key.json # Google Cloud service account key (not tracked in git)
```

## Companies Scraped

The script currently scrapes SWOT data for the following companies:

- Reliance Industries Limited
- Tata Consultancy Services Limited
- Infosys Limited
- HDFC Bank Limited
- ICICI Bank Limited
- Hindustan Unilever Limited
- State Bank of India
- Kotak Mahindra Bank Limited
- ITC Limited
- Larsen & Toubro Limited

## Troubleshooting

- **Login Fails**:
  - Ensure `MC_USERNAME` and `MC_PASSWORD` in `.env` are correct.
  - Check for captchas; if present, you may need to log in manually first or integrate a captcha-solving service.

- **Google Sheet Not Updating**:
  - Verify `SPREADSHEET_ID` in `.env` is correct.
  - Ensure `service-account-key.json` is in the project root and the service account has Editor access to the Google Sheet.

- **SWOT Data Not Found**:
  - Moneycontrol may have changed its HTML structure. Update the selector in `getSWOTCounts` (`ul.clearfix li.swotliClass a strong`) to match the new structure.

- **Network Errors**:
  - Increase the timeout in `page.goto` (currently 60 seconds) if your network is slow.

## Potential Improvements

- **Append Data to Google Sheet**: Modify `storeInGoogleSheet` to append data instead of overwriting by using `sheets.spreadsheets.values.append`.
- **Handle Captchas**: Integrate a captcha-solving service (e.g., 2Captcha) if Moneycontrol introduces captchas during login.
- **Expand Company List**: Add more companies to the `companies` array in `scraper.js`.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Built with [Puppeteer](https://pptr.dev/) for browser automation.
- Uses [Cheerio](https://cheerio.js.org/) for HTML parsing.
- Integrates with the [Google Sheets API](https://developers.google.com/sheets/api) for data storage.
