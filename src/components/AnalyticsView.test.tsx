import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AnalyticsView } from './AnalyticsView';

describe('AnalyticsView Component', () => {
  const mockHistory = [
    { dateStr: '2026-06-10', dayName: 'Wed', total: 10, budget: 15, transport: 4, diet: 3, energy: 2, waste: 1 },
    { dateStr: '2026-06-11', dayName: 'Thu', total: 12, budget: 15, transport: 5, diet: 3, energy: 2, waste: 2 },
    { dateStr: '2026-06-12', dayName: 'Fri', total: 8, budget: 15, transport: 2, diet: 2, energy: 3, waste: 1 },
    { dateStr: '2026-06-13', dayName: 'Sat', total: 5, budget: 15, transport: 1, diet: 1, energy: 2, waste: 1 },
    { dateStr: '2026-06-14', dayName: 'Sun', total: 15, budget: 15, transport: 6, diet: 4, energy: 3, waste: 2 },
    { dateStr: '2026-06-15', dayName: 'Mon', total: 11, budget: 15, transport: 3, diet: 3, energy: 4, waste: 1 },
    { dateStr: '2026-06-16', dayName: 'Tue', total: 9, budget: 15, transport: 2, diet: 2, energy: 3, waste: 2 },
  ];

  afterEach(() => {
    cleanup();
  });

  it('should render the title and average stats correctly', () => {
    render(<AnalyticsView history={mockHistory} />);
    
    expect(screen.getByText('Emissions Analytics')).toBeTruthy();
    expect(screen.getByText('7-Day Average')).toBeTruthy();
    
    // Average total = (10+12+8+5+15+11+9)/7 = 70/7 = 10.0
    expect(screen.getByText('10.0')).toBeTruthy();
  });

  it('should render correct averages for categories', () => {
    render(<AnalyticsView history={mockHistory} />);
    
    // Transport average: (4+5+2+1+6+3+2)/7 = 23/7 = 3.3
    expect(screen.getByText('3.3 kg CO₂e')).toBeTruthy();

    // Diet average: (3+3+2+1+4+3+2)/7 = 18/7 = 2.6
    expect(screen.getByText('2.6 kg CO₂e')).toBeTruthy();

    // Energy average: (2+2+3+2+3+4+3)/7 = 19/7 = 2.7
    expect(screen.getByText('2.7 kg CO₂e')).toBeTruthy();

    // Waste average: (1+2+1+1+2+1+2)/7 = 10/7 = 1.4
    expect(screen.getByText('1.4 kg CO₂e')).toBeTruthy();
  });

  it('should render the bars for each day', () => {
    const { container } = render(<AnalyticsView history={mockHistory} />);
    
    // Verify SVG is rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Verify daily totals labels are shown
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
    expect(screen.getAllByText('11').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
  });
});
