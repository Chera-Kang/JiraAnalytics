import React from 'react';
import { LayoutDashboard, RefreshCw, Clock, BarChart2, Lightbulb, Eye, EyeOff } from 'lucide-react';

/**
 * [글로벌 상단 헤더 컴포넌트]
 * - 대시보드 로고 (클릭 시 메인 대시보드로 이동)
 * - 최종 동기화 시간 표출 (Last Updated)
 * - 데이터 갱신 (비활성화 버튼)
 * - 보안 마스킹 모드 (Eye/EyeOff 토글)
 * - 심층 분석 (버튼)
 * - Next Plan 로드맵 (아이디어 이모지 버튼)
 */
const Header = ({ 
  lastUpdated, 
  isSyncing: _isSyncing, 
  onSync, 
  currentView = 'dashboard', 
  onNavigate,
  isPrivacyMode = true,
  onTogglePrivacy
}) => {
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
      
      {/* 2. 우측 버튼 그룹: Last Updated, 데이터 갱신, 담당자별 통계, 심층 분석, Next Plan */}
      <div className="flex-row gap-3 align-center" style={{ flexWrap: 'wrap' }}>
        {/* Last Updated Information */}
        <div className="flex-col" style={{ alignItems: 'flex-end', justifyContent: 'center', marginRight: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Last Updated
          </span>
          <div className="flex-row gap-1">
            <Clock size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {formattedDate}
            </span>
          </div>
        </div>

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

        {/* 보안 마스킹 (프라이버시 블러) 모드 토글 버튼 */}
        <button
          onClick={onTogglePrivacy}
          style={{
            background: isPrivacyMode ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
            color: isPrivacyMode ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: isPrivacyMode ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title={isPrivacyMode ? '보안 마스킹 해제 (클릭 시 원본 텍스트 표시)' : '보안 마스킹 적용 (이슈 제목 및 담당자명 블러 보호)'}
        >
          {isPrivacyMode ? <EyeOff size={15} color="var(--accent-primary)" /> : <Eye size={15} />}
          <span>{isPrivacyMode ? '마스킹 ON' : '마스킹 OFF'}</span>
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
