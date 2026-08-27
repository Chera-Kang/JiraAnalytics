import React from 'react';
import ProjectStatsSection from '../components/sections/ProjectStatsSection';
import DetailedStatsSection from '../components/sections/DetailedStatsSection';

/**
 * [메인 대시보드 페이지 (MainPage)]
 * - 전체 프로젝트 통계 섹션 (ProjectStatsSection)
 * - 세부 통계 섹션 (DetailedStatsSection)
 */
const MainPage = ({
  globalStats,
  globalYear,
  setGlobalYear,
  availableYears,
  issues,
  versions,
  selectedVersion,
  setSelectedVersion,
  onNavigate
}) => {
  return (
    <div className="flex-col gap-8 w-full animate-fade-in">
      {/* 1. 전체 프로젝트 통계 섹션 */}
      <ProjectStatsSection
        globalStats={globalStats}
        globalYear={globalYear}
        setGlobalYear={setGlobalYear}
        availableYears={availableYears}
      />

      <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

      {/* 2. 세부 통계 섹션 */}
      <DetailedStatsSection
        issues={issues}
        versions={versions}
        selectedVersion={selectedVersion}
        setSelectedVersion={setSelectedVersion}
        availableYears={availableYears}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default MainPage;
