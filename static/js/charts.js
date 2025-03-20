/**
 * Mood Tracker & Insights - Charts JavaScript
 * This file contains chart-related functionality for visualizing mood data.
 * Uses Chart.js library for rendering charts.
 */

// Global chart object to allow updates
let moodChart = null;

// Color mapping for mood values (matching CSS variables)
const moodColors = {
    7: '#4caf50', // very happy - green
    6: '#8bc34a', // happy - light green
    5: '#ffeb3b', // neutral - yellow
    4: '#ff5722', // frustrated - deep orange
    3: '#e53935', // angry - red
    2: '#ff9800', // sad - orange
    1: '#f44336'  // very sad - red
};

// Update the mood chart based on period (week or month)
function updateMoodChart(period = 'week') {
    // Get mood entries from local storage
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    if (moodEntries.length === 0) {
        // No data to display
        return;
    }
    
    // Sort entries by date (oldest first for chart)
    moodEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filter entries based on period
    const filteredEntries = filterEntriesByPeriod(moodEntries, period);
    
    // Prepare chart data
    const labels = [];
    const data = [];
    const backgroundColor = [];
    
    filteredEntries.forEach(entry => {
        // Format date for display
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        });
        
        // Add time if available to distinguish multiple entries on the same day
        let displayLabel = formattedDate;
        if (entry.exactTime) {
            displayLabel = `${formattedDate} ${entry.exactTime}`;
        }
        
        labels.push(displayLabel);
        data.push(entry.moodValue);
        backgroundColor.push(moodColors[entry.moodValue]);
    });
    
    // Canvas element for the chart
    const ctx = document.getElementById('moodChart').getContext('2d');
    
    // Destroy existing chart if exists
    if (moodChart) {
        moodChart.destroy();
    }
    
    // Create new chart
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Level',
                data: data,
                borderColor: '#1e88e5',
                backgroundColor: 'rgba(30, 136, 229, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: backgroundColor,
                pointBorderColor: '#fff',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 8,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            switch(value) {
                                case 7: return 'Very Happy';
                                case 6: return 'Happy';
                                case 5: return 'Neutral';
                                case 4: return 'Frustrated';
                                case 3: return 'Angry';
                                case 2: return 'Sad';
                                case 1: return 'Very Sad';
                                default: return '';
                            }
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            const entry = filteredEntries[index];
                            let displayDate = entry.date;
                            
                            // Add time if available for better context
                            if (entry.exactTime) {
                                displayDate = `${entry.date} at ${entry.exactTime}`;
                            }
                            
                            return displayDate;
                        },
                        label: function(context) {
                            const moodValue = context.raw;
                            let moodText = '';
                            
                            switch(moodValue) {
                                case 7: moodText = 'Very Happy'; break;
                                case 6: moodText = 'Happy'; break;
                                case 5: moodText = 'Neutral'; break;
                                case 4: moodText = 'Frustrated'; break;
                                case 3: moodText = 'Angry'; break;
                                case 2: moodText = 'Sad'; break;
                                case 1: moodText = 'Very Sad'; break;
                                default: moodText = 'Unknown';
                            }
                            
                            return `Mood: ${moodText}`;
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const entry = filteredEntries[index];
                            return entry.note ? `Note: "${entry.note}"` : '';
                        }
                    }
                }
            }
        }
    });
}

// Filter entries based on selected period (week or month)
function filterEntriesByPeriod(entries, period) {
    const today = new Date();
    let startDate;
    
    if (period === 'week') {
        // Last 7 days
        startDate = new Date();
        startDate.setDate(today.getDate() - 6); // 7 days including today
    } else {
        // Last 30 days
        startDate = new Date();
        startDate.setDate(today.getDate() - 29); // 30 days including today
    }
    
    // Reset time parts for accurate date comparison
    startDate.setHours(0, 0, 0, 0);
    
    // Filter entries that fall within the period
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate;
    });
}
