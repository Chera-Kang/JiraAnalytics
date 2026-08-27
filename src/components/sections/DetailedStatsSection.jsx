import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import PriorityChart from '../charts/PriorityChart';
import TypeChart from '../charts/TypeChart';
import AssigneeCountChart from '../charts/AssigneeCountChart';

/**
 * [메인 대시보드 내 세부 통계 요약 섹션]
 * - 상단 프로젝트 통계의 [연도(globalYear)]와 100% 자동 동기화
 * - 3개 차트 (우선순위, 유형, 담당자별 개수) 한 줄 균등 정렬
 * - [더보기 ➔] 클릭 시 세부 통계 심층 분석 & 이슈 탐색기 페이지로 이동
 */
const DetailedStatsSection = ({ issues = [], globalYear = 'All', onNavigate }) => {
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

    // 차트 포맷 변환 헬퍼 함수 (개수 내림차순 정렬)
    const toChartData = (groupedObj) => {
      return Object.keys(groupedObj).map(key => ({
        name: key,
        value: groupedObj[key].length
      })).sort((a, b) => b.value - a.value);
    };

    // 1. 이슈 우선순위 데이터 가공
    const priorityGrouped = groupBy(filteredIssues, 'priority');
    const priorityData = toChartData(priorityGrouped);

    // 2. 이슈 유형 데이터 가공
    const typeGrouped = groupBy(filteredIssues, 'type');
    const typeData = toChartData(typeGrouped);

    // 3. 담당자별 이슈 개수 가공
    const assigneeGrouped = groupBy(filteredIssues, 'assignee');
    const assigneeCountData = Object.keys(assigneeGrouped).map(assignee => ({
      name: assignee,
      value: assigneeGrouped[assignee].length
    })).sort((a, b) => b.value - a.value);

    return { priorityData, typeData, assigneeCountData };
  }, [issues, globalYear]);

  return (
    <div className="flex-col gap-5 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* 세부 통계 헤더 */}
      <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex-col gap-1">
          <div className="flex-row gap-3 align-center">
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>세부 통계</h2>
            {/* 더보기 버튼 */}
            <button
              onClick={() => onNavigate && onNavigate('detailedStats')}
              style={{
                background: 'rgba(37, 99, 235, 0.08)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: '20px',
                padding: '4px 12px 4px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-primary)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              title="세부 통계 심층 분석 및 전체 이슈 목록으로 이동"
            >
              <span>심층 분석 더보기</span>
              <ChevronRight size={15} />
            </button>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {globalYear !== 'All' ? `${globalYear}년 세부 지표 요약` : '전체 기간 세부 지표 요약 (우측 더보기에서 스프린트별·담당자별 상세 필터 제공)'}
          </span>
        </div>
      </div>

      {/* 3개 차트 한 줄(1-Row 3-Column) 균등 배치 (우선순위, 유형, 담당자별 개수) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        <PriorityChart data={priorityData} />
        <TypeChart data={typeData} />
        <AssigneeCountChart data={assigneeCountData} />
      </div>
    </div>
  );
};

export default DetailedStatsSection;
