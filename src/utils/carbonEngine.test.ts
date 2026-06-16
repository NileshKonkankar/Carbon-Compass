import { describe, it, expect } from 'vitest';
import { 
  calculateEmission, 
  generateDefaultDailyData, 
  getPersonalizedInsights,
  getLocalDateString,
  ACTIVITY_OPTIONS
} from './carbonEngine';

describe('Carbon Compass Calculations', () => {
  it('should correctly calculate transport emissions', () => {
    // 20 km of solo driving: 20 * 0.22 = 4.4 kg CO2e
    expect(calculateEmission('drive_solo', 20)).toBe(4.4);
    // 20 km of carpool: 20 * 0.11 = 2.2 kg CO2e
    expect(calculateEmission('carpool', 20)).toBe(2.2);
    // 10 km of public bus: 10 * 0.08 = 0.8 kg CO2e
    expect(calculateEmission('bus', 10)).toBe(0.8);
    // 20 km of train travel: 20 * 0.04 = 0.8 kg CO2e
    expect(calculateEmission('train', 20)).toBe(0.8);
    // 20 km of walking/biking: 20 * 0 = 0 kg CO2e
    expect(calculateEmission('bike_walk', 20)).toBe(0);
  });

  it('should correctly calculate dietary emissions', () => {
    // 2 red meat meals: 2 * 3.2 = 6.4 kg CO2e
    expect(calculateEmission('beef_pork', 2)).toBe(6.4);
    // 1 poultry/fish meal: 1.1 kg CO2e
    expect(calculateEmission('poultry_fish', 1)).toBe(1.1);
    // 2 vegetarian meals: 2 * 0.6 = 1.2 kg CO2e
    expect(calculateEmission('vegetarian', 2)).toBe(1.2);
    // 1 vegan meal: 1 * 0.3 = 0.3 kg CO2e
    expect(calculateEmission('vegan', 1)).toBe(0.3);
  });

  it('should correctly calculate energy emissions', () => {
    // 10 kWh electricity: 10 * 0.45 = 4.5 kg CO2e
    expect(calculateEmission('electricity_base', 10)).toBe(4.5);
    // 4 hours AC: 4 * 0.85 = 3.4 kg CO2e
    expect(calculateEmission('ac_heating', 4)).toBe(3.4);
    // 2 washing cycles: 2 * 0.6 = 1.2 kg CO2e
    expect(calculateEmission('washing_machine', 2)).toBe(1.2);
  });

  it('should correctly calculate waste emissions', () => {
    // 2 new clothes: 2 * 6.0 = 12.0 kg CO2e
    expect(calculateEmission('bought_new_clothes', 2)).toBe(12.0);
    // 2 landfill bags: 2 * 1.5 = 3.0 kg CO2e
    expect(calculateEmission('landfill_waste', 2)).toBe(3.0);
  });

  it('should return offsets as negative values', () => {
    // 1 day composting: 1 * -0.3 = -0.3 kg CO2e
    expect(calculateEmission('composted_food', 1)).toBe(-0.3);
    // 1 day recycling: 1 * -0.4 = -0.4 kg CO2e
    expect(calculateEmission('recycled_waste', 1)).toBe(-0.4);
    // 1 day eco-appliance: 1 * -0.5 = -0.5 kg CO2e
    expect(calculateEmission('eco_savings', 1)).toBe(-0.5);
  });

  it('should return 0 for invalid or unknown option IDs', () => {
    expect(calculateEmission('unknown_option_id', 10)).toBe(0);
    expect(calculateEmission('', 5)).toBe(0);
  });

  it('should handle zero or negative input values safely', () => {
    expect(calculateEmission('drive_solo', 0)).toBe(0);
    expect(calculateEmission('drive_solo', -10)).toBe(-2.2); // Factor multiplication handles negative mathematically
  });
});

