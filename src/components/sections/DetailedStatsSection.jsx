import React, { useState, useMemo } from 'react';
import { Tag, Clock, Calendar, ChevronRight } from 'lucide-react';
import PriorityChart from '../charts/PriorityChart';
import TypeChart from '../charts/TypeChart';
import AssigneeCountChart from '../charts/AssigneeCountChart';

/**
 * [드롭다운 셀렉터 커스텀 스타일]
 */
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
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '16px'
};

/**
 * [세부 통계 섹션 컴포넌트]
 * - 연도 필터 및 수정버전 필터 제공
 * - Period 및 Work Days 고정형 UI
 * - 3개 차트 (우선순위, 유형, 담당자별 개수) 한 줄 균등 정렬
 */
const DetailedStatsSection = ({ issues, versions, selectedVersion, setSelectedVersion, availableYears = [], onNavigate }) => {
  // 연도 필터 상태 (기본값: 'All')
  const [selectedYear, setSelectedYear] = useState('All');

  // 연도 선택 변경 시: 선택한 연도 적용 & 수정버전 필터는 'All'로 자동 리셋
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setSelectedVersion('All');
  };

  // 수정버전 선택 변경 시: 선택한 버전 적용 & 연도 필터는 'All'로 자동 리셋
  const handleVersionChange = (version) => {
    setSelectedVersion(version);
    setSelectedYear('All');
  };

  // 현재 선택된 버전의 메타데이터(시작일, 종료일, Workday)를 찾습니다.
  const versionMetadata = useMemo(() => {
    return versions.find(v => v.name === selectedVersion);
  }, [versions, selectedVersion]);

  // 선택된 연도 또는 버전에 맞춰 3가지 차트용 데이터를 가공합니다.
  const { priorityData, typeData, assigneeCountData } = useMemo(() => {
    let filteredIssues = issues;

    // 1. 특정 수정버전이 선택된 경우
    if (selectedVersion && selectedVersion !== 'All') {
      filteredIssues = issues.filter(issue => issue.fixVersion === selectedVersion);
    } 
    // 2. 특정 연도가 선택된 경우
    else if (selectedYear && selectedYear !== 'All') {
      const shortYear = selectedYear.slice(-2); // "2026" -> "26"
      filteredIssues = issues.filter(issue => {
        const createdYear = issue.created ? issue.created.slice(0, 4) : '';
        return createdYear === selectedYear || issue.fixVersion.startsWith(shortYear);
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
  }, [issues, selectedVersion, selectedYear]);

  return (
    <div className="flex-col gap-6 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* 세부 통계 헤더 및 연도/수정버전 필터 드롭다운 */}
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
                padding: '3px 10px 3px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-primary)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              title="세부 통계 상세 페이지로 이동"
            >
              <span>더보기</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>스프린트 버전 및 연도별 세부 지표 분석</span>
        </div>
        
        {/* 드롭다운 필터 및 고정형 메타정보 박스 (2줄 50:50 정렬 구조) */}
        <div className="flex-col gap-2 glass-panel" style={{ padding: '10px 14px', borderRadius: '12px', minWidth: '440px' }}>
          {/* 1행: 연도 셀렉터 (50%) & 수정버전 셀렉터 (50%) */}
          <div className="flex-row gap-3 w-full" style={{ alignItems: 'center' }}>
            <div className="flex-row gap-2" style={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
              <Calendar size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <select 
                value={selectedYear} 
                onChange={(e) => handleYearChange(e.target.value)}
                style={{...selectStyle, border: 'none', padding: '0 20px 0 4px', background: 'transparent', width: '100%', fontSize: '0.9rem'}}
              >
                <option value="All">전체 연도</option>
                {availableYears.map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
            </div>

            <div style={{ width: '1px', height: '18px', background: 'var(--border-color)', flexShrink: 0 }} />

            <div className="flex-row gap-2" style={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
              <Tag size={16} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />
              <select 
                value={selectedVersion} 
                onChange={(e) => handleVersionChange(e.target.value)}
                style={{...selectStyle, border: 'none', padding: '0 20px 0 4px', background: 'transparent', width: '100%', fontSize: '0.9rem'}}
              >
                <option value="All">전체 버전 (All)</option>
                {versions.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

          {/* 2행: PERIOD (50%) & WORK DAYS (50%) */}
          <div className="flex-row gap-3 w-full" style={{ alignItems: 'center' }}>
            <div className="flex-col" style={{ flex: 1, minWidth: 0, paddingLeft: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>PERIOD</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {versionMetadata ? `${versionMetadata.start} ~ ${versionMetadata.end}` : (selectedYear !== 'All' ? `${selectedYear}년 전체` : '전체 기간')}
              </span>
            </div>

            <div style={{ width: '1px', height: '18px', background: 'var(--border-color)', flexShrink: 0 }} />

            <div className="flex-col" style={{ flex: 1, minWidth: 0, paddingLeft: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>WORK DAYS</span>
              <div className="flex-row gap-1" style={{ alignItems: 'center' }}>
                <Clock size={12} color="var(--warning)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {versionMetadata ? `${versionMetadata.workDays} days` : '-'}
                </span>
              </div>
            </div>
          </div>
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
