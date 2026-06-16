import { describe, it, expect } from 'vitest';
import { 
  calculateEmission, 
  generateDefaultDailyData, 
  getPersonalizedInsights
} from './carbonEngine';

describe('Carbon Compass Calculations', () => {
  it('should correctly calculate transport emissions', () => {
    // 20 km of solo driving: 20 * 0.22 = 4.4 kg CO2e
    expect(calculateEmission('drive_solo', 20)).toBe(4.4);
    // 20 km of train travel: 20 * 0.04 = 0.8 kg CO2e
    expect(calculateEmission('train', 20)).toBe(0.8);
    // 20 km of walking/biking: 20 * 0 = 0 kg CO2e
    expect(calculateEmission('bike_walk', 20)).toBe(0);
  });

  it('should correctly calculate dietary emissions', () => {
    // 2 red meat meals: 2 * 3.2 = 6.4 kg CO2e
    expect(calculateEmission('beef_pork', 2)).toBe(6.4);
    // 1 vegan meal: 1 * 0.3 = 0.3 kg CO2e
    expect(calculateEmission('vegan', 1)).toBe(0.3);
  });

  it('should return offsets as negative values', () => {
    // 1 day composting: 1 * -0.3 = -0.3 kg CO2e
    expect(calculateEmission('composted_food', 1)).toBe(-0.3);
  });
});

describe('Personalized Nudges & Insights Engine', () => {
  it('should prompt user to complete challenges if none are completed', () => {
    const data = generateDefaultDailyData('2026-06-16');
    const insights = getPersonalizedInsights(data);
    expect(insights.some(tip => tip.includes('checking off a challenge'))).toBe(true);
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
