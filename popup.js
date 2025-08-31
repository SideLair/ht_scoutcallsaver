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
  document.getElementById('clearBtn').addEventListener('click', clearData);
  loadStats();
});