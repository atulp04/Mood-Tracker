/**
 * Mood Tracker & Insights - Main JavaScript
 * This file contains core functionality for the mood tracking application
 * designed for middle-aged Indian professionals.
 */

// DOM Elements
const moodSelector = document.getElementById('moodSelector');
const moodNote = document.getElementById('moodNote');
const charCount = document.getElementById('charCount');
const currentDateElem = document.getElementById('currentDate');
const saveMoodBtn = document.getElementById('saveMoodBtn');
const moodHistory = document.getElementById('moodHistory');
const noDataMessage = document.getElementById('noDataMessage');
const insightsCard = document.getElementById('insightsCard');
const patternInsights = document.getElementById('patternInsights');
const moodSuggestions = document.getElementById('moodSuggestions');
const weekViewBtn = document.getElementById('weekViewBtn');
const monthViewBtn = document.getElementById('monthViewBtn');
const mainHelpBtn = document.getElementById('mainHelpBtn');
const exportCSVBtn = document.getElementById('exportCSV');
const exportJSONBtn = document.getElementById('exportJSON');

// Test panel elements
const testPanel = document.getElementById('testPanel');
const testDate = document.getElementById('testDate');
const testMood = document.getElementById('testMood');
const testNote = document.getElementById('testNote');
const addTestMoodBtn = document.getElementById('addTestMoodBtn');
const clearAllDataBtn = document.getElementById('clearAllDataBtn');
const closeTestPanel = document.getElementById('closeTestPanel');
const showHelpBtn = document.getElementById('showHelpBtn');

// Initialize mood entry variables
let selectedMood = null;
let selectedMoodValue = null;

// Display current date in Indian format
function displayCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    currentDateElem.textContent = now.toLocaleDateString('en-IN', options);
}

// Initialize the mood selector
function initMoodSelector() {
    const moodOptions = moodSelector.querySelectorAll('.mood-option');
    
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selection from all options
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            this.classList.add('selected');
            
            // Store the selected mood
            selectedMood = this.dataset.mood;
            selectedMoodValue = parseInt(this.dataset.value);
        });
    });
}

// Character counter for mood notes
function initCharCounter() {
    moodNote.addEventListener('input', function() {
        const remaining = this.maxLength - this.value.length;
        charCount.textContent = `(${this.value.length}/${this.maxLength})`;
    });
}

// Save mood entry to local storage
function saveMoodEntry() {
    saveMoodBtn.addEventListener('click', function() {
        if (!selectedMood) {
            alert('Please select a mood before saving.');
            return;
        }
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create mood entry object with unique ID and exact timestamp
        const moodEntry = {
            id: Date.now().toString(), // Unique identifier for each entry
            date: dateStr,
            exactTime: now.toLocaleTimeString('en-IN'), // Store exact time
            timestamp: now.getTime(),
            mood: selectedMood,
            moodValue: selectedMoodValue,
            note: moodNote.value.trim(),
            weekday: now.getDay() // 0 = Sunday, 1 = Monday, etc.
        };
        
        // Get existing mood entries or initialize empty array
        let moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
        
        // Always add the new entry (no replacement)
        moodEntries.push(moodEntry);
        
        // Sort entries by date (newest first)
        moodEntries.sort((a, b) => b.timestamp - a.timestamp);
        
        // Save to local storage
        localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
        
        // Update UI
        displayMoodHistory();
        updateMoodChart();
        checkForPatterns();
        
        // Show confirmation
        const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        confirmationModal.show();
        
        // Reset form
        resetMoodForm();
    });
}

// Reset the mood form after saving
function resetMoodForm() {
    // Clear selection
    const moodOptions = moodSelector.querySelectorAll('.mood-option');
    moodOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Reset variables
    selectedMood = null;
    selectedMoodValue = null;
    
    // Clear note
    moodNote.value = '';
    charCount.textContent = '(0/200)';
}

