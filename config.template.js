/**
 * Azure Configuration Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to config.js
 * 2. Replace the placeholder URL with your actual Azure Blob SAS URL
 * 3. Never commit config.js to version control
 *
 * To generate a SAS URL:
 * 1. Go to Azure Portal > Storage Account > Container > Your CSV file
 * 2. Right-click > Generate SAS
 * 3. Set permissions: Read + Write (uncheck others)
 * 4. Set expiry date (e.g., 1-2 years from now)
 * 5. Copy the "Blob SAS URL"
 */

const AZURE_CONFIG = {
  // Replace this with your actual Azure Blob SAS URL
  BLOB_SAS_URL: 'https://YOUR-STORAGE-ACCOUNT.blob.core.windows.net/YOUR-CONTAINER/YOUR-PATH/file.csv?sp=raw&st=...&se=...&sig=...',

  // Enable/disable cloud sync feature
  SYNC_ENABLED: true
};
