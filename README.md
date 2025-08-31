# Hattrick Scout Call Saver

A Chrome extension that automatically saves scout offers from Hattrick.org and exports them to CSV format.

## Features

- **Automatic Scout Detection**: Monitors Hattrick pages and automatically saves scout offers
- **CSV Export**: Export all collected scout data to CSV with sequential counter and timestamp
- **Data Management**: View statistics and clear stored data
- **Persistent Storage**: Uses Chrome's local storage to persist data between sessions

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your Chrome toolbar

## Usage

1. Navigate to Hattrick.org and browse scout offers as usual
2. The extension automatically detects and saves scout data in the background
3. Click the extension icon to view statistics and export options
4. Use "Download CSV" to export all saved scout data
5. Use "Clear Data" to remove all stored scout information

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
- `popup.js` - Popup functionality and CSV export logic
- `text_div.html` - Static HTML reference file

## Development

The extension uses Chrome's Manifest V3 format and requires the following permissions:
- `activeTab` - To access the current Hattrick tab
- `storage` - To persist scout data locally

## License

This project is for educational and personal use with Hattrick.org.