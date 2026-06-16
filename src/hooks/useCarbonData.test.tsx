import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { useCarbonData } from './useCarbonData';

type HookReturnType = ReturnType<typeof useCarbonData>;

// A dummy component to test the custom hook
const TestComponent = ({ onHookValue }: { onHookValue: (val: HookReturnType) => void }) => {
  const hookValue = useCarbonData();
  onHookValue(hookValue);
  return <div data-testid="hook-loaded">Loaded</div>;
};

describe('useCarbonData hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should initialize default daily records and streak', () => {
    let hookData: HookReturnType | null = null;
    render(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    expect(screen.getByTestId('hook-loaded')).toBeTruthy();
    expect(hookData).toBeDefined();
    expect(hookData!.selectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof hookData!.streak).toBe('number');
    
    const current = hookData!.getCurrentData();
    expect(current.budgetCO2).toBe(15.0);
    expect(current.entries.length).toBe(1); // Grid Electricity Baseline
  });

  it('should allow adding and deleting activity entries', () => {
    let hookData: HookReturnType | null = null;
    const { rerender } = render(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    // Add entry
    act(() => {
      hookData!.addEntry('drive_solo', 25, 'Solo Drive test', 'km', 'transport');
    });
    rerender(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    let current = hookData!.getCurrentData();
    expect(current.entries.length).toBe(2);
    expect(current.entries[1].label).toBe('Solo Drive test');
    expect(current.entries[1].co2e).toBe(5.5); // 25 * 0.22 = 5.5

    // Delete entry
    act(() => {
      hookData!.deleteEntry(current.entries[1].id);
    });
    rerender(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    current = hookData!.getCurrentData();
    expect(current.entries.length).toBe(1); // back to baseline
  });

  it('should allow toggling challenges', () => {
    let hookData: HookReturnType | null = null;
    const { rerender } = render(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    const currentBefore = hookData!.getCurrentData();
    const challengeId = currentBefore.challenges[0].id;
    expect(currentBefore.challenges[0].completed).toBe(false);

    // Toggle challenge to complete
    act(() => {
      hookData!.toggleChallenge(challengeId);
    });
    rerender(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    let currentAfter = hookData!.getCurrentData();
    expect(currentAfter.challenges[0].completed).toBe(true);

    // Toggle challenge back to incomplete
    act(() => {
      hookData!.toggleChallenge(challengeId);
    });
    rerender(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    currentAfter = hookData!.getCurrentData();
    expect(currentAfter.challenges[0].completed).toBe(false);
  });

  it('should allow updating the daily budget limit', () => {
    let hookData: HookReturnType | null = null;
    const { rerender } = render(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    act(() => {
      hookData!.updateBudget(12.5);
    });
    rerender(<TestComponent onHookValue={(val) => { hookData = val; }} />);

    const current = hookData!.getCurrentData();
    expect(current.budgetCO2).toBe(12.5);
  });
});
