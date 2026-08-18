import React, { useState, useMemo } from 'react';
import { Tag, Clock, Calendar } from 'lucide-react';
import PriorityChart from './charts/PriorityChart';
import TypeChart from './charts/TypeChart';
import AssigneeCountChart from './charts/AssigneeCountChart';
import AssigneeTimeChart from './charts/AssigneeTimeChart';

/**
 * [드롭다운 셀렉터 커스텀 스타일]
 * 깔끔한 SVG 화살표와 패딩이 적용된 드롭다운 디자인입니다.
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
 * - 연도 필터 및 수정버전 필터 제공 (상호 연동 리셋: 연도 선택 시 버전은 'All', 버전 선택 시 연도는 'All')
 * - Period 및 Work Days 영역을 항시 고정형(Fixed UI)으로 유지하여 레이아웃 변형 방지
 */
const DetailedStatsSection = ({ issues, versions, selectedVersion, setSelectedVersion, availableYears = [] }) => {
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

  // 선택된 연도 또는 버전에 맞춰 4가지 차트용 데이터를 가공합니다.
  const { priorityData, typeData, assigneeCountData, assigneeTimeData } = useMemo(() => {
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

    // 3 & 4. 담당자별 이슈 개수 및 평균 처리 일수 가공
    const assigneeGrouped = groupBy(filteredIssues, 'assignee');
    const assigneeCountData = [];
    const assigneeTimeData = [];

    Object.keys(assigneeGrouped).forEach(assignee => {
      const assigneeIssues = assigneeGrouped[assignee];
      
      // 담당자별 총 이슈 개수
      assigneeCountData.push({ name: assignee, value: assigneeIssues.length });
      
      // 담당자별 종료된 이슈의 평균 처리 일수 계산
      const resolvedIssues = assigneeIssues.filter(i => i.status === '종료' && i.resolutionTimeDays !== null);
      if (resolvedIssues.length > 0) {
        const totalDays = resolvedIssues.reduce((sum, i) => sum + i.resolutionTimeDays, 0);
        assigneeTimeData.push({ 
          name: assignee, 
          value: parseFloat((totalDays / resolvedIssues.length).toFixed(1)) 
        });
      } else {
        assigneeTimeData.push({ name: assignee, value: 0 });
      }
    });

    // 개수 내림차순 정렬
    assigneeCountData.sort((a, b) => b.value - a.value);
    assigneeTimeData.sort((a, b) => b.value - a.value);

    return { priorityData, typeData, assigneeCountData, assigneeTimeData };
  }, [issues, selectedVersion, selectedYear]);

  return (
    <div className="flex-col gap-6 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* 세부 통계 헤더 및 연도/수정버전 필터 드롭다운 */}
      <div className="flex-row justify-between align-center">
        <div className="flex-col">
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>세부 통계 (Detailed Stats)</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sprint/Version & Year specific metrics and breakdowns</span>
        </div>
        
        {/* 드롭다운 필터 및 고정형 메타정보 박스 */}
        <div className="flex-row gap-3 glass-panel" style={{ padding: '8px 16px', borderRadius: '12px' }}>
          {/* 1. 연도 셀렉터 */}
          <div className="flex-row gap-2">
            <Calendar size={18} color="var(--accent-primary)" />
            <select 
              value={selectedYear} 
              onChange={(e) => handleYearChange(e.target.value)}
              style={{...selectStyle, border: 'none', padding: '0 24px 0 8px', background: 'transparent'}}
            >
              <option value="All">전체 연도</option>
              {availableYears.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />

          {/* 2. 수정버전 셀렉터 */}
          <div className="flex-row gap-2">
            <Tag size={18} color="var(--accent-secondary)" />
            <select 
              value={selectedVersion} 
              onChange={(e) => handleVersionChange(e.target.value)}
              style={{...selectStyle, border: 'none', padding: '0 24px 0 8px', background: 'transparent'}}
            >
              <option value="All">전체 버전 (All)</option>
              {versions.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
          </div>
          
          {/* 3. 고정형 PERIOD 및 WORK DAYS 표시 박스 (minWidth 지정으로 전체/특정 버전 간 레이아웃 변형 100% 방지) */}
          <div className="flex-row gap-4" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <div className="flex-col" style={{ minWidth: '160px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PERIOD</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {versionMetadata ? `${versionMetadata.start} ~ ${versionMetadata.end}` : (selectedYear !== 'All' ? `${selectedYear}년 전체` : '전체 기간')}
              </span>
            </div>
            <div className="flex-col" style={{ minWidth: '80px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WORK DAYS</span>
              <div className="flex-row gap-1">
                <Clock size={12} color="var(--warning)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {versionMetadata ? `${versionMetadata.workDays} days` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 그리드 레이아웃: 1층(우선순위 & 유형) / 2층(담당자 개수 & 평균 처리일수) */}
      <div className="flex-col gap-6 w-full">
        {/* 1층: 이슈 우선순위 & 이슈 유형 (도넛 차트) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          <PriorityChart data={priorityData} />
          <TypeChart data={typeData} />
        </div>

        {/* 2층: 담당자 별 이슈 개수 & 담당자 별 평균 이슈 처리 일수 (수평 바 차트 - 동적 높이 및 두께 최적화) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          <AssigneeCountChart data={assigneeCountData} />
          <AssigneeTimeChart data={assigneeTimeData} />
        </div>
      </div>
    </div>
  );
};

export default DetailedStatsSection;
