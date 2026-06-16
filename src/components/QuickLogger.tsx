import React, { useState } from 'react';
import { ACTIVITY_OPTIONS, calculateEmission } from '../utils/carbonEngine';
import type { ActivityOption } from '../utils/carbonEngine';
import { Icons } from './Icons';

interface QuickLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: (optionId: string, value: number, label: string, unit: string, category: 'transport' | 'diet' | 'energy' | 'waste') => void;
}

export const QuickLogger: React.FC<QuickLoggerProps> = ({ isOpen, onClose, onAddEntry }) => {
  const [activeTab, setActiveTab] = useState<'transport' | 'diet' | 'energy' | 'waste'>('transport');
  const [selectedOption, setSelectedOption] = useState<ActivityOption | null>(
    ACTIVITY_OPTIONS.find(opt => opt.category === 'transport') || null
  );
  const [inputValue, setInputValue] = useState<number>(15);

  if (!isOpen) return null;

  const handleTabChange = (category: 'transport' | 'diet' | 'energy' | 'waste') => {
    setActiveTab(category);
    const firstOption = ACTIVITY_OPTIONS.find(opt => opt.category === category) || null;
    setSelectedOption(firstOption);
    if (firstOption) {
      setInputValue(firstOption.defaultValue);
    }
  };

  const handleOptionSelect = (option: ActivityOption) => {
    setSelectedOption(option);
    setInputValue(option.defaultValue);
  };

  const handleLog = () => {
    if (!selectedOption) return;
    const cleanValue = Number(inputValue);
    if (isNaN(cleanValue) || cleanValue <= 0) return;
    
    const displayLabel = `${selectedOption.label} (${cleanValue} ${selectedOption.unit})`;
    onAddEntry(selectedOption.id, cleanValue, displayLabel, selectedOption.unit, selectedOption.category);
    onClose();
  };

  const currentCO2 = selectedOption ? calculateEmission(selectedOption.id, inputValue) : 0;
  const isOffset = currentCO2 < 0;

  return (
    <>
      <div 
        className="drawer-backdrop" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div 
        className="drawer" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="logger-drawer-title"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid hsl(var(--card-border))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 id="logger-drawer-title" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>Log Activity</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', marginTop: '4px' }}>Track your daily carbon footprint contributors</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close activity logger"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--text-secondary))'
            }}
            className="btn-secondary"
          >
            <Icons name="X" size={18} />
          </button>
        </div>

        {/* Content Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* Tabs */}
          <div 
            role="tablist" 
            aria-label="Activity Categories"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '24px',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {(['transport', 'diet', 'energy', 'waste'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  padding: '8px 0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  textTransform: 'capitalize',
                  background: activeTab === tab ? 'hsl(var(--card-bg))' : 'transparent',
                  color: activeTab === tab ? 'white' : 'hsl(var(--text-secondary))',
                  border: activeTab === tab ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Activity Grid */}
          <div 
            role="group" 
            aria-label="Select an activity option"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px',
              marginBottom: '28px'
            }}
          >
            {ACTIVITY_OPTIONS.filter(opt => opt.category === activeTab).map(option => {
              const isSelected = selectedOption?.id === option.id;
              let catColor = 'var(--color-transport)';
              if (activeTab === 'diet') catColor = 'var(--color-diet)';
              if (activeTab === 'energy') catColor = 'var(--color-energy)';
              if (activeTab === 'waste') catColor = 'var(--color-waste)';

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  aria-pressed={isSelected}
                  aria-label={`${option.label}, factor ${option.factor === 0 ? '0' : option.factor > 0 ? `plus ${option.factor}` : option.factor} kilograms per ${option.unit}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: isSelected 
                      ? `1px solid hsl(${catColor})`
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'inherit'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: isSelected ? `rgba(255,255,255,0.06)` : 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? `hsl(${catColor})` : 'hsl(var(--text-secondary))'
                  }}>
                    <Icons name={option.icon} size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 500, display: 'block' }}>{option.label}</span>
                    <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>{option.sublabel}</span>
                  </div>
                  <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                    {option.factor === 0 ? '0' : option.factor > 0 ? `+${option.factor}` : option.factor} kg/{option.unit}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Value Configurator */}
          {selectedOption && (
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(0,0,0,0.15)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Configure Value</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label htmlFor="activity-value-input" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                  Amount ({selectedOption.unit})
                </label>
                <input
                  id="activity-value-input"
                  type="number"
                  value={inputValue}
                  min="0"
                  onChange={(e) => setInputValue(Math.max(0, Number(e.target.value)))}
                  style={{ width: '90px', textAlign: 'right' }}
                />
              </div>

              {/* Slider for quick adjustments */}
              <input
                type="range"
                aria-label={`Adjust amount in ${selectedOption.unit}`}
                min="1"
                max={selectedOption.category === 'transport' ? "100" : selectedOption.category === 'diet' ? "5" : "24"}
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'hsl(var(--primary))',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.1)'
                }}
              />

              {/* CO2 Impact Banner */}
              <div style={{
                background: isOffset ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: isOffset ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icons name={isOffset ? "Sparkles" : "Info"} style={{ color: isOffset ? 'hsl(var(--color-savings))' : 'hsl(var(--primary))' }} />
                  <span style={{ fontSize: '0.9rem', color: isOffset ? 'hsl(var(--color-savings))' : 'white', fontWeight: 500 }}>
                    {isOffset ? 'Carbon Saving Offset' : 'Estimated Carbon Impact'}
                  </span>
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: isOffset ? 'hsl(var(--color-savings))' : 'white'
                }}>
                  {isOffset ? '' : '+'}{currentCO2.toFixed(2)} kg CO₂e
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid hsl(var(--card-border))',
          background: 'rgba(15, 20, 18, 0.9)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ width: '100%' }}>Cancel</button>
          <button type="button" onClick={handleLog} className="btn-primary" style={{ width: '100%' }}>Log Activity</button>
        </div>

      </div>
    </>
  );
};
