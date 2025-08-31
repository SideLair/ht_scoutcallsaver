/**
 * Hattrick Scout Saver - Content Script
 * Modular and maintainable version
 */

// Configuration
const CONFIG = {
  ANGULAR_TIMEOUT: 30000,
  CHECK_INTERVAL: 500,
  DUPLICATE_WINDOW_HOURS: 24
};

console.log('Extension loaded on:', window.location.href);

// Utils module
const utils = {
  isYouthPage: () => window.location.href.includes('Youth'),
  
  extractTeamId: () => {
    const hasBylineElement = document.querySelector('.hasByline');
    if (!hasBylineElement) return 'unknown';
    
    const match = hasBylineElement.textContent.match(/\((\d+)\)/);
    return match ? match[1] : 'unknown';
  },
  
  sanitizeText: (text) => {
    if (typeof text !== 'string') return '';
    return text.trim().replace(/[<>]/g, '');
  }
};

// Angular waiting utility
const waitForAngular = (callback) => {
  let attempts = 0;
  const maxAttempts = CONFIG.ANGULAR_TIMEOUT / CONFIG.CHECK_INTERVAL;
  
  const check = () => {
    attempts++;
    
    const hasAngularElement = document.querySelector('ht-youth-scouts');
    const hasHTData = window.HT?.ngHattrick?.ngYouthScouts;

    if (hasAngularElement || hasHTData) {
      console.log(`Angular application found! Attempts: ${attempts}`);
      callback();
    } else if (attempts < maxAttempts) {
      setTimeout(check, CONFIG.CHECK_INTERVAL);
    } else {
      console.log('Angular application not found after', maxAttempts, 'attempts');
    }
  };
  
  check();
};

// Extractor module
const extractor = {
  getPlayerInfo: (card) => {
    try {
      // Use the original working selectors
      const nameEls = card.querySelectorAll('.scout-details-text-name b');
      const name = nameEls.length >= 2 ? 
        `${nameEls[0].textContent.trim()} ${nameEls[1].textContent.trim()}` : 
        nameEls[0]?.textContent.trim() || 'unknown';
      
      const ageEl = card.querySelector('.scout-details-text-age');
      const ageText = ageEl ? ageEl.textContent.replace('years', '').trim() : 'unknown';
      const age = parseInt(ageText, 10) || 0;
      
      const skillGroupContent = card.querySelector('.skill-group-content');
      const specialitySpan = skillGroupContent?.querySelector('span');
      const speciality = specialitySpan ? specialitySpan.textContent.trim() : 'unknown';
      
      return {
        name: utils.sanitizeText(name),
        age: age,
        speciality: utils.sanitizeText(speciality)
      };
    } catch (error) {
      console.error('Error extracting player info:', error);
      return { name: 'unknown', age: 0, speciality: 'unknown' };
    }
  },
  
  getSkills: (card) => {
    let skills = { gk: 'unknown', def: 'unknown', pm: 'unknown', w: 'unknown', pa: 'unknown', sc: 'unknown', overall: 'unknown' };
    
    try {
      // Use original working logic for skills
      const skillRows = card.querySelectorAll('table.skilltable tr');
      
      skillRows.forEach(row => {
        const skillName = row.querySelector('td:first-child')?.textContent.trim().toLowerCase();
        const skillValue = row.querySelector('ht-skill-number')?.textContent.trim();
        
        if (skillName === 'keeper') skills.gk = skillValue || 'unknown';
        if (skillName === 'defending') skills.def = skillValue || 'unknown';
        if (skillName === 'playmaking') skills.pm = skillValue || 'unknown';
        if (skillName === 'winger') skills.w = skillValue || 'unknown';
        if (skillName === 'passing') skills.pa = skillValue || 'unknown';
        if (skillName === 'scoring') skills.sc = skillValue || 'unknown';
        if (skillName === 'overall') skills.overall = skillValue || 'unknown';
      });
      
    } catch (error) {
      console.error('Error extracting skills:', error);
    }
    
    return skills;
  },
  
  getScoutInfo: (scoutCards, index) => {
    let scoutInfo = { name: 'unknown', age: 'unknown', country: 'unknown', region: 'unknown', focus: 'unknown' };
    
    try {
      // Use original working logic for scout info
      if (scoutCards[index]) {
        const scoutCard = scoutCards[index];
        const scoutNameEls = scoutCard.querySelectorAll('.scout-details-text-name b');
        if (scoutNameEls.length >= 2) {
          scoutInfo.name = `${scoutNameEls[0].textContent.trim()} ${scoutNameEls[1].textContent.trim()}`;
        }
        
        const scoutAgeEl = scoutCard.querySelector('.scout-details-text-age');
        if (scoutAgeEl) {
          scoutInfo.age = scoutAgeEl.textContent.replace('years', '').trim();
        }
        
        // Looking for search criteria for scout
        const criteriaDiv = scoutCard.parentElement?.querySelector('app-scout-search-criteria');
        if (criteriaDiv) {
          const countryEl = criteriaDiv.querySelector('.scout-search-criteria-country');
          if (countryEl) scoutInfo.country = countryEl.textContent.trim();
          
          const regionSelect = criteriaDiv.querySelector('.scout-search-criteria-region');
          if (regionSelect && regionSelect.value) {
            const selectedOption = regionSelect.querySelector(`option[value="${regionSelect.value}"]`);
            if (selectedOption) scoutInfo.region = selectedOption.textContent.trim();
          }
          
          const focusSelect = criteriaDiv.querySelector('.scout-search-criteria-player-type');
          if (focusSelect && focusSelect.value) {
            const selectedOption = focusSelect.querySelector(`option[value="${focusSelect.value}"]`);
            if (selectedOption) scoutInfo.focus = selectedOption.textContent.trim();
          }
        }
      }
      
      return {
        name: utils.sanitizeText(scoutInfo.name),
        age: scoutInfo.age,
        country: utils.sanitizeText(scoutInfo.country),
        region: utils.sanitizeText(scoutInfo.region),
        focus: utils.sanitizeText(scoutInfo.focus)
      };
    } catch (error) {
      console.error('Error extracting scout info:', error);
      return { name: 'unknown', age: 'unknown', country: 'unknown', region: 'unknown', focus: 'unknown' };
    }
  }
};

