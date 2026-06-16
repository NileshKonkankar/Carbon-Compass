import { useState } from 'react';
import { useCarbonData } from './hooks/useCarbonData';
import { QuickLogger } from './components/QuickLogger';
import { AnalyticsView } from './components/AnalyticsView';
import { Icons } from './components/Icons';
import { getLocalDateString, getPersonalizedInsights } from './utils/carbonEngine';

function App() {
  const {
    selectedDate,
    setSelectedDate,
    getCurrentData,
    addEntry,
    deleteEntry,
    toggleChallenge,
    streak,
    getWeeklyHistory,
    resetData
  } = useCarbonData();

  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'analytics'>('daily');

  const currentData = getCurrentData();
  const history = getWeeklyHistory();
  const insights = getPersonalizedInsights(currentData);

  // Carbon math for the day
  const totalCO2 = currentData.entries.reduce((sum, entry) => sum + entry.co2e, 0);
  const budget = currentData.budgetCO2;
  const rawRatio = totalCO2 / budget;
  const ratio = Math.min(1, Math.max(0, rawRatio)); // clamp between 0 and 1
  const percent = Math.round(rawRatio * 100);

  // Radial Ring values
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ratio * circumference);
  
  // Decide ring color
  let ringColor = 'hsl(var(--primary))'; // emerald
  if (rawRatio > 1.0) {
    ringColor = '#ef4444'; // red
  } else if (rawRatio > 0.75) {
    ringColor = '#f59e0b'; // amber
  }

  // Date Navigator Helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    // Don't allow future date logging to prevent confusion
    if (d > new Date()) return;
    setSelectedDate(getLocalDateString(d));
  };

  const isTodaySelected = selectedDate === getLocalDateString();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <header style={{
        background: 'rgba(15, 23, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid hsl(var(--card-border))',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1300px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, hsl(var(--primary)), #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}>
              <Icons name="Sprout" size={24} style={{ color: '#03150d' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.3px', margin: 0, color: 'white' }}>
                Carbon Compass
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>Navigate your sustainability journey</p>
            </div>
          </div>

          {/* Right Header Panel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Streak Counter */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'hsl(var(--primary))'
            }}>
              <Icons name="Flame" size={16} fill="currentColor" />
              <span>{streak} Day Streak</span>
            </div>

            {/* Reset mock data */}
            <button 
              onClick={() => {
                if(confirm("Reset all logs and reload demo data?")) {
                  resetData();
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: 'hsl(var(--text-secondary))',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="btn-secondary"
            >
              <Icons name="Recycle" size={14} />
              Reset Demo Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main style={{ flex: 1, padding: '24px 0' }}>
        <div className="dashboard-grid">
          
          {/* Left Column - Score Gauge & Daily List */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Radial Ring Card */}
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              
              {/* Date Navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: '8px',
                padding: '4px'
              }}>
                <button 
                  type="button"
                  onClick={handlePrevDay} 
                  className="btn-secondary"
                  aria-label="Previous day"
                  style={{ padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                >
                  <Icons name="ChevronLeft" size={16} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons name="Calendar" size={14} style={{ color: 'hsl(var(--primary))' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                    {isTodaySelected ? 'Today, ' : ''} {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={handleNextDay} 
                  disabled={isTodaySelected}
                  className="btn-secondary"
                  aria-label="Next day"
                  style={{ 
                    padding: '6px 10px', 
                    borderRadius: '6px', 
                    display: 'flex', 
                    alignItems: 'center',
                    opacity: isTodaySelected ? 0.3 : 1,
                    cursor: isTodaySelected ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Icons name="ChevronRight" size={16} />
                </button>
              </div>

              {/* SVG Ring Gauge */}
              <div 
                style={{ position: 'relative', display: 'inline-block', margin: '12px auto' }}
                role="img" 
                aria-label={`Daily carbon progress: ${totalCO2.toFixed(1)} kilograms of ${budget.toFixed(1)} kilograms carbon limit spent`}
              >
                <svg width="150" height="150" aria-hidden="true">
                  <circle
                    stroke="rgba(255,255,255,0.04)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx="75"
                    cy="75"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke={ringColor}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    r={radius}
                    cx="75"
                    cy="75"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Gauge Inner Text */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                    {totalCO2.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                    kg CO₂e
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: ringColor,
                    marginTop: '6px'
                  }}>
                    {percent}% budget
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>Daily Limit:</span>
                  <span style={{ fontWeight: 600, color: 'white' }}>{budget.toFixed(1)} kg</span>
                </div>
              </div>

              <button 
                onClick={() => setIsLoggerOpen(true)}
                style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                className="btn-primary"
              >
                <Icons name="Plus" size={18} />
                Log New Activity
              </button>
            </div>

            {/* Daily Activity Entries List */}
            <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>Logged Activities</h3>
                <span style={{
                  fontSize: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  color: 'hsl(var(--text-secondary))'
                }}>
                  {currentData.entries.length} items
                </span>
              </div>

              {currentData.entries.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'hsl(var(--text-muted))',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed rgba(255,255,255,0.05)',
                  borderRadius: '12px'
                }}>
                  <Icons name="Info" size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>No entries logged for this date.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Click "Log New Activity" above to begin tracking.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '380px' }}>
                  {currentData.entries.map(entry => {
                    const isSaving = entry.co2e < 0;
                    
                    return (
                      <div 
                        key={entry.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: 'rgba(0,0,0,0.15)',
                          borderRadius: '8px',
                          borderLeft: `3px solid var(--color-${entry.category})`
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <span className={`category-badge badge-${entry.category}`} style={{ marginBottom: '4px' }}>
                            {entry.category}
                          </span>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: 'white' }}>
                            {entry.label}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 700, 
                            color: isSaving ? 'hsl(var(--color-savings))' : 'white' 
                          }}>
                            {isSaving ? '' : '+'}{entry.co2e.toFixed(1)} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteEntry(entry.id)}
                            aria-label={`Remove activity entry: ${entry.label}`}
                            style={{
                              background: 'transparent',
                              color: 'hsl(var(--text-muted))',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--text-muted))'}
                          >
                            <Icons name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </section>

          {/* Right Column - Tabs & Details */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* View Tabs */}
            <div 
              role="tablist"
              aria-label="Dashboard View Toggle"
              style={{
                display: 'flex',
                background: 'rgba(20, 28, 25, 0.7)',
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.05)',
                alignSelf: 'flex-start'
              }}
            >
              <button
                type="button"
                id="tab-daily"
                role="tab"
                aria-selected={activeTab === 'daily'}
                aria-controls="daily-focus-panel"
                onClick={() => setActiveTab('daily')}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'daily' ? 'hsl(var(--card-bg))' : 'transparent',
                  color: activeTab === 'daily' ? 'white' : 'hsl(var(--text-secondary))',
                  boxShadow: activeTab === 'daily' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                <Icons name="Leaf" size={16} />
                Daily Habits & Challenges
              </button>
              <button
                type="button"
                id="tab-analytics"
                role="tab"
                aria-selected={activeTab === 'analytics'}
                aria-controls="analytics-panel"
                onClick={() => setActiveTab('analytics')}
                style={{
                  padding: '8px 18px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: activeTab === 'analytics' ? 'hsl(var(--card-bg))' : 'transparent',
                  color: activeTab === 'analytics' ? 'white' : 'hsl(var(--text-secondary))',
                  boxShadow: activeTab === 'analytics' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                <Icons name="TrendingUp" size={16} />
                Weekly Trends
              </button>
            </div>

            {/* TAB VIEW 1: DAILY DETAILS */}
            {activeTab === 'daily' && (
              <div 
                id="daily-focus-panel" 
                role="tabpanel" 
                aria-labelledby="tab-daily"
                style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}
              >
                {/* Personalized Insights Banner */}
                {insights.length > 0 && (
                  <div className="glass-panel" style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.05))',
                    borderLeft: '4px solid hsl(var(--primary))'
                  }}>
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px'
                    }}>
                      <Icons name="Sparkles" size={16} style={{ color: 'hsl(var(--primary))' }} />
                      Personalized Insights & Nudges
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {insights.map((insight, idx) => (
                        <p key={idx} style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges & Daily Habits Checklist */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>Daily Green Challenges</h3>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', marginTop: '2px' }}>
                      Complete active tasks to offset your daily carbon output
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {currentData.challenges.map(challenge => (
                      <div
                        key={challenge.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px',
                          padding: '14px',
                          background: challenge.completed ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0, 0, 0, 0.15)',
                          border: challenge.completed 
                            ? '1px solid rgba(16, 185, 129, 0.15)' 
                            : '1px solid rgba(255, 255, 255, 0.03)',
                          borderRadius: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Custom Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleChallenge(challenge.id)}
                          role="checkbox"
                          aria-checked={challenge.completed}
                          aria-label={`Mark challenge completed: ${challenge.title}`}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: challenge.completed ? '1px solid hsl(var(--primary))' : '1px solid hsl(var(--text-muted))',
                            background: challenge.completed ? 'hsl(var(--primary))' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#03150d',
                            marginTop: '2px',
                            flexShrink: 0
                          }}
                        >
                          {challenge.completed && <Icons name="Check" size={14} strokeWidth={3} />}
                        </button>

                        {/* Title & Desc */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ 
                              fontSize: '0.9rem', 
                              fontWeight: 600, 
                              color: challenge.completed ? 'hsl(var(--text-secondary))' : 'white',
                              textDecoration: challenge.completed ? 'line-through' : 'none'
                            }}>
                              {challenge.title}
                            </h4>
                            <span className={`category-badge badge-${challenge.category}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                              {challenge.category}
                            </span>
                          </div>
                          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.775rem', marginTop: '4px', lineHeight: '1.3' }}>
                            {challenge.description}
                          </p>
                        </div>

                        {/* Sparkles / CO2 saving */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--color-savings))' }}>
                            -{challenge.co2Saving} kg
                          </div>
                          {challenge.streak > 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--color-diet))', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end', marginTop: '4px' }}>
                              <Icons name="Flame" size={10} />
                              <span>{challenge.streak}d streak</span>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: HISTORICAL ANALYTICS */}
            {activeTab === 'analytics' && (
              <div 
                id="analytics-panel" 
                role="tabpanel" 
                aria-labelledby="tab-analytics"
                style={{ width: '100%' }}
              >
                <AnalyticsView history={history} />
              </div>
            )}

          </section>

        </div>
      </main>

      {/* Slide-out Logger Drawer */}
      <QuickLogger 
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onAddEntry={addEntry}
      />
      
    </div>
  );
}

export default App;
