import React, { useMemo } from 'react';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';

/**
 * [프로젝트 통계 구획 컴포넌트]
 * - 상단 연도 필터
 * - 핵심 KPI 요약 카드 (생성 / 해결 / 잔여)
 * - 월별 이슈 트렌드 콤보 차트
 */
const ProjectStatsSection = ({ globalStats, globalYear, setGlobalYear, availableYears }) => {
  // globalStats: [{ year: "2024", month: "10", created: 4, resolved: 0, remaining: 4 }, ...]

  const chartData = useMemo(() => {
    if (!globalStats || globalStats.length === 0) return [];
    
    // Filter by year if a specific year is selected
    const filteredStats = globalYear === 'All' 
      ? globalStats 
      : globalStats.filter(stat => stat.year === globalYear);

    // Map to chart format
    return filteredStats.map(stat => ({
      name: globalYear === 'All' ? `${stat.year.slice(-2)}.${stat.month}` : `${stat.month}월`,
      created: stat.created,
      resolved: stat.resolved,
      remaining: stat.remaining,
    }));
  }, [globalStats, globalYear]);

  // 상단 전체 요약 카드용 데이터 계산
  const totalSummary = useMemo(() => {
    if (chartData.length === 0) return { created: 0, resolved: 0, remaining: 0, resolutionRate: 0 };
    
    const totalCreated = chartData.reduce((sum, item) => sum + item.created, 0);
    const totalResolved = chartData.reduce((sum, item) => sum + item.resolved, 0);
    const currentRemaining = chartData[chartData.length - 1]?.remaining || 0;
    
    return {
      created: totalCreated,
      resolved: totalResolved,
      remaining: currentRemaining,
      resolutionRate: totalCreated > 0 ? Math.round((totalResolved / totalCreated) * 100) : 0
    };
  }, [chartData]);

  return (
    <section className="flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex-row justify-between w-full">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          프로젝트 통계
        </h2>
        
        {/* Year Filter */}
        <select 
          value={globalYear} 
          onChange={(e) => setGlobalYear(e.target.value)}
          style={{
            appearance: 'none',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            padding: '8px 32px 8px 14px',
            fontSize: '0.9rem',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            backgroundSize: '14px',
            minWidth: '130px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <option value="All">전체 연도</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}년</option>
          ))}
        </select>
      </div>

      <div className="flex-row gap-4 w-full">
        {/* KPI Cards */}
        <div className="flex-col gap-4" style={{ width: '250px' }}>
          <div className="glass-panel flex-col justify-center" style={{ flex: 1, borderLeft: '4px solid var(--danger)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>생성 이슈</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>{totalSummary.created}</span>
          </div>
          <div className="glass-panel flex-col justify-center" style={{ flex: 1, borderLeft: '4px solid var(--success)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>해결 이슈</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{totalSummary.resolved}</span>
          </div>
          <div className="glass-panel flex-col justify-center" style={{ flex: 1, borderLeft: '4px solid var(--accent-primary)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>현재 잔여 이슈</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{totalSummary.remaining}</span>
          </div>
        </div>

        {/* Main Chart */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <MonthlyTrendChart data={chartData} />
        </div>
      </div>
    </section>
  );
};

export default ProjectStatsSection;
