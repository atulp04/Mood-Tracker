/**
 * Mood Tracker & Insights - Patterns JavaScript
 * This file contains functionality for analyzing mood patterns
 * and providing culturally relevant suggestions for Indian professionals.
 */

// Check for mood patterns after 7 days of data
function checkForPatterns() {
    // Get mood entries from local storage
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];
    
    // Get unique dates to count actual days of data
    const uniqueDates = [...new Set(moodEntries.map(entry => entry.date))];
    
    // Only show insights after a few days of data (reduced from 7 to 3 for testing)
    console.log("Number of unique dates:", uniqueDates.length);
    if (uniqueDates.length < 3) {
        insightsCard.style.display = 'none';
        return;
    }
    
    // Show insights card
    insightsCard.style.display = 'block';
    
    // Analyze patterns
    const patterns = analyzePatterns(moodEntries);
    
    // Display insights
    displayInsights(patterns);
    
    // Generate suggestions based on patterns
    generateSuggestions(patterns);
}

// Analyze mood entries for patterns
function analyzePatterns(entries) {
    // Sort entries by date (oldest first)
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Find patterns by weekday
    const weekdayMoods = Array(7).fill(0).map(() => []);
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    entries.forEach(entry => {
        weekdayMoods[entry.weekday].push(entry.moodValue);
    });
    
    // Calculate average mood for each weekday
    const weekdayAverages = weekdayMoods.map(moods => {
        if (moods.length === 0) return null;
        return moods.reduce((sum, value) => sum + value, 0) / moods.length;
    });
    
    // Find highest and lowest average mood days
    let highestDay = -1;
    let highestAvg = 0;
    let lowestDay = -1;
    let lowestAvg = 6;
    
    weekdayAverages.forEach((avg, index) => {
        if (avg !== null) {
            if (avg > highestAvg) {
                highestAvg = avg;
                highestDay = index;
            }
            if (avg < lowestAvg) {
                lowestAvg = avg;
                lowestDay = index;
            }
        }
    });
    
    // Check for mood trends (improving or declining)
    // Use the last 7 unique days for trend analysis
    const uniqueDays = [];
    const uniqueDayEntries = [];
    
    // Get the most recent entry for each unique day
    entries.slice().reverse().forEach(entry => {
        if (!uniqueDays.includes(entry.date)) {
            uniqueDays.push(entry.date);
            uniqueDayEntries.push(entry);
            
            // Stop after 7 days
            if (uniqueDays.length >= 7) {
                return;
            }
        }
    });
    
    // Reverse back for chronological order
    uniqueDayEntries.reverse();
    
    let trendDirection = 'stable';
    
    if (uniqueDayEntries.length >= 5) {
        // Simple linear regression to detect trend
        const x = Array.from({length: uniqueDayEntries.length}, (_, i) => i);
        const y = uniqueDayEntries.map(entry => entry.moodValue);
        
        const slope = calculateSlope(x, y);
        
        if (slope > 0.1) {
            trendDirection = 'improving';
        } else if (slope < -0.1) {
            trendDirection = 'declining';
        }
    }
    
    // Calculate overall average mood
    const allMoodValues = entries.map(entry => entry.moodValue);
    const overallAverage = allMoodValues.reduce((sum, value) => sum + value, 0) / allMoodValues.length;
    
    // Debug: Log overall average and mood values
    console.log("Overall Average Mood:", overallAverage);
    console.log("All Mood Values:", allMoodValues);
    
    // Check for mood variability
    const variability = calculateStandardDeviation(allMoodValues);
    let variabilityLevel = 'moderate';
    
    if (variability < 0.5) {
        variabilityLevel = 'low';
    } else if (variability > 1.2) {
        variabilityLevel = 'high';
    }
    
    // Return pattern analysis
    return {
        highestDay: highestDay !== -1 ? weekdayNames[highestDay] : null,
        highestAvg: highestDay !== -1 ? highestAvg.toFixed(1) : null,
        lowestDay: lowestDay !== -1 ? weekdayNames[lowestDay] : null,
        lowestAvg: lowestDay !== -1 ? lowestAvg.toFixed(1) : null,
        trendDirection,
        overallAverage: overallAverage.toFixed(1),
        variabilityLevel
    };
}

