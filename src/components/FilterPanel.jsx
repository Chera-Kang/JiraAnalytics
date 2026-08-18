import React from 'react';
import { Calendar } from 'lucide-react';

const selectStyle = {
  appearance: 'none',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  padding: '8px 36px 8px 16px',
  fontSize: '0.95rem',
  outline: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '16px'
};

const FilterPanel = ({ years, months, selectedYear, selectedMonth, setYear, setMonth }) => {
  return (
    <div className="glass-panel flex-row justify-between animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex-row gap-2">
        <Calendar size={20} color="var(--accent-primary)" />
        <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Time Period Filter</span>
      </div>
      
      <div className="flex-row gap-4">
        <div className="flex-col gap-2">
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Year
          </label>
          <select 
            value={selectedYear} 
            onChange={(e) => setYear(e.target.value)}
            style={selectStyle}
            onMouseOver={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onMouseOut={(e) => e.target.style.borderColor = 'var(--glass-border)'}
          >
            <option value="All">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex-col gap-2">
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Month
          </label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setMonth(e.target.value)}
            style={selectStyle}
            onMouseOver={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onMouseOut={(e) => e.target.style.borderColor = 'var(--glass-border)'}
          >
            <option value="All">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