describe('Date Helper Functions', () => {
  it('should format date string as YYYY-MM-DD', () => {
    const testDate = new Date('2026-06-16T12:00:00');
    expect(getLocalDateString(testDate)).toBe('2026-06-16');
  });

  it('should fall back to current date if no date provided', () => {
    const todayStr = getLocalDateString();
    expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Default Daily Data Generation', () => {
  it('should initialize default structure for any date string', () => {
    const data = generateDefaultDailyData('2026-07-20');
    expect(data.date).toBe('2026-07-20');
    expect(data.budgetCO2).toBe(15.0);
    expect(data.entries.length).toBe(1);
    expect(data.entries[0].optionId).toBe('electricity_base');
    expect(data.entries[0].co2e).toBe(3.6); // 8 kWh * 0.45 = 3.6
    expect(data.challenges.length).toBe(5);
    expect(data.challenges.every(c => !c.completed)).toBe(true);
  });
});

describe('Personalized Nudges & Insights Engine', () => {
  it('should prompt user to complete challenges if none are completed', () => {
    const data = generateDefaultDailyData('2026-06-16');
    const insights = getPersonalizedInsights(data);
    expect(insights.some(tip => tip.includes('checking off a challenge'))).toBe(true);
  });

  it('should celebrate if 3 or more challenges are completed', () => {
    const data = generateDefaultDailyData('2026-06-16');
    data.challenges[0].completed = true;
    data.challenges[1].completed = true;
    data.challenges[2].completed = true;
    const insights = getPersonalizedInsights(data);
    expect(insights.some(tip => tip.includes('Awesome job! You\'ve checked off'))).toBe(true);
  });

  it('should trigger warning for high electricity/energy usage', () => {
    const data = generateDefaultDailyData('2026-06-16');
    // Add space heater entry: 8 hours * 0.85 = 6.8 kg CO2e
    data.entries.push({
      id: 'test_ac',
      optionId: 'ac_heating',
      category: 'energy',
      label: 'AC/Heating',
      value: 8,
      unit: 'hour',
      co2e: 6.8,
      timestamp: new Date().toISOString()
    });

    const insights = getPersonalizedInsights(data);
    expect(insights.some(tip => tip.toLowerCase().includes('high heating/cooling'))).toBe(true);
  });

  it('should trigger warning for driving solo', () => {
    const data = generateDefaultDailyData('2026-06-16');
    data.entries.push({
      id: 'test_drive',
      optionId: 'drive_solo',
      category: 'transport',
      label: 'Drive Solo',
      value: 20,
      unit: 'km',
      co2e: 4.4,
      timestamp: new Date().toISOString()
    });

    const insights = getPersonalizedInsights(data);
    expect(insights.some(tip => tip.includes('Drove solo today'))).toBe(true);
  });

  it('should trigger warning for high red meat diet', () => {
    const data = generateDefaultDailyData('2026-06-16');
    data.entries.push({
      id: 'test_beef',
      optionId: 'beef_pork',
      category: 'diet',
      label: 'Red Meat Meal',
      value: 2,
      unit: 'meal',
      co2e: 6.4,
      timestamp: new Date().toISOString()
    });

    const insights = getPersonalizedInsights(data);
    expect(insights.some(tip => tip.includes('Red meat has a high carbon intensity'))).toBe(true);
  });

  it('should display encouraging messages when footprint is low', () => {
    const data = generateDefaultDailyData('2026-06-16');
    // Baseline electricity (8 * 0.45 = 3.6 kg CO2e) is the only entry, which is below budget
    const insights = getPersonalizedInsights(data);
    expect(insights.some(tip => tip.includes('staying below your carbon budget'))).toBe(true);
  });
});

describe('Activity Options Data Checks', () => {
  it('should have valid configured factors and labels for all options', () => {
    expect(ACTIVITY_OPTIONS.length).toBeGreaterThan(10);
    ACTIVITY_OPTIONS.forEach(opt => {
      expect(opt.id).toBeTruthy();
      expect(opt.label).toBeTruthy();
      expect(opt.unit).toBeTruthy();
      expect(typeof opt.factor).toBe('number');
      expect(opt.defaultValue).toBeGreaterThan(0);
    });
  });
});