// Extract player data using modular approach
const extractPlayerData = () => {
  console.log('Starting player data extraction...');
  
  try {
    const prospectCards = document.querySelectorAll('app-scout-prospect');
    const scoutCards = document.querySelectorAll('app-scout-card, .scout-card');
    
    if (prospectCards.length === 0) {
      console.log('No prospect cards found');
      return [];
    }
    
    const players = [];
    const teamId = utils.extractTeamId();
    
    for (let i = 0; i < prospectCards.length; i++) {
      try {
        const card = prospectCards[i];
        
        const playerInfo = extractor.getPlayerInfo(card);
        const skills = extractor.getSkills(card);
        const scoutInfo = extractor.getScoutInfo(scoutCards, i);
        const isSelected = !!card.querySelector('.scout-prospects-select.primary-button[value="Selected"]');

        const playerEntry = {
          timestamp: new Date().toISOString(),
          youthteam_id: teamId,
          name: playerInfo.name,
          age: playerInfo.age,
          speciality: playerInfo.speciality,
          gk: skills.gk,
          def: skills.def,
          pm: skills.pm,
          w: skills.w,
          pa: skills.pa,
          sc: skills.sc,
          overall: skills.overall,
          selected: isSelected ? true : false,
          scout_name: scoutInfo.name,
          scout_age: scoutInfo.age,
          scout_country: scoutInfo.country,
          scout_region: scoutInfo.region,
          scout_focus: scoutInfo.focus
        };
        
        console.log(`DOM parsing - player ${i + 1}:`, playerEntry);
        players.push(playerEntry);
        
      } catch (error) {
        console.log(`Error processing player ${i}:`, error);
      }
    }
    
    console.log(`Total extracted ${players.length} players`);
    return players;
    
  } catch (error) {
    console.error('Error extracting player data:', error);
    return [];
  }
};

