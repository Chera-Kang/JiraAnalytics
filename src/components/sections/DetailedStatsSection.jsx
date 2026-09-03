import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import PriorityChart from '../charts/PriorityChart';
import TypeChart from '../charts/TypeChart';
import AssigneeCountChart from '../charts/AssigneeCountChart';

// 정해진 우선순위 정렬 순서 (Highest -> Lowest)
const PRIORITY_ORDER = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

// 정해진 이슈 유형 정렬 순서 (Planning -> Bug)
const TYPE_ORDER = ['Planning', 'Design', '스토리', 'Story', '작업', 'Task', '하위 작업', '하위작업', 'Sub-task', '버그', 'Bug'];

/**
 * [메인 대시보드 내 세부 통계 요약 섹션]
 * - 상단 프로젝트 통계의 [연도(globalYear)]와 100% 자동 동기화
 * - 3개 차트 (우선순위, 유형, 담당자별 개수) 한 줄 균등 정렬
 * - [더보기 ➔] 클릭 시 세부 통계 심층 분석 & 이슈 탐색기 페이지로 이동
 */
const DetailedStatsSection = ({ issues = [], globalYear = 'All', onNavigate, isPrivacyMode = true }) => {
  // 상단 글로벌 연도(globalYear)에 맞춰 3가지 차트용 데이터를 가공합니다.
  const { priorityData, typeData, assigneeCountData } = useMemo(() => {
    let filteredIssues = issues;

    // 특정 연도가 선택된 경우 필터링
    if (globalYear && globalYear !== 'All') {
      const shortYear = globalYear.slice(-2); // "2026" -> "26"
      filteredIssues = issues.filter(issue => {
        const createdYear = issue.created ? issue.created.slice(0, 4) : '';
        return createdYear === globalYear || (issue.fixVersion && issue.fixVersion.startsWith(shortYear));
      });
    }

    // 공통 그룹화 헬퍼 함수
    const groupBy = (array, key) => {
      return array.reduce((result, currentValue) => {
        const value = currentValue[key] || 'None';
        (result[value] = result[value] || []).push(currentValue);
        return result;
      }, {});
    };

    // 1. 이슈 우선순위 데이터 가공 (Highest -> Lowest 고정 정렬)
    const priorityGrouped = groupBy(filteredIssues, 'priority');
    const priorityData = Object.keys(priorityGrouped)
      .map(key => ({ name: key, value: priorityGrouped[key].length }))
      .sort((a, b) => {
        const idxA = PRIORITY_ORDER.indexOf(a.name);
        const idxB = PRIORITY_ORDER.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return b.value - a.value;
      });

    // 2. 이슈 유형 데이터 가공 (Planning -> Bug 고정 정렬)
    const typeGrouped = groupBy(filteredIssues, 'type');
    const typeData = Object.keys(typeGrouped)
      .map(key => ({ name: key, value: typeGrouped[key].length }))
      .sort((a, b) => {
        const idxA = TYPE_ORDER.indexOf(a.name);
        const idxB = TYPE_ORDER.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return b.value - a.value;
      });

    // 3. 담당자별 이슈 개수 가공 (개수 내림차순)
    const assigneeGrouped = groupBy(filteredIssues, 'assignee');
    const assigneeCountData = Object.keys(assigneeGrouped).map(assignee => ({
      name: assignee,
      value: assigneeGrouped[assignee].length
    })).sort((a, b) => b.value - a.value);

    return { priorityData, typeData, assigneeCountData };
  }, [issues, globalYear]);

  return (
    <div className="flex-col w-full animate-fade-in" style={{ gap: '1.75rem', animationDelay: '0.2s' }}>
      {/* 세부 통계 헤더 */}
      <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '0.5rem' }}>
        <div className="flex-col gap-1">
          <div className="flex-row gap-3 align-center">
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>세부 통계</h2>
            {/* 더보기 버튼 */}
            <button
              onClick={() => onNavigate && onNavigate('detailedStats')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>심층 분석 더보기</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {globalYear === 'All' ? '전체 기간' : `${globalYear}년`} 기준 이슈 심층 분석 지표
          </p>
        </div>
      </div>

      {/* 3개 차트 한 줄 균등 배치 (1:1:1 Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        {/* 1. 이슈 우선순위 도넛 차트 */}
        <PriorityChart data={priorityData} />

        {/* 2. 이슈 유형 도넛 차트 */}
        <TypeChart data={typeData} />

        {/* 3. 담당자별 이슈 개수 막대 차트 (막대 클릭 시 개인 대시보드로 이동) */}
        <AssigneeCountChart data={assigneeCountData} onNavigate={onNavigate} isPrivacyMode={isPrivacyMode} />
      </div>
    </div>
  );
};

export default DetailedStatsSection;
