import React, { useMemo } from 'react';
import JiraComboChart from './JiraComboChart';

const GlobalStatsSection = ({ globalStats, globalYear, setGlobalYear, availableYears }) => {
  // globalStats: [{ year: "2024", month: "10", created: 4, resolved: 0, remaining: 4 }, ...]

  const chartData = useMemo(() => {
    if (!globalStats || globalStats.length === 0) return [];
    
    // Filter by year if a specific year is selected
    const filteredStats = globalYear === 'All' 
      ? globalStats 
      : globalStats.filter(stat => stat.year === globalYear);

    // Map to chart format
    return filteredStats.map(stat => ({
      // "2024-10" or just "10월" if globalYear is selected
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
    
    // 마지막 달의 잔여 이슈를 총 잔여 이슈로 표기하거나, 단순 합계가 아닌 현재 시점의 남은 값
    // spreadsheet 로직 상 가장 마지막 행의 remaining 값을 쓰면 될 듯 합니다.
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
          전체 프로젝트 통계
          <span style={{ 
            fontSize: '0.8rem', 
            background: 'rgba(59, 130, 246, 0.2)', 
            color: 'var(--accent-primary)',
            padding: '2px 8px', 
            borderRadius: '12px' 
          }}>
            Global
          </span>
        </h2>
        
        {/* Year Filter */}
        <select 
          value={globalYear} 
          onChange={(e) => setGlobalYear(e.target.value)}
          className="glass-panel"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            outline: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem'
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
          <JiraComboChart data={chartData} />
        </div>
      </div>
    </section>
  );
};

export default GlobalStatsSection;
