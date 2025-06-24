# GitHub Actions Setup Guide

This guide walks you through setting up GitHub Actions to automate your Moneycontrol SWOT scraper.

## Step 1: Create a GitHub Repository

1. Sign in to [GitHub](https://github.com).
2. Create a new repository or use an existing one.
3. Push your code to this repository.

## Step 2: Set Up Repository Secrets

You need to set up four repository secrets that the GitHub Actions workflow will use:

1. Go to your GitHub repository.
2. Click on "Settings" > "Secrets and variables" > "Actions".
3. Click on "New repository secret" and add each of these secrets:

   | Secret Name | Description | Example |
   |-------------|-------------|---------|
   | `MC_USERNAME` | Your Moneycontrol username/email | `user@example.com` |
   | `MC_PASSWORD` | Your Moneycontrol password | `password123` |
   | `SPREADSHEET_ID` | Your Google Sheet ID | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
   | `GOOGLE_SERVICE_ACCOUNT_KEY` | Your entire service account key JSON | Copy the entire contents of your `service-account-key.json` file |

   **Important**: For the `GOOGLE_SERVICE_ACCOUNT_KEY`, you need to copy the entire JSON content from your `service-account-key.json` file.

## Step 3: View and Manage Workflow Runs

1. After pushing your code with the `.github/workflows/daily-scraper.yml` file, GitHub Actions will be set up automatically.
2. Go to the "Actions" tab in your repository to view workflow runs.
3. The workflow is scheduled to run daily at 01:00 UTC.
4. You can also manually trigger the workflow by clicking "Run workflow" in the Actions tab.

## Step 4: Monitor Execution

1. Each workflow run will show you logs of the execution.
2. If the scraper fails, an issue will be automatically created in your repository.
3. Check the Google Sheet to confirm data is being updated.

## Troubleshooting

- **Workflow not running**: Ensure your repository is public or you have GitHub Actions minutes available for private repositories.
- **Failed runs**: Check the Action logs for error messages, which usually indicate issues with credentials or network connectivity.
- **Service account issues**: Ensure your Google Service Account has access to the spreadsheet and that the JSON key is correctly formatted in the secret.

## Adjusting the Schedule

To change when the script runs daily:

1. Edit the `.github/workflows/daily-scraper.yml` file.
2. Modify the `cron` line under `schedule`.
3. The format is: `minute hour day month day-of-week` (e.g., `0 1 * * *` runs at 1:00 UTC daily).
4. Use [crontab.guru](https://crontab.guru/) to help create the right expression.