// Display insights based on pattern analysis
function displayInsights(patterns) {
    patternInsights.innerHTML = '<h6 class="mb-3">Your Mood Patterns</h6>';
    
    // Create insights based on patterns
    const insights = [];
    
    // Add insight about best day
    if (patterns.highestDay) {
        insights.push(`
            <div class="insight-item">
                <i class="fas fa-star"></i>
                Your mood tends to be highest on <strong>${patterns.highestDay}s</strong> (${getMoodTextFromValue(patterns.highestAvg)}).
            </div>
        `);
    }
    
    // Add insight about worst day
    if (patterns.lowestDay) {
        insights.push(`
            <div class="insight-item">
                <i class="fas fa-cloud"></i>
                Your mood tends to be lowest on <strong>${patterns.lowestDay}s</strong> (${getMoodTextFromValue(patterns.lowestAvg)}).
            </div>
        `);
    }
    
    // Add insight about trend
    if (patterns.trendDirection !== 'stable') {
        insights.push(`
            <div class="insight-item">
                <i class="fas fa-chart-line"></i>
                Your mood has been <strong>${patterns.trendDirection}</strong> over the past week.
            </div>
        `);
    }
    
    // Add insight about variability
    insights.push(`
        <div class="insight-item">
            <i class="fas fa-random"></i>
            Your mood shows <strong>${patterns.variabilityLevel}</strong> variability, suggesting ${getVariabilityExplanation(patterns.variabilityLevel)}.
        </div>
    `);
    
    // Add insights to the container
    if (insights.length > 0) {
        patternInsights.innerHTML += insights.join('');
    } else {
        patternInsights.innerHTML += `
            <div class="insight-item">
                <i class="fas fa-info-circle"></i>
                Continue tracking your mood to receive more detailed insights.
            </div>
        `;
    }
}