// Helper functions for value mapping
const getSpecialityName = (specialtyId) => {
  const specialties = {
    0: 'None',
    1: 'Technical',
    2: 'Quick',
    3: 'Powerful',
    4: 'Unpredictable',
    5: 'Head',
    6: 'Resilient'
  };
  return specialties[specialtyId] || 'unknown';
};

const getPlayerTypeName = (playerTypeId) => {
  const playerTypes = {
    0: 'Any type',
    1: 'Keeper', 
    2: 'Defender',
    3: 'Wing back',
    4: 'Midfielder', 
    5: 'Winger',
    6: 'Forward'
  };
  return playerTypes[playerTypeId] || 'unknown';
};

// Get current week from page
const getCurrentWeek = () => {
  const weekEl = document.querySelector('[class*="week"], .week, #week');
  return weekEl ? weekEl.textContent.trim() : `Week_${new Date().getISOString().slice(0, 10)}`;
};

// Save to Chrome storage
const savePlayerData = async (players) => {
  if (players.length === 0) {
    console.log('No players to save');
    return;
  }
  
  try {
    console.log(`Attempting to save ${players.length} players:`, players.map(p => p.name));
    
    // Get existing data
    const result = await chrome.storage.local.get(['scoutData']);
    const existingData = result.scoutData || [];
    
    // Check for duplicates based on name and time (within last 24 hours)
    const newData = players.filter(newPlayer => {
      const now = new Date();
      const playerTime = new Date(newPlayer.timestamp);
      const timeDiff = Math.abs(now - playerTime) / (1000 * 60 * 60); // difference in hours
      
      return !existingData.some(existing => 
        existing.name === newPlayer.name && 
        timeDiff < 24 // if same player is younger than 24 hours, don't add
      );
    });
    
    if (newData.length === 0) {
      console.log('All players already saved (duplicates)');
      showNotification('Players were already saved previously', 'warning');
      return;
    }
    
    // Add new data
    const updatedData = [...existingData, ...newData];
    
    // Save back
    await chrome.storage.local.set({ scoutData: updatedData });
    
    console.log(`✅ Successfully saved ${newData.length} new players. Total in database: ${updatedData.length}`);
    
    // Show notification
    showNotification(`Saved ${newData.length} new players from scouting`);
    
  } catch (error) {
    console.error('❌ Error saving:', error);
    showNotification('Error saving data', 'error');
  }
};

// Simple notification
const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div');
  
  const colors = {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#f44336'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.success};
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
};

// Add button for manual saving
const addSaveButton = () => {
  if (document.getElementById('hattrick-save-scouts')) return; // Already exists
  
  const actionsDiv = document.querySelector('.scout-actions');
  if (!actionsDiv) return;
  
  const buttonWrapper = actionsDiv.querySelector('.scout-actions-button-wrapper');
  if (!buttonWrapper) return;
  
  // Create button in same style as "RECRUIT TO YOUTH TEAM"
  const saveButton = document.createElement('input');
  saveButton.type = 'button';
  saveButton.id = 'hattrick-save-scouts';
  saveButton.className = 'scout-prospect-actions-button primary-button';
  saveButton.value = 'Save to local storage';
  saveButton.style.marginLeft = '10px';
  
  saveButton.addEventListener('click', async () => {
    const players = extractPlayerData() || [];
    
    if (players && players.length > 0) {
      await savePlayerData(players);
    } else {
      showNotification('No players found on this page', 'warning');
      console.log('No players found on this page');
    }
  });
  
  buttonWrapper.appendChild(saveButton);
  console.log('Added button for saving scouts');
};

// Main function
const main = () => {
  console.log('Main function started');
  
  if (!window.location.href.includes('Youth')) {
    console.log('Not a Youth page, terminating');
    return;
  }
  
  // Wait for Angular application to load
  waitForAngular(() => {
    addSaveButton();
  });
};

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

// Also react to history changes (SPA navigation)
window.addEventListener('popstate', () => setTimeout(main, 1000));