// Load statistics when opening popup
async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['scoutData']);
    const data = result.scoutData || [];
    
    document.getElementById('playerCount').textContent = data.length;
    
    if (data.length > 0) {
      const lastEntry = data[data.length - 1];
      const date = new Date(lastEntry.timestamp);
      document.getElementById('lastUpdate').textContent = date.toLocaleString('cs-CZ');
    }
  } catch (error) {
    showStatus('Error loading data', 'error');
  }
}

// Export to CSV
async function exportCSV() {
  try {
    const result = await chrome.storage.local.get(['scoutData']);
    const data = result.scoutData || [];
    
    if (data.length === 0) {
      showStatus('No data to export', 'error');
      return;
    }
    
    // Create CSV content according to defined fields
    const headers = [
      'id', 'timestamp', 'youthteam_id', 'name', 'age', 'speciality', 
      'gk', 'def', 'pm', 'w', 'pa', 'sc', 'overall', 'selected',
      'scout_name', 'scout_age', 'scout_country', 'scout_region', 'scout_focus'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map((player, index) => [
        index + 1,
        player.timestamp,
        player.youthteam_id,
        `"${player.name}"`,
        player.age,
        `"${player.speciality}"`,
        player.gk,
        player.def,
        player.pm,
        player.w,
        player.pa,
        player.sc,
        player.overall,
        player.selected,
        `"${player.scout_name}"`,
        player.scout_age,
        `"${player.scout_country}"`,
        `"${player.scout_region}"`,
        `"${player.scout_focus}"`
      ].join(','))
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hattrick_scouts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showStatus(`Exported ${data.length} records`, 'success');
    
  } catch (error) {
    showStatus('Export error', 'error');
    console.error(error);
  }
}

// Clear data
async function clearData() {
  if (!confirm('Do you really want to delete all stored data?')) {
    return;
  }
  
  try {
    await chrome.storage.local.remove(['scoutData']);
    await loadStats();
    showStatus('Data cleared', 'success');
  } catch (error) {
    showStatus('Error deleting data', 'error');
  }
}

// Sync to Azure Blob Storage
async function syncToAzure() {
  // Check if sync is enabled
  if (!AZURE_CONFIG.SYNC_ENABLED) {
    showStatus('Cloud sync is disabled', 'error');
    return;
  }

  const syncBtn = document.getElementById('syncBtn');
  syncBtn.disabled = true;
  syncBtn.textContent = 'Syncing...';

  try {
    // Get local data
    const result = await chrome.storage.local.get(['scoutData']);
    const localData = result.scoutData || [];

    if (localData.length === 0) {
      showStatus('No local data to sync', 'error');
      syncBtn.disabled = false;
      syncBtn.textContent = 'Sync to Cloud';
      return;
    }

    // Download existing CSV from Azure
    let existingData = [];
    try {
      const response = await fetch(AZURE_CONFIG.BLOB_SAS_URL);
      if (response.ok) {
        const csvText = await response.text();
        if (csvText.trim()) {
          // Parse existing CSV (skip header)
          const lines = csvText.trim().split('\n');
          if (lines.length > 1) {
            existingData = lines.slice(1).map(line => {
              // Simple CSV parsing (handles quoted fields)
              const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g).map(f => f.replace(/^"|"$/g, ''));
              return fields;
            });
          }
        }
      }
    } catch (error) {
      console.log('No existing file or error reading:', error);
      // Continue with empty existing data - will create new file
    }

    // Prepare headers
    const headers = [
      'id', 'timestamp', 'youthteam_id', 'name', 'age', 'speciality',
      'gk', 'def', 'pm', 'w', 'pa', 'sc', 'overall', 'selected',
      'scout_name', 'scout_age', 'scout_country', 'scout_region', 'scout_focus'
    ];

    // Convert local data to CSV rows
    const newRows = localData.map(player => [
      '', // id will be assigned below
      player.timestamp,
      player.youthteam_id,
      `"${player.name}"`,
      player.age,
      `"${player.speciality}"`,
      player.gk,
      player.def,
      player.pm,
      player.w,
      player.pa,
      player.sc,
      player.overall,
      player.selected,
      `"${player.scout_name}"`,
      player.scout_age,
      `"${player.scout_country}"`,
      `"${player.scout_region}"`,
      `"${player.scout_focus}"`
    ]);

    // Combine existing and new data
    const allRows = [...existingData, ...newRows];

    // Assign sequential IDs
    const rowsWithIds = allRows.map((row, index) => {
      row[0] = index + 1; // Set id column
      return row.join(',');
    });

    // Create final CSV
    const csvContent = [headers.join(','), ...rowsWithIds].join('\n');

    // Upload to Azure using PUT with SAS URL
    const uploadResponse = await fetch(AZURE_CONFIG.BLOB_SAS_URL, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': 'text/csv'
      },
      body: csvContent
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const newRowsCount = localData.length;
    showStatus(`Synced ${newRowsCount} rows to cloud`, 'success');
    console.log(`✅ Successfully synced ${newRowsCount} rows to Azure`);

  } catch (error) {
    console.error('Sync error:', error);
    showStatus(`Sync failed: ${error.message}`, 'error');
  } finally {
    syncBtn.disabled = false;
    syncBtn.textContent = 'Sync to Cloud';
  }
}

// Display status
function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;

  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }, 3000);
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  document.getElementById('syncBtn').addEventListener('click', syncToAzure);
  document.getElementById('clearBtn').addEventListener('click', clearData);
  loadStats();
});