// Generate suggestions based on pattern analysis
function generateSuggestions(patterns) {
    moodSuggestions.innerHTML = '<h6 class="mb-3">Personalized Suggestions</h6>';
    
    // Check if we should display Broaden & Build theory info
    if (parseFloat(patterns.overallAverage) > 4.5) {
        moodSuggestions.innerHTML += `
            <div class="theory-info mb-3">
                <small><em>The <strong>Broaden & Build</strong> theory suggests that positive emotions expand our awareness and help us build long-term personal resources. We provide special suggestions when your mood is positive to help you capitalize on these effects.</em></small>
            </div>
        `;
    }
    
    // Create culturally relevant suggestions based on patterns
    const suggestions = [];
    
    // Suggestions based on lowest day
    if (patterns.lowestDay) {
        suggestions.push(`
            <div class="suggestion-item">
                <i class="fas fa-lightbulb"></i>
                Plan something special for ${patterns.lowestDay}s like a short chai break with colleagues or a call with family.
            </div>
        `);
    }
    
    // Suggestions based on trend
    if (patterns.trendDirection === 'declining') {
        suggestions.push(`
            <div class="suggestion-item">
                <i class="fas fa-heartbeat"></i>
                Your mood has been declining. Consider practicing 5 minutes of deep breathing or meditation in the morning.
            </div>
        `);
    }
    
    // Suggestions based on variability
    if (patterns.variabilityLevel === 'high') {
        suggestions.push(`
            <div class="suggestion-item">
                <i class="fas fa-balance-scale"></i>
                Your mood varies significantly. Establishing a consistent daily routine might help stabilize your emotional well-being.
            </div>
        `);
    }
    
    // General wellness suggestions (culturally relevant for Indian professionals)
    const generalSuggestions = [
        "Take short breaks for a cup of chai or a brief walk during your workday.",
        "Spend 10 minutes in the morning to practice mindful breathing or yoga.",
        "Connect with family members or close friends at least once a day.",
        "Listen to your favorite ragas or music during stressful periods.",
        "Practice gratitude by noting three positive experiences each day.",
        "Incorporate a short evening walk after dinner for physical and mental well-being.",
        "Set aside time to engage in a creative hobby or activity you enjoy."
    ];
    
    // Broaden & Build Theory suggestions (For when mood is positive)
    const broadenBuildSuggestions = [
        "Your positive mood can help you think more creatively. Consider brainstorming solutions to a challenge you've been facing.",
        "Positive emotions build resilience. Take a moment to appreciate how you've overcome challenges in the past.",
        "When feeling positive, we're more open to new experiences. Try something new or reach out to someone you'd like to know better.",
        "Positive emotions can strengthen relationships. Share your positive feelings with others and express appreciation to someone important.",
        "Build on your positive mood by engaging in an activity that brings you joy and helps others, creating an upward spiral of well-being."
    ];
    
    // Add Broaden & Build suggestion if overall mood is positive (average > 5)
    // Debug: Log the comparison for Broaden & Build criteria
    console.log("Checking Broaden & Build criteria:");
    console.log("  - Overall Average:", patterns.overallAverage);
    console.log("  - Parsed Value:", parseFloat(patterns.overallAverage));
    console.log("  - Is > 5:", parseFloat(patterns.overallAverage) > 5);
    
    // Lower the threshold to 4.5 temporarily for testing (normally should be 5)
    if (parseFloat(patterns.overallAverage) > 4.5) {
        console.log("✓ Adding Broaden & Build suggestion");
        const randomBroadenBuildSuggestion = broadenBuildSuggestions[Math.floor(Math.random() * broadenBuildSuggestions.length)];
        suggestions.push(`
            <div class="suggestion-item broaden-build">
                <i class="fas fa-lightbulb"></i>
                <strong>Broaden & Build:</strong> ${randomBroadenBuildSuggestion}
            </div>
        `);
    } else {
        console.log("✗ Not adding Broaden & Build suggestion (average mood not high enough)");
    }
    
    // Add a random general suggestion
    const randomSuggestion = generalSuggestions[Math.floor(Math.random() * generalSuggestions.length)];
    suggestions.push(`
        <div class="suggestion-item">
            <i class="fas fa-spa"></i>
            ${randomSuggestion}
        </div>
    `);
    
    // Add suggestions to the container
    if (suggestions.length > 0) {
        moodSuggestions.innerHTML += suggestions.join('');
    } else {
        moodSuggestions.innerHTML += `
            <div class="suggestion-item">
                <i class="fas fa-info-circle"></i>
                Continue tracking your mood to receive personalized suggestions.
            </div>
        `;
    }
}

// Helper function to calculate slope for trend analysis
function calculateSlope(x, y) {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

// Helper function to calculate standard deviation for variability
function calculateStandardDeviation(values) {
    const n = values.length;
    const mean = values.reduce((sum, value) => sum + value, 0) / n;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / n;
    return Math.sqrt(variance);
}

// Helper function to get mood text from value
function getMoodTextFromValue(value) {
    value = parseFloat(value);
    
    if (value >= 6.5) return "Very Happy";
    if (value >= 5.5) return "Happy";
    if (value >= 4.5) return "Neutral";
    if (value >= 3.5) return "Frustrated";
    if (value >= 2.5) return "Angry";
    if (value >= 1.5) return "Sad";
    return "Very Sad";
}

// Helper function to explain variability levels
function getVariabilityExplanation(level) {
    switch(level) {
        case 'low':
            return "your emotions remain relatively consistent";
        case 'high':
            return "you experience significant emotional ups and downs";
        default:
            return "you have a balanced emotional pattern";
    }
}
