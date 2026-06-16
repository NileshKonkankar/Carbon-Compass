import React from 'react';
import { Icons } from './Icons';

interface AnalyticsViewProps {
  // Array representing the history data for past 7 days
  history: Array<{
    dateStr: string;
    dayName: string;
    total: number;
    budget: number;
    transport: number;
    diet: number;
    energy: number;
    waste: number;
  }>;
}

/**
 * AnalyticsView Component - Renders historical charts
 * Uses a custom SVG to draw stacked bar charts indicating category emissions.
 */
export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history }) => {
  // Find the max emission level in history to scale the SVG chart height dynamically
  const maxEmissions = Math.max(...history.map(d => d.total), ...history.map(d => d.budget), 20);
  const chartHeight = 220;
  
  // Compute overall average footprint
  const totalSum = history.reduce((sum, d) => sum + d.total, 0);
  const averageDaily = history.length > 0 ? (totalSum / history.length).toFixed(1) : '0';

  // Helper: Computes the 7-day average for a specific category key
  const getCatAverage = (key: 'transport' | 'diet' | 'energy' | 'waste') => {
    const sum = history.reduce((acc, d) => acc + d[key], 0);
    return history.length > 0 ? (sum / history.length).toFixed(1) : '0';
  };

  /**
   * Translates a raw CO2e value into the corresponding Y coordinate on the SVG viewport.
   * Maps values from 0 to maxEmissions into pixels.
   */
  const scaleY = (val: number) => {
    const positiveVal = Math.max(0, val);
    return chartHeight - (positiveVal / maxEmissions) * (chartHeight - 20);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Quick stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons name="TrendingUp" style={{ color: 'hsl(var(--primary))' }} />
            Emissions Analytics
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', marginTop: '4px' }}>Weekly historical footprint comparison</p>
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.03)',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'block' }}>7-Day Average</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>{averageDaily} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-primary))' }}>kg CO₂e</span></span>
        </div>
      </div>

      {/* SVG Stacked Bar Chart */}
      <div style={{ position: 'relative', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px 12px 12px' }}>
        <svg viewBox={`0 0 500 ${chartHeight + 30}`} width="100%" height="250px" style={{ overflow: 'visible' }}>
          
          {/* Y Axis Grid Lines & Numeric Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const val = maxEmissions * pct;
            const y = scaleY(val);
            return (
              <g key={idx}>
                <line 
                  x1="45" 
                  y1={y} 
                  x2="490" 
                  y2={y} 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                <text 
                  x="35" 
                  y={y + 4} 
                  fill="hsl(var(--text-muted))" 
                  fontSize="10" 
                  textAnchor="end"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Budget Limit Guideline */}
          {history.length > 0 && (
            <g>
              <line 
                x1="45" 
                y1={scaleY(history[0].budget)} 
                x2="490" 
                y2={scaleY(history[0].budget)} 
                stroke="rgba(239, 68, 68, 0.4)" 
                strokeWidth="1.5" 
                strokeDasharray="6 3"
              />
              <text 
                x="495" 
                y={scaleY(history[0].budget) + 3} 
                fill="#ef4444" 
                fontSize="9" 
                fontWeight="600"
              >
                Limit
              </text>
            </g>
          )}

          {/* Daily Stacked Bars */}
          {history.map((day, idx) => {
            const width = 24;
            // Distribute bars evenly across the SVG canvas width
            const gap = (450 - width * history.length) / (history.length + 1);
            const x = 50 + idx * (width + gap);

            // Stack heights scaled to pixels
            const tHeight = (Math.max(0, day.transport) / maxEmissions) * (chartHeight - 20);
            const dHeight = (Math.max(0, day.diet) / maxEmissions) * (chartHeight - 20);
            const eHeight = (Math.max(0, day.energy) / maxEmissions) * (chartHeight - 20);
            const wHeight = (Math.max(0, day.waste) / maxEmissions) * (chartHeight - 20);

            // Accumulates stack Y position, starting at chart bottom and moving up
            let currentY = chartHeight;

            return (
              <g key={day.dateStr} className="chart-bar-group">
                {/* Tooltip trigger overlay region */}
                <rect 
                  x={x - 4} 
                  y="10" 
                  width={width + 8} 
                  height={chartHeight - 10} 
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                />

                {/* 1. Transport Segment (Base of stack) */}
                {tHeight > 0 && (
                  <rect
                    x={x}
                    y={currentY -= tHeight}
                    width={width}
                    height={tHeight}
                    fill="hsl(var(--color-transport))"
                    rx="3"
                  />
                )}

                {/* 2. Diet Segment */}
                {dHeight > 0 && (
                  <rect
                    x={x}
                    y={currentY -= dHeight}
                    width={width}
                    height={dHeight}
                    fill="hsl(var(--color-diet))"
                    rx="3"
                  />
                )}

                {/* 3. Energy Segment */}
                {eHeight > 0 && (
                  <rect
                    x={x}
                    y={currentY -= eHeight}
                    width={width}
                    height={eHeight}
                    fill="hsl(var(--color-energy))"
                    rx="3"
                  />
                )}

                {/* 4. Waste Segment (Top of stack) */}
                {wHeight > 0 && (
                  <rect
                    x={x}
                    y={currentY -= wHeight}
                    width={width}
                    height={wHeight}
                    fill="hsl(var(--color-waste))"
                    rx="3"
                  />
                )}

                {/* Total daily sum label on top of stacked bar */}
                <text
                  x={x + width / 2}
                  y={currentY - 6}
                  fill="white"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {day.total.toFixed(0)}
                </text>

                {/* Weekday label underneath the bar */}
                <text
                  x={x + width / 2}
                  y={chartHeight + 18}
                  fill="hsl(var(--text-secondary))"
                  fontSize="11"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {day.dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Chart Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '0.8rem',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'hsl(var(--color-transport))' }}></span>
          <span style={{ color: 'hsl(var(--text-secondary))' }}>Transport</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'hsl(var(--color-diet))' }}></span>
          <span style={{ color: 'hsl(var(--text-secondary))' }}>Diet</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'hsl(var(--color-energy))' }}></span>
          <span style={{ color: 'hsl(var(--text-secondary))' }}>Energy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'hsl(var(--color-waste))' }}></span>
          <span style={{ color: 'hsl(var(--text-secondary))' }}>Waste</span>
        </div>
      </div>

      {/* Grid displaying the calculated weekly category averages */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <div style={{ background: 'rgba(0,0,0,0.12)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid hsl(var(--color-transport))' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Avg Transport</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginTop: '2px' }}>{getCatAverage('transport')} kg CO₂e</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.12)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid hsl(var(--color-diet))' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Avg Diet</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginTop: '2px' }}>{getCatAverage('diet')} kg CO₂e</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.12)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid hsl(var(--color-energy))' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Avg Energy</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginTop: '2px' }}>{getCatAverage('energy')} kg CO₂e</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.12)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid hsl(var(--color-waste))' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Avg Waste</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginTop: '2px' }}>{getCatAverage('waste')} kg CO₂e</div>
        </div>
      </div>

    </div>
  );
};