// Display mood history entries
function displayMoodHistory() {
    // Get mood entries from local storage
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    // Show/hide appropriate elements based on data availability
    if (moodEntries.length === 0) {
        noDataMessage.style.display = 'block';
        moodHistory.style.display = 'none';
        return;
    } else {
        noDataMessage.style.display = 'none';
        moodHistory.style.display = 'block';
    }
    
    // Clear existing history
    moodHistory.innerHTML = '';
    
    // Display the last 7 entries (or fewer if not available)
    const entriesToShow = moodEntries.slice(0, 7);
    
    entriesToShow.forEach(entry => {
        // Format date in Indian style (DD Month YYYY)
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            weekday: 'short'
        });
        
        // Add time if available
        const displayTime = entry.exactTime ? ` at ${entry.exactTime}` : '';
        
        // Get emoji based on mood
        let emoji = '';
        let moodText = '';
        
        switch(entry.mood) {
            case 'very_happy':
                emoji = '😊';
                moodText = 'Very Happy';
                break;
            case 'happy':
                emoji = '🙂';
                moodText = 'Happy';
                break;
            case 'neutral':
                emoji = '😐';
                moodText = 'Neutral';
                break;
            case 'frustrated':
                emoji = '😤';
                moodText = 'Frustrated';
                break;
            case 'angry':
                emoji = '😠';
                moodText = 'Angry';
                break;
            case 'sad':
                emoji = '😔';
                moodText = 'Sad';
                break;
            case 'very_sad':
                emoji = '😢';
                moodText = 'Very Sad';
                break;
            default:
                emoji = '😐';
                moodText = 'Unknown';
        }
        
        // Create history item
        const historyItem = document.createElement('div');
        historyItem.className = 'mood-history-item';
        
        historyItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span class="mood-history-date">${formattedDate}${displayTime}</span>
                <span class="mood-history-emoji" title="${moodText}">${emoji}</span>
            </div>
            ${entry.note ? `<div class="mood-history-note">"${entry.note}"</div>` : ''}
        `;
        
        moodHistory.appendChild(historyItem);
    });
}

// Initialize chart view selection
function initChartViewToggle() {
    weekViewBtn.addEventListener('click', function() {
        weekViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        updateMoodChart('week');
    });
    
    monthViewBtn.addEventListener('click', function() {
        monthViewBtn.classList.add('active');
        weekViewBtn.classList.remove('active');
        updateMoodChart('month');
    });
}

// Test panel initialization
function initTestPanel() {
    // Hide test panel by default
    testPanel.style.display = 'none';
    
    // Set default test date to today
    const today = new Date();
    testDate.value = today.toISOString().split('T')[0];
    
    // Toggle test panel with Alt+T keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 't') {
            testPanel.style.display = testPanel.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // Close test panel
    closeTestPanel.addEventListener('click', function() {
        testPanel.style.display = 'none';
    });
    
    // Show help guide
    showHelpBtn.addEventListener('click', function() {
        const helpModal = new bootstrap.Modal(document.getElementById('helpGuideModal'));
        helpModal.show();
    });
    
    // Add test mood entry
    addTestMoodBtn.addEventListener('click', function() {
        addTestMood();
    });
    
    // Clear all mood data
    clearAllDataBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all mood data? This cannot be undone.')) {
            localStorage.removeItem('moodEntries');
            displayMoodHistory();
            updateMoodChart();
            checkForPatterns();
            alert('All mood data has been cleared.');
        }
    });
}

// Add a test mood entry with a custom date
function addTestMood() {
    if (!testDate.value) {
        alert('Please select a date for the test entry.');
        return;
    }
    
    // Get values from test form
    const customDate = new Date(testDate.value);
    const customMoodValue = parseInt(testMood.value);
    const customNote = testNote.value.trim();
    
    // Determine mood type based on value
    let customMoodType;
    switch(customMoodValue) {
        case 7: customMoodType = 'very_happy'; break;
        case 6: customMoodType = 'happy'; break;
        case 5: customMoodType = 'neutral'; break;
        case 4: customMoodType = 'frustrated'; break;
        case 3: customMoodType = 'angry'; break;
        case 2: customMoodType = 'sad'; break;
        case 1: customMoodType = 'very_sad'; break;
        default: customMoodType = 'neutral';
    }
    
    // Create mood entry object
    const moodEntry = {
        id: Date.now().toString(), // Unique identifier
        date: customDate.toISOString().split('T')[0], // YYYY-MM-DD format
        exactTime: customDate.toLocaleTimeString('en-IN'),
        timestamp: customDate.getTime(),
        mood: customMoodType,
        moodValue: customMoodValue,
        note: customNote,
        weekday: customDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    };
    
    // Get existing mood entries or initialize empty array
    let moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    // Add the new entry
    moodEntries.push(moodEntry);
    
    // Sort entries by date (newest first)
    moodEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    // Save to local storage
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    
    // Update UI
    displayMoodHistory();
    updateMoodChart();
    checkForPatterns();
    
    // Log for debugging
    console.log(`Test mood entry added for ${customDate.toDateString()}: ${customMoodType} (${customMoodValue})`);
    
    // Move date back by 1 day for easy sequential testing
    const nextDate = new Date(customDate);
    nextDate.setDate(nextDate.getDate() - 1);
    testDate.value = nextDate.toISOString().split('T')[0];
}

// Export mood data as CSV
function exportMoodDataAsCSV() {
    // Get all mood entries
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    if (moodEntries.length === 0) {
        alert('No mood data to export. Please add some mood entries first.');
        return;
    }
    
    // Define CSV headers
    const headers = ['Date', 'Time', 'Mood', 'Mood Value', 'Note'];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    moodEntries.forEach(entry => {
        // Format date
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-IN');
        
        // Get mood text
        let moodText = '';
        switch(entry.mood) {
            case 'very_happy': moodText = 'Very Happy'; break;
            case 'happy': moodText = 'Happy'; break;
            case 'neutral': moodText = 'Neutral'; break;
            case 'frustrated': moodText = 'Frustrated'; break;
            case 'angry': moodText = 'Angry'; break;
            case 'sad': moodText = 'Sad'; break;
            case 'very_sad': moodText = 'Very Sad'; break;
            default: moodText = 'Unknown';
        }
        
        // Format note (escape commas and quotes)
        const formattedNote = entry.note ? `"${entry.note.replace(/"/g, '""')}"` : '';
        
        // Create CSV row
        const row = [
            formattedDate,
            entry.exactTime || '',
            moodText,
            entry.moodValue,
            formattedNote
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mood_tracker_data_${new Date().toLocaleDateString('en-IN')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    
    // Click the link to download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

// Export mood data as JSON
function exportMoodDataAsJSON() {
    // Get all mood entries
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    if (moodEntries.length === 0) {
        alert('No mood data to export. Please add some mood entries first.');
        return;
    }
    
    // Create a formatted JSON content
    const jsonContent = JSON.stringify(moodEntries, null, 2);
    
    // Create a download link
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mood_tracker_data_${new Date().toLocaleDateString('en-IN')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    
    // Click the link to download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

// Initialize export functions
function initExportButtons() {
    // Export CSV
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', function(e) {
            e.preventDefault();
            exportMoodDataAsCSV();
        });
    }
    
    // Export JSON
    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', function(e) {
            e.preventDefault();
            exportMoodDataAsJSON();
        });
    }
}

// Initial setup when page loads
function initialize() {
    displayCurrentDate();
    initMoodSelector();
    initCharCounter();
    saveMoodEntry();
    displayMoodHistory();
    initChartViewToggle();
    initTestPanel(); // Initialize the test panel
    initExportButtons(); // Initialize export buttons
    updateMoodChart('week'); // Default to weekly view
    checkForPatterns();
    
    // Initialize main help button
    if (mainHelpBtn) {
        mainHelpBtn.addEventListener('click', function() {
            const helpModal = new bootstrap.Modal(document.getElementById('helpGuideModal'));
            helpModal.show();
        });
    }
}

// Check if browser supports localStorage
function checkLocalStorageSupport() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// When DOM is loaded, initialize the application
document.addEventListener('DOMContentLoaded', function() {
    if (!checkLocalStorageSupport()) {
        alert('Your browser does not support local storage. The app may not function properly.');
    }
    
    initialize();
});
