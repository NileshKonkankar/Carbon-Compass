import { useState, useMemo } from 'react';
import { 
  generateDefaultDailyData, 
  calculateEmission, 
  getLocalDateString, 
} from '../utils/carbonEngine';
import type { DailyData, ActivityEntry } from '../utils/carbonEngine';

// Key used for persisting tracking logs in browser local storage
const LOCAL_STORAGE_KEY = 'carbon_compass_data';

/**
 * Custom React Hook to manage state, calculations, and local storage persistence
 * for daily activity entries, green challenges, daily budgets, and streaks.
 */
export const useCarbonData = () => {
  // --- STATE 1: dailyRecords ---
  // Load existing records from localStorage or seed initial 7-day demo data if empty.
  // Using an initializer function prevents redundant parsing/seeding on every render.
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyData>>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing carbon data", e);
      }
    }

    // Seed default demo data for the past 7 days to make the application immediately interactive
    const records: Record<string, DailyData> = {};
    const today = new Date();

    for (let i = 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(date);
      
      const defaultData = generateDefaultDailyData(dateStr);
      
      // Customize past days to simulate realistic usage patterns
      if (i === 7) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'beef_pork', category: 'diet', label: 'Red Meat Meal', value: 1, unit: 'meal', co2e: 3.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'drive_solo', category: 'transport', label: 'Drive Solo (Gasoline Car)', value: 20, unit: 'km', co2e: 4.4, timestamp: date.toISOString() }
        ];
      } else if (i === 6) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegan', category: 'diet', label: 'Vegan Meal', value: 2, unit: 'meal', co2e: 0.6, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'bike_walk', category: 'transport', label: 'Bike or Walk', value: 8, unit: 'km', co2e: 0.0, timestamp: date.toISOString() }
        ];
        defaultData.challenges[0].completed = true; // Biked to work
        defaultData.challenges[1].completed = true; // Vegan day
      } else if (i === 5) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegetarian', category: 'diet', label: 'Vegetarian Meal', value: 2, unit: 'meal', co2e: 1.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'bus', category: 'transport', label: 'Public Bus', value: 15, unit: 'km', co2e: 1.2, timestamp: date.toISOString() }
        ];
      } else if (i === 4) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'beef_pork', category: 'diet', label: 'Red Meat Meal', value: 2, unit: 'meal', co2e: 6.4, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'drive_solo', category: 'transport', label: 'Drive Solo (Gasoline Car)', value: 35, unit: 'km', co2e: 7.7, timestamp: date.toISOString() }
        ]; // Total is ~17.7 (Exceeded budget!)
      } else if (i === 3) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'poultry_fish', category: 'diet', label: 'Poultry or Fish Meal', value: 2, unit: 'meal', co2e: 2.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'train', category: 'transport', label: 'Train / Metro', value: 25, unit: 'km', co2e: 1.0, timestamp: date.toISOString() }
        ];
      } else if (i === 2) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegan', category: 'diet', label: 'Vegan Meal', value: 3, unit: 'meal', co2e: 0.9, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'bike_walk', category: 'transport', label: 'Bike or Walk', value: 10, unit: 'km', co2e: 0.0, timestamp: date.toISOString() },
          { id: `eco_${dateStr}`, optionId: 'eco_savings', category: 'energy', label: 'Eco-Mode Appliances', value: 1, unit: 'savings day', co2e: -0.5, timestamp: date.toISOString() }
        ];
        defaultData.challenges[0].completed = true;
        defaultData.challenges[1].completed = true;
        defaultData.challenges[2].completed = true;
      } else if (i === 1) {
        // Yesterday's demo entry
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegetarian', category: 'diet', label: 'Vegetarian Meal', value: 2, unit: 'meal', co2e: 1.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'carpool', category: 'transport', label: 'Carpool / Rideshare', value: 15, unit: 'km', co2e: 1.65, timestamp: date.toISOString() }
        ];
        defaultData.challenges[4].completed = true; // Eco shower completed
      }

      records[dateStr] = defaultData;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    return records;
  });

  // --- STATE 2: selectedDate ---
  // Tracks which day is currently active in the dashboard date-navigator
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  // --- DERIVED STATE: streak ---
  // Calculates consecutive daily active streaks.
  // Recomputed dynamically using useMemo only when dailyRecords changes.
  const streak = useMemo(() => {
    const dates = Object.keys(dailyRecords).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    if (dates.length === 0) {
      return 0;
    }

    let currentStreak = 0;
    const todayStr = getLocalDateString();
    
    // Determine the starting point of streak calculation (today vs yesterday)
    const checkDate = new Date();
    const todayData = dailyRecords[todayStr];
    
    // If today has no logged actions (more than baseline electricity) and no completed challenges,
    // start checking back from yesterday so the streak doesn't immediately drop to 0.
    const hasTodayActivity = todayData && (todayData.entries.length > 1 || todayData.challenges.some(c => c.completed));
    if (!hasTodayActivity) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateKey = getLocalDateString(checkDate);
      const dayData = dailyRecords[dateKey];
      
      if (!dayData) {
        break; // Streak broken: no record exists for this day
      }

      const dayTotal = dayData.entries.reduce((sum, entry) => sum + entry.co2e, 0);
      const completedChallenges = dayData.challenges.filter(c => c.completed).length;

      // Streak condition: either stay under daily budget OR complete at least 1 green challenge
      const hasActivities = dayData.entries.length > 0;
      if (hasActivities && (dayTotal <= dayData.budgetCO2 || completedChallenges > 0)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1); // Move back one calendar day
      } else {
        break; // Streak broken: exceeded budget without completing challenges
      }
    }

    return currentStreak;
  }, [dailyRecords]);

  // Seeding/Reset helper (typically triggered from manual "Reset Demo Data" action)
  const initializeDefaultData = () => {
    const records: Record<string, DailyData> = {};
    const today = new Date();

    for (let i = 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(date);
      
      const defaultData = generateDefaultDailyData(dateStr);
      
      if (i === 7) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'beef_pork', category: 'diet', label: 'Red Meat Meal', value: 1, unit: 'meal', co2e: 3.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'drive_solo', category: 'transport', label: 'Drive Solo (Gasoline Car)', value: 20, unit: 'km', co2e: 4.4, timestamp: date.toISOString() }
        ];
      } else if (i === 6) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegan', category: 'diet', label: 'Vegan Meal', value: 2, unit: 'meal', co2e: 0.6, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'bike_walk', category: 'transport', label: 'Bike or Walk', value: 8, unit: 'km', co2e: 0.0, timestamp: date.toISOString() }
        ];
        defaultData.challenges[0].completed = true;
        defaultData.challenges[1].completed = true;
      } else if (i === 5) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegetarian', category: 'diet', label: 'Vegetarian Meal', value: 2, unit: 'meal', co2e: 1.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'bus', category: 'transport', label: 'Public Bus', value: 15, unit: 'km', co2e: 1.2, timestamp: date.toISOString() }
        ];
      } else if (i === 4) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'beef_pork', category: 'diet', label: 'Red Meat Meal', value: 2, unit: 'meal', co2e: 6.4, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'drive_solo', category: 'transport', label: 'Drive Solo (Gasoline Car)', value: 35, unit: 'km', co2e: 7.7, timestamp: date.toISOString() }
        ];
      } else if (i === 3) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'poultry_fish', category: 'diet', label: 'Poultry or Fish Meal', value: 2, unit: 'meal', co2e: 2.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'train', category: 'transport', label: 'Train / Metro', value: 25, unit: 'km', co2e: 1.0, timestamp: date.toISOString() }
        ];
      } else if (i === 2) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegan', category: 'diet', label: 'Vegan Meal', value: 3, unit: 'meal', co2e: 0.9, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'bike_walk', category: 'transport', label: 'Bike or Walk', value: 10, unit: 'km', co2e: 0.0, timestamp: date.toISOString() },
          { id: `eco_${dateStr}`, optionId: 'eco_savings', category: 'energy', label: 'Eco-Mode Appliances', value: 1, unit: 'savings day', co2e: -0.5, timestamp: date.toISOString() }
        ];
        defaultData.challenges[0].completed = true;
        defaultData.challenges[1].completed = true;
        defaultData.challenges[2].completed = true;
      } else if (i === 1) {
        defaultData.entries = [
          { id: `base_${dateStr}`, optionId: 'electricity_base', category: 'energy', label: 'Grid Electricity (Baseline)', value: 8, unit: 'kWh', co2e: 3.6, timestamp: date.toISOString() },
          { id: `food_${dateStr}`, optionId: 'vegetarian', category: 'diet', label: 'Vegetarian Meal', value: 2, unit: 'meal', co2e: 1.2, timestamp: date.toISOString() },
          { id: `trans_${dateStr}`, optionId: 'carpool', category: 'transport', label: 'Carpool / Rideshare', value: 15, unit: 'km', co2e: 1.65, timestamp: date.toISOString() }
        ];
        defaultData.challenges[4].completed = true;
      }

      records[dateStr] = defaultData;
    }

    setDailyRecords(records);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  };

  // Helper function to save records state to both memory and localStorage
  const saveRecords = (updatedRecords: Record<string, DailyData>) => {
    setDailyRecords(updatedRecords);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRecords));
  };

  // Retrieves data for the selected date; returns initialized default if date is unrecorded
  const getCurrentData = (): DailyData => {
    if (!dailyRecords[selectedDate]) {
      return generateDefaultDailyData(selectedDate);
    }
    return dailyRecords[selectedDate];
  };

  // Adds an activity entry logs list for selectedDate
  const addEntry = (optionId: string, value: number, label: string, unit: string, category: 'transport' | 'diet' | 'energy' | 'waste') => {
    const current = dailyRecords[selectedDate] || generateDefaultDailyData(selectedDate);
    const co2e = calculateEmission(optionId, value);
    
    const newEntry: ActivityEntry = {
      id: `${optionId}_${Date.now()}`,
      optionId,
      category,
      label,
      value,
      unit,
      co2e,
      timestamp: new Date().toISOString()
    };

    const updatedData: DailyData = {
      ...current,
      entries: [...current.entries, newEntry]
    };

    const updatedRecords = {
      ...dailyRecords,
      [selectedDate]: updatedData
    };
    saveRecords(updatedRecords);
  };

  // Deletes an activity entry logs list for selectedDate
  const deleteEntry = (entryId: string) => {
    const current = dailyRecords[selectedDate];
    if (!current) return;

    const updatedData: DailyData = {
      ...current,
      entries: current.entries.filter(e => e.id !== entryId)
    };

    const updatedRecords = {
      ...dailyRecords,
      [selectedDate]: updatedData
    };
    saveRecords(updatedRecords);
  };

  // Toggles completed status of a challenge, updating streaks and injecting negative offset entries
  const toggleChallenge = (challengeId: string) => {
    const current = dailyRecords[selectedDate] || generateDefaultDailyData(selectedDate);
    
    const updatedChallenges = current.challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const nextCompleted = !challenge.completed;
        const nextStreak = nextCompleted ? challenge.streak + 1 : Math.max(0, challenge.streak - 1);
        
        return {
          ...challenge,
          completed: nextCompleted,
          streak: nextStreak
        };
      }
      return challenge;
    });

    const updatedData: DailyData = {
      ...current,
      challenges: updatedChallenges,
      entries: [...current.entries]
    };

    // Calculate negative offset savings additions or removal
    const specificCh = current.challenges.find(c => c.id === challengeId);
    if (specificCh) {
      if (!specificCh.completed) {
        // Toggle completed: inject negative footprint saving entry
        updatedData.entries = [
          ...updatedData.entries.filter(e => e.id !== `saving_${challengeId}`),
          {
            id: `saving_${challengeId}`,
            optionId: 'challenge_saving',
            category: specificCh.category,
            label: `Challenge: ${specificCh.title}`,
            value: 1,
            unit: 'saving',
            co2e: -specificCh.co2Saving,
            timestamp: new Date().toISOString()
          }
        ];
      } else {
        // Toggle uncompleted: remove saving offset entry
        updatedData.entries = updatedData.entries.filter(e => e.id !== `saving_${challengeId}`);
      }
    }

    const updatedRecords = {
      ...dailyRecords,
      [selectedDate]: updatedData
    };
    saveRecords(updatedRecords);
  };

  // Modifies budget limits dynamically for selectedDate
  const updateBudget = (newBudget: number) => {
    const current = dailyRecords[selectedDate] || generateDefaultDailyData(selectedDate);
    const updatedData: DailyData = {
      ...current,
      budgetCO2: newBudget
    };
    const updatedRecords = {
      ...dailyRecords,
      [selectedDate]: updatedData
    };
    saveRecords(updatedRecords);
  };

  // Assembles historical data for the past 7 days to fuel SVG Analytics rendering
  const getWeeklyHistory = () => {
    const history = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(date);
      const dayData = dailyRecords[dateStr] || generateDefaultDailyData(dateStr);
      
      const totalCO2 = dayData.entries.reduce((sum, entry) => sum + entry.co2e, 0);
      
      const transport = dayData.entries.filter(e => e.category === 'transport').reduce((sum, entry) => sum + entry.co2e, 0);
      const diet = dayData.entries.filter(e => e.category === 'diet').reduce((sum, entry) => sum + entry.co2e, 0);
      const energy = dayData.entries.filter(e => e.category === 'energy').reduce((sum, entry) => sum + entry.co2e, 0);
      const waste = dayData.entries.filter(e => e.category === 'waste').reduce((sum, entry) => sum + entry.co2e, 0);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      history.push({
        dateStr,
        dayName,
        total: Number(totalCO2.toFixed(1)),
        budget: dayData.budgetCO2,
        transport: Number(transport.toFixed(1)),
        diet: Number(diet.toFixed(1)),
        energy: Number(energy.toFixed(1)),
        waste: Number(waste.toFixed(1)),
      });
    }
    return history;
  };

  return {
    dailyRecords,
    selectedDate,
    setSelectedDate,
    getCurrentData,
    addEntry,
    deleteEntry,
    toggleChallenge,
    streak,
    getWeeklyHistory,
    updateBudget,
    resetData: initializeDefaultData
  };
};
