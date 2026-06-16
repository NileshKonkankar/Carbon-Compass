import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { QuickLogger } from './QuickLogger';

describe('QuickLogger Component', () => {
  const mockOnClose = vi.fn();
  const mockOnAddEntry = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnAddEntry.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <QuickLogger isOpen={false} onClose={mockOnClose} onAddEntry={mockOnAddEntry} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render correct title and categories when open', () => {
    render(
      <QuickLogger isOpen={true} onClose={mockOnClose} onAddEntry={mockOnAddEntry} />
    );
    expect(screen.getByRole('heading', { name: 'Log Activity' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /transport/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /diet/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /energy/i })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /waste/i })).toBeTruthy();
  });

  it('should switch tabs and update selected option', () => {
    render(
      <QuickLogger isOpen={true} onClose={mockOnClose} onAddEntry={mockOnAddEntry} />
    );

    // Default tab should be transport
    expect(screen.getByRole('tab', { name: /transport/i }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Drive Solo (Gasoline Car)')).toBeTruthy();

    // Click on Diet tab
    const dietTab = screen.getByRole('tab', { name: /diet/i });
    fireEvent.click(dietTab);

    expect(dietTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Red Meat Meal')).toBeTruthy();
  });

  it('should change inputs and trigger log entry callback', () => {
    render(
      <QuickLogger isOpen={true} onClose={mockOnClose} onAddEntry={mockOnAddEntry} />
    );

    // Select different transport option: Bus
    const busOption = screen.getByRole('button', { name: /public bus/i });
    fireEvent.click(busOption);

    // Input value change
    const input = screen.getByLabelText(/amount \(km\)/i);
    fireEvent.change(input, { target: { value: '25' } });

    // Click Log
    const logButton = screen.getByRole('button', { name: /log activity/i });
    fireEvent.click(logButton);

    expect(mockOnAddEntry).toHaveBeenCalledTimes(1);
    expect(mockOnAddEntry).toHaveBeenCalledWith(
      'bus',
      25,
      'Public Bus (25 km)',
      'km',
      'transport'
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle cancel click', () => {
    render(
      <QuickLogger isOpen={true} onClose={mockOnClose} onAddEntry={mockOnAddEntry} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle backdrop click', () => {
    const { container } = render(
      <QuickLogger isOpen={true} onClose={mockOnClose} onAddEntry={mockOnAddEntry} />
    );

    const backdrop = container.querySelector('.drawer-backdrop');
    expect(backdrop).toBeTruthy();
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should trigger onClose when Escape key is pressed', () => {
    render(
      <QuickLogger isOpen={true} onClose={mockOnClose} onAddEntry={mockOnAddEntry} />
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
