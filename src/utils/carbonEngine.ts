export type CategoryType = 'transport' | 'diet' | 'energy' | 'waste';

export interface ActivityOption {
  id: string;
  category: CategoryType;
  label: string;
  sublabel: string;
  unit: string;
  factor: number; // kg CO2e per unit
  icon: string;
  defaultValue: number;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  // Transport
  { id: 'drive_solo', category: 'transport', label: 'Drive Solo (Gasoline Car)', sublabel: 'Average passenger car', unit: 'km', factor: 0.22, icon: 'Car', defaultValue: 15 },
  { id: 'carpool', category: 'transport', label: 'Carpool / Rideshare', sublabel: 'Shared ride with others', unit: 'km', factor: 0.11, icon: 'Users', defaultValue: 15 },
  { id: 'bus', category: 'transport', label: 'Public Bus', sublabel: 'Standard city bus commute', unit: 'km', factor: 0.08, icon: 'Bus', defaultValue: 10 },
  { id: 'train', category: 'transport', label: 'Train / Metro', sublabel: 'Electric transit train', unit: 'km', factor: 0.04, icon: 'Train', defaultValue: 20 },
  { id: 'bike_walk', category: 'transport', label: 'Bike or Walk', sublabel: 'Active zero-emission transit', unit: 'km', factor: 0, icon: 'Footprints', defaultValue: 5 },
  
  // Diet
  { id: 'beef_pork', category: 'diet', label: 'Red Meat Meal', sublabel: 'Beef, pork, or lamb', unit: 'meal', factor: 3.2, icon: 'Beef', defaultValue: 1 },
  { id: 'poultry_fish', category: 'diet', label: 'Poultry or Fish Meal', sublabel: 'Chicken, turkey, or fish', unit: 'meal', factor: 1.1, icon: 'Fish', defaultValue: 1 },
  { id: 'vegetarian', category: 'diet', label: 'Vegetarian Meal', sublabel: 'Dairy, eggs, no meat', unit: 'meal', factor: 0.6, icon: 'Egg', defaultValue: 1 },
  { id: 'vegan', category: 'diet', label: 'Vegan Meal', sublabel: 'Strictly plant-based', unit: 'meal', factor: 0.3, icon: 'Leaf', defaultValue: 1 },
  
  // Energy
  { id: 'electricity_base', category: 'energy', label: 'Grid Electricity', sublabel: 'Average home power consumption', unit: 'kWh', factor: 0.45, icon: 'Zap', defaultValue: 8 },
  { id: 'ac_heating', category: 'energy', label: 'AC or Space Heater', sublabel: 'Climate control operation', unit: 'hour', factor: 0.85, icon: 'Thermometer', defaultValue: 3 },
  { id: 'washing_machine', category: 'energy', label: 'Laundry (Warm Wash)', sublabel: 'Standard washing cycle', unit: 'cycle', factor: 0.6, icon: 'Wind', defaultValue: 1 },
  { id: 'eco_savings', category: 'energy', label: 'Eco-Mode Appliances', sublabel: 'Using eco/cold cycles', unit: 'savings day', factor: -0.5, icon: 'ShieldAlert', defaultValue: 1 },

  // Waste & Consumption
  { id: 'bought_new_clothes', category: 'waste', label: 'Bought New Clothes', sublabel: 'Apparel or shoe purchase', unit: 'item', factor: 6.0, icon: 'ShoppingBag', defaultValue: 1 },
  { id: 'recycled_waste', category: 'waste', label: 'Recycled Paper/Plastic', sublabel: 'Full day of sorting recyclables', unit: 'recycled day', factor: -0.4, icon: 'Recycle', defaultValue: 1 },
  { id: 'composted_food', category: 'waste', label: 'Composted Food Waste', sublabel: 'Food scrap composting', unit: 'compost day', factor: -0.3, icon: 'Sprout', defaultValue: 1 },
  { id: 'landfill_waste', category: 'waste', label: 'General Landfill Waste', sublabel: 'Unsorted household trash', unit: 'bag', factor: 1.5, icon: 'Trash2', defaultValue: 1 },
];

export interface ActivityEntry {
  id: string;
  optionId: string;
  category: CategoryType;
  label: string;
  value: number;
  unit: string;
  co2e: number; // in kg
  timestamp: string; // ISO String
}

