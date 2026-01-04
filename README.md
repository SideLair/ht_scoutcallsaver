# Hattrick Scout Call Saver

A Chrome extension that automatically saves scout offers from Hattrick.org and exports them to CSV format.

## Features

- **Automatic Scout Detection**: Monitors Hattrick pages and automatically saves scout offers
- **CSV Export**: Export all collected scout data to CSV with sequential counter and timestamp
- **Cloud Sync**: Sync data to Azure Data Lake for multi-device consolidation
- **Data Management**: View statistics and clear stored data
- **Persistent Storage**: Uses Chrome's local storage to persist data between sessions

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your Chrome toolbar

## Usage

### Basic Workflow
1. Navigate to Hattrick.org and browse scout offers as usual
2. The extension automatically detects and saves scout data in the background
3. Click the extension icon to view statistics and export options
4. Use "Download CSV" to export all saved scout data locally
5. Use "Sync to Cloud" to upload data to Azure Data Lake (see Cloud Sync Setup)
6. Use "Clear Data" to remove all stored scout information from local storage

### Cloud Sync Setup (Optional)
If you want to consolidate data from multiple devices to Azure Data Lake:

1. **Create Azure Storage Account**
   - Set up Azure Blob Storage or Data Lake Gen2
   - Create a container and CSV file for your scout data
   - Generate a SAS token with Read, Add, and Write permissions

2. **Configure the Extension**
   - Create a `config.js` file in the extension directory (use `config.template.js` as reference)
   - Add your Azure Blob SAS URL to the config
   - The config.js file is gitignored for security

3. **Multi-Device Setup**
   - Store your SAS URL in a password manager
   - Create config.js on each device with the same SAS URL
   - Each device can now sync to the same Azure blob

4. **Sync Workflow**
   - Save scouts locally as usual
   - Click "Sync to Cloud" when ready
   - Data is appended to your Azure Data Lake CSV
   - Manually clear local data after verifying successful sync

## CSV Export Format

The exported CSV contains the following columns:

1. **id** - Sequential counter starting from 1
2. **datetime** - Timestamp when the scout was saved
3. **youthteam_id** - Youth team identifier
4. **name** - Player name
5. **age** - Player age
6. **speciality** - Player speciality
7. **gk** - Goalkeeper skill
8. **def** - Defense skill
9. **pm** - Playmaking skill
10. **w** - Wing skill
11. **pa** - Passing skill
12. **sc** - Scoring skill
13. **overall** - Overall rating
14. **selected** - Selection status
15. **scout_name** - Scout name
16. **scout_age** - Scout age
17. **scout_country** - Scout country
18. **scout_region** - Scout region
19. **scout_focus** - Scout focus area

## Files Structure

- `manifest.json` - Extension manifest and permissions
- `content.js` - Content script that runs on Hattrick pages
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality, CSV export, and Azure sync logic
- `config.js` - Azure configuration (gitignored, create from template)
- `.gitignore` - Protects sensitive config from being committed
- `text_div.html` - Static HTML reference file

## Development

The extension uses Chrome's Manifest V3 format and requires the following permissions:
- `activeTab` - To access the current Hattrick tab
- `storage` - To persist scout data locally
- `host_permissions` - To connect to Azure Blob Storage (*.blob.core.windows.net)

### Security Notes
- Never commit `config.js` to version control (it contains SAS tokens)
- Store SAS URLs in a password manager for easy multi-device setup
- SAS tokens expire - update config.js before expiration date
- Use least-privilege permissions when generating SAS tokens (Read, Add, Write only)

## License

This project is for educational and personal use with Hattrick.org.