import React from 'react';
import { LayoutDashboard, RefreshCw, BarChart2, Lightbulb } from 'lucide-react';

/**
 * [글로벌 상단 헤더 컴포넌트]
 * - 대시보드 로고 (클릭 시 메인 대시보드로 이동)
 * - 데이터 갱신 (비활성화 버튼)
 * - 심층 분석 (버튼)
 * - Next Plan 로드맵 (아이디어 이모지 버튼)
 */
const Header = ({ 
  onSync, 
  currentView = 'dashboard', 
  onNavigate
}) => {
  // 공통 네비게이션 버튼 스타일 헬퍼
  const getNavButtonStyle = (isActive) => ({
    background: isActive ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
    color: isActive ? '#ffffff' : 'var(--text-primary)',
    border: isActive ? 'none' : '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
    fontWeight: 600,
    fontSize: '0.88rem'
  });

  return (
    <header className="flex-row justify-between animate-fade-in" style={{ animationDelay: '0.1s', flexWrap: 'wrap', gap: '16px' }}>
      {/* 1. 좌측 로고 및 타이틀 (클릭 시 메인 홈 이동) */}
      <div 
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="flex-row gap-3 align-center"
        style={{ cursor: 'pointer' }}
        title="메인 대시보드로 이동"
      >
        <div 
          className="flex-row" 
          style={{ 
            background: 'var(--accent-gradient)', 
            padding: '10px', 
            borderRadius: '10px',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <LayoutDashboard size={24} color="white" />
        </div>
        <div className="flex-col">
          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Jira Analytics
          </h1>
        </div>
      </div>
      
      {/* 2. 우측 버튼 그룹: 데이터 갱신, 심층 분석, Next Plan */}
      <div className="flex-row gap-3 align-center" style={{ flexWrap: 'wrap' }}>
        {/* Sync Button (데이터 갱신) */}
        <button 
          onClick={onSync}
          disabled={true}
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            opacity: 0.6,
            fontSize: '0.88rem',
            fontWeight: 500
          }}
          title="자동 동기화 유지 중"
        >
          <RefreshCw size={15} color="var(--text-muted)" />
          <span>데이터 갱신</span>
        </button>

        {/* 심층 분석 버튼 */}
        <button
          onClick={() => onNavigate && onNavigate('detailedStats')}
          style={getNavButtonStyle(currentView === 'detailedStats')}
          onMouseEnter={(e) => {
            if (currentView !== 'detailedStats') e.currentTarget.style.background = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'detailedStats') e.currentTarget.style.background = 'var(--bg-secondary)';
          }}
        >
          <BarChart2 size={16} />
          <span>심층 분석</span>
        </button>

        {/* Next Plan (로드맵) 아이디어 버튼 */}
        <button
          onClick={() => onNavigate && onNavigate('next')}
          style={{
            ...getNavButtonStyle(currentView === 'next'),
            padding: '8px 10px'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'next') e.currentTarget.style.background = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'next') e.currentTarget.style.background = 'var(--bg-secondary)';
          }}
          title="Next Plan 로드맵"
        >
          <Lightbulb size={17} color={currentView === 'next' ? '#ffffff' : 'var(--warning)'} />
        </button>
      </div>
    </header>
  );
};

export default Header;
