import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('should render the dashboard layout with header and sidebars', () => {
    render(<App />);
    
    // Check main title
    expect(screen.getByRole('heading', { name: 'Carbon Compass' })).toBeTruthy();
    
    // Check initial budget settings
    expect(screen.getByLabelText(/Daily Limit Target:/i)).toBeTruthy();
    
    // Check activity list heading
    expect(screen.getByRole('heading', { name: 'Logged Activities' })).toBeTruthy();
  });

  it('should switch between daily habits and weekly trends tabs', () => {
    render(<App />);
    
    const dailyTab = screen.getByRole('tab', { name: /Daily Habits & Challenges/i });
    const weeklyTab = screen.getByRole('tab', { name: /Weekly Trends/i });

    expect(dailyTab.getAttribute('aria-selected')).toBe('true');
    expect(weeklyTab.getAttribute('aria-selected')).toBe('false');

    // Click weekly tab
    fireEvent.click(weeklyTab);

    expect(dailyTab.getAttribute('aria-selected')).toBe('false');
    expect(weeklyTab.getAttribute('aria-selected')).toBe('true');
    
    // Under weekly tab, we should see the Emissions Analytics section
    expect(screen.getByRole('heading', { name: 'Emissions Analytics' })).toBeTruthy();
  });

  it('should open the logger drawer when clicking Log New Activity', () => {
    render(<App />);
    
    const logButton = screen.getByRole('button', { name: /Log New Activity/i });
    fireEvent.click(logButton);

    // Dialog title should now be visible
    expect(screen.getByRole('heading', { name: 'Log Activity' })).toBeTruthy();
  });
});