export interface HabitChallenge {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  co2Saving: number; // estimated daily saving in kg
  completed: boolean;
  streak: number;
}

export interface DailyData {
  date: string; // YYYY-MM-DD
  budgetCO2: number; // standard limit, e.g. 15.0 kg
  entries: ActivityEntry[];
  challenges: HabitChallenge[];
}

export const DEFAULT_BUDGET = 15.0; // Daily budget in kg CO2e

export const INITIAL_CHALLENGES: HabitChallenge[] = [
  { id: 'c_bike', title: 'Bike/Walk to Work/School', description: 'Replace any car trip with biking, walking, or skating.', category: 'transport', co2Saving: 2.5, completed: false, streak: 0 },
  { id: 'c_vegan', title: 'Go Plant-Based for a Day', description: 'Eat only plant-based meals today (no meat, dairy, or eggs).', category: 'diet', co2Saving: 3.5, completed: false, streak: 0 },
  { id: 'c_unplug', title: 'Unplug Standby Devices', description: 'Unplug chargers and appliances when not actively in use.', category: 'energy', co2Saving: 0.3, completed: false, streak: 0 },
  { id: 'c_recycle', title: 'Zero Food Waste Day', description: 'Ensure no food is thrown into general waste; compost or eat leftovers.', category: 'waste', co2Saving: 0.8, completed: false, streak: 0 },
  { id: 'c_eco_shower', title: 'Shorten Showers to 5 Mins', description: 'Save hot water energy by limiting showers.', category: 'energy', co2Saving: 0.6, completed: false, streak: 0 },
];

// Helper to get formatted date
export const getLocalDateString = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate entry emission
export const calculateEmission = (optionId: string, value: number): number => {
  const option = ACTIVITY_OPTIONS.find(opt => opt.id === optionId);
  if (!option) return 0;
  return Number((value * option.factor).toFixed(2));
};

// Generate default daily statistics if none exist
export const generateDefaultDailyData = (dateStr: string): DailyData => {
  return {
    date: dateStr,
    budgetCO2: DEFAULT_BUDGET,
    entries: [
      // pre-populate electricity base for baseline
      {
        id: `entry_base_${dateStr}`,
        optionId: 'electricity_base',
        category: 'energy',
        label: 'Grid Electricity (Baseline)',
        value: 8,
        unit: 'kWh',
        co2e: calculateEmission('electricity_base', 8),
        timestamp: new Date().toISOString()
      }
    ],
    challenges: INITIAL_CHALLENGES.map(c => ({ ...c }))
  };
};

export const getPersonalizedInsights = (currentData: DailyData): string[] => {
  const insights: string[] = [];
  
  // Calculate total categories for the day
  const categoryTotals = currentData.entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.co2e;
    return acc;
  }, {} as Record<CategoryType, number>);

  const totalEmissions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Challenge completion check
  const completedCount = currentData.challenges.filter(c => c.completed).length;
  if (completedCount === 0) {
    insights.push("💡 Tip: Try checking off a challenge! Completing 'Go Plant-Based for a Day' can save up to 3.5 kg of CO₂e.");
  } else if (completedCount >= 3) {
    insights.push("🔥 Awesome job! You've checked off multiple challenges today. Keep the green streak alive!");
  }

  // Energy emissions check
  const energyCO2 = categoryTotals['energy'] || 0;
  if (energyCO2 > 6.0) {
    insights.push("🔌 High heating/cooling or power use detected. Lowering your thermostat by 1°C can save up to 10% on energy emissions.");
  }

  // Transport check
  const transitEntries = currentData.entries.filter(e => e.category === 'transport');
  const droveSolo = transitEntries.some(e => e.optionId === 'drive_solo' && e.value > 15);
  if (droveSolo) {
    insights.push("🚗 Drove solo today? Try carpooling or planning transit routes for a 50% drop in transport footprint.");
  }

  // Food check
  const dietCO2 = categoryTotals['diet'] || 0;
  if (dietCO2 > 4.0) {
    insights.push("🥩 Red meat has a high carbon intensity. Substituting beef with poultry or plant-based meals cuts diet emissions dramatically.");
  }

  // Default encouraging messages if footprint is low
  if (totalEmissions <= currentData.budgetCO2 && insights.length < 2) {
    insights.push("🌱 You are currently staying below your carbon budget! Excellent conservation choices today.");
  }

  return insights;
};
