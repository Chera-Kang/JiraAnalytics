import React from 'react';
import { LayoutDashboard, RefreshCw, Clock, ArrowRight } from 'lucide-react';

const Header = ({ lastUpdated, isSyncing: _isSyncing, onSync, currentView = 'dashboard', onNavigate }) => {
  // Format the date for display (년월일시분 까지 표기, 초 제외)
  let formattedDate = 'Unknown';
  if (lastUpdated) {
    const match = lastUpdated.match(/(\d{4}[-./]\d{2}[-./]\d{2}\s+\d{2}:\d{2})/);
    if (match) {
      formattedDate = match[1];
    } else {
      const date = new Date(lastUpdated);
      if (!isNaN(date.getTime())) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
      } else {
        formattedDate = lastUpdated;
      }
    }
  }

  return (
    <header className="flex-row justify-between animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex-row gap-4 align-center">
        <div 
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="flex-row" 
          style={{ 
            background: 'var(--accent-gradient)', 
            padding: '12px', 
            borderRadius: '12px',
            boxShadow: 'var(--shadow-glow)',
            cursor: 'pointer'
          }}
          title="대시보드 홈으로 이동"
        >
          <LayoutDashboard size={28} color="white" />
        </div>
        <div className="flex-col">
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Jira Analytics
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time performance and issue tracking dashboard
          </p>
        </div>
      </div>
      
      <div className="flex-row gap-4 align-center">
        {/* Last Updated Information */}
        <div className="flex-col" style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Last Updated
          </span>
          <div className="flex-row gap-1">
            <Clock size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Sync Button (Disabled for now) */}
        <button 
          onClick={onSync}
          disabled={true} // 항상 비활성화
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            opacity: 0.5, // 비활성화 느낌을 주기 위해 불투명도 낮춤
            boxShadow: 'none'
          }}
        >
          <RefreshCw 
            size={16} 
            color={"var(--text-muted)"} 
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            데이터 갱신
          </span>
        </button>

        {/* Next Roadmap Page Button */}
        <button
          onClick={() => onNavigate && onNavigate(currentView === 'dashboard' ? 'next' : 'dashboard')}
          style={{
            background: currentView === 'dashboard' ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
            color: currentView === 'dashboard' ? '#ffffff' : 'var(--text-primary)',
            border: currentView === 'dashboard' ? 'none' : '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: currentView === 'dashboard' ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {currentView === 'dashboard' ? (
            <>
              <span>Next</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
