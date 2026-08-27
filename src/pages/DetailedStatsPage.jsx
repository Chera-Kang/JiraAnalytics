import React, { useState, useMemo } from 'react';
import {
  Filter,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import PriorityChart from '../components/charts/PriorityChart';
import TypeChart from '../components/charts/TypeChart';
import AssigneeCountChart from '../components/charts/AssigneeCountChart';
import IssueDetailModal from '../components/common/IssueDetailModal';

const ITEMS_PER_PAGE = 20;

/**
 * 드롭다운 셀렉터 공통 스타일
 */
const getSelectStyle = (disabled = false) => ({
  appearance: 'none',
  background: disabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
  color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  padding: '8px 32px 8px 12px',
  fontSize: '0.88rem',
  outline: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.55 : 1,
  transition: 'all 0.2s',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '14px',
  minWidth: '130px',
  width: '100%'
});

/**
 * [세부 통계 심층 분석 & 이슈 탐색기 페이지 (DetailedStatsPage)]
 * - 브라우저 뒤로가기 지원 (브라우저 네이티브 네비게이션)
 * - 연도/수정버전 상호 배타적 비활성화 (Mutual Exclusivity)
 * - 검색 필터 2단 배치 (1단: 5개 드롭다운 + 초기화, 2단: 전체너비 검색창 + 우측 건수)
 * - 차트 영역 우측 상단 플로팅 접기/펼치기 버튼
 * - 이슈 테이블 헤더 정리 및 20개 단위 페이지네이션
 * - 이슈 클릭 시 포털 모달(IssueDetailModal) 팝업
 */
const DetailedStatsPage = ({ issues = [], versions = [] }) => {
  // 필터 상태
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedVersion, setSelectedVersion] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // UI 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [isChartsOpen, setIsChartsOpen] = useState(true);
  const [selectedModalIssue, setSelectedModalIssue] = useState(null);

  // 드롭다운 목록 추출
  const availableYears = useMemo(() => {
    const set = new Set();
    issues.forEach(i => {
      if (i.created && i.created.length >= 4) set.add(i.created.slice(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [issues]);

  const availableAssignees = useMemo(() => {
    const set = new Set();
    issues.forEach(i => { if (i.assignee && i.assignee !== '미지정') set.add(i.assignee); });
    return Array.from(set).sort();
  }, [issues]);

  const availableTypes = useMemo(() => {
    const set = new Set();
    issues.forEach(i => { if (i.type && i.type !== 'None') set.add(i.type); });
    return Array.from(set).sort();
  }, [issues]);

  const availableStatuses = useMemo(() => {
    const set = new Set();
    issues.forEach(i => { if (i.status && i.status !== 'None') set.add(i.status); });
    return Array.from(set).sort();
  }, [issues]);

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedYear('All');
    setSelectedVersion('All');
    setSelectedAssignee('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // 선택된 버전 메타데이터
  const versionMetadata = useMemo(() => {
    return versions.find(v => v.name === selectedVersion);
  }, [versions, selectedVersion]);

  // 다차원 필터링 적용된 이슈 목록
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // 1. 연도 필터 (수정버전이 'All'일 때만 연도 필터 유효)
      if (selectedYear !== 'All' && selectedVersion === 'All') {
        const shortYear = selectedYear.slice(-2);
        const matchYear = (issue.created && issue.created.slice(0, 4) === selectedYear) ||
                          (issue.fixVersion && issue.fixVersion.startsWith(shortYear));
        if (!matchYear) return false;
      }

      // 2. 버전 필터 (연도가 'All'일 때만 버전 필터 유효)
      if (selectedVersion !== 'All' && selectedYear === 'All') {
        if (issue.fixVersion !== selectedVersion) return false;
      }

      // 3. 담당자 필터
      if (selectedAssignee !== 'All' && issue.assignee !== selectedAssignee) {
        return false;
      }

      // 4. 이슈 유형 필터
      if (selectedType !== 'All' && issue.type !== selectedType) {
        return false;
      }

      // 5. 상태 필터
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) {
        return false;
      }

      // 6. 검색어 (이슈 키 또는 제목)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchKey = (issue.id || '').toLowerCase().includes(q);
        const matchTitle = (issue.title || '').toLowerCase().includes(q);
        if (!matchKey && !matchTitle) return false;
      }

      return true;
    });
  }, [issues, selectedYear, selectedVersion, selectedAssignee, selectedType, selectedStatus, searchQuery]);

  // 필터 변경 시 페이지를 1로 리셋
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  // 차트 데이터 가공
  const { priorityData, typeData, assigneeCountData } = useMemo(() => {
    const groupBy = (array, key) => {
      return array.reduce((res, cur) => {
        const val = cur[key] || 'None';
        (res[val] = res[val] || []).push(cur);
        return res;
      }, {});
    };

    const toChartData = (obj) => {
      return Object.keys(obj).map(k => ({
        name: k,
        value: obj[k].length
      })).sort((a, b) => b.value - a.value);
    };

    const priorityGrouped = groupBy(filteredIssues, 'priority');
    const typeGrouped = groupBy(filteredIssues, 'type');
    const assigneeGrouped = groupBy(filteredIssues, 'assignee');

    return {
      priorityData: toChartData(priorityGrouped),
      typeData: toChartData(typeGrouped),
      assigneeCountData: toChartData(assigneeGrouped)
    };
  }, [filteredIssues]);

  // 페이지네이션 슬라이스
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / ITEMS_PER_PAGE));
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIssues.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIssues, currentPage]);

  // 뱃지 색상 헬퍼
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Highest':
      case 'High': return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' };
      case 'Medium': return { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' };
      case 'Low':
      case 'Lowest': return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
      default: return { bg: 'rgba(100, 116, 139, 0.12)', text: '#64748b', border: 'rgba(100, 116, 139, 0.25)' };
    }
  };

  const getStatusColor = (status) => {
    if (status === '종료' || status === 'Done' || status === 'Closed') {
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
    }
    if (status === '진행 중' || status === 'In Progress' || status === '개발중') {
      return { bg: 'rgba(37, 99, 235, 0.15)', text: '#3b82f6' };
    }
    if (status.includes('QA') || status.includes('검수')) {
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
    }
    return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8' };
  };

  // 연도/수정버전 상호 배타성 플래그
  const isYearDisabled = selectedVersion !== 'All';
  const isVersionDisabled = selectedYear !== 'All';

  return (
    <div className="flex-col gap-6 w-full animate-fade-in">
      {/* 1. 상단 타이틀 영역 (간소화) */}
      <div className="flex-col gap-1">
        <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
          세부 통계 심층 분석
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          스프린트 버전 및 담당자별 다차원 필터링과 전체 이슈 실시간 검색·상세 조회를 제공합니다.
        </p>
      </div>

      {/* 2. 다차원 복합 필터 바 (1단: 드롭다운+초기화, 2단: 전체너비 검색창+우측 건수) */}
      <div className="glass-panel flex-col gap-4" style={{ padding: '18px 22px', borderRadius: '12px' }}>
        {/* 1단: 필터 타이틀 & 5개 드롭다운 & 초기화 버튼 */}
        <div className="flex-col gap-3 w-full">
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-2 align-center">
              <Filter size={17} color="var(--accent-primary)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>다차원 복합 필터</strong>
            </div>

            <button
              onClick={handleResetFilters}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
              title="모든 필터 및 검색 초기화"
            >
              <RotateCcw size={13} />
              <span>초기화</span>
            </button>
          </div>

          {/* 5개 드롭다운 필터 셀렉터 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            width: '100%'
          }}>
            {/* 1. 연도 (수정버전 선택 시 비활성화) */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                연도 (YEAR) {isYearDisabled && <span style={{ color: 'var(--warning)', fontSize: '0.68rem' }}>(버전선택됨)</span>}
              </span>
              <select
                value={selectedYear}
                onChange={handleFilterChange(setSelectedYear)}
                disabled={isYearDisabled}
                style={getSelectStyle(isYearDisabled)}
              >
                <option value="All">전체 연도</option>
                {availableYears.map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
            </div>

            {/* 2. 수정버전 (연도 선택 시 비활성화) */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                수정버전 (VERSION) {isVersionDisabled && <span style={{ color: 'var(--warning)', fontSize: '0.68rem' }}>(연도선택됨)</span>}
              </span>
              <select
                value={selectedVersion}
                onChange={handleFilterChange(setSelectedVersion)}
                disabled={isVersionDisabled}
                style={getSelectStyle(isVersionDisabled)}
              >
                <option value="All">전체 버전 (All)</option>
                {versions.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
            </div>

            {/* 3. 담당자 */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>담당자 (ASSIGNEE)</span>
              <select value={selectedAssignee} onChange={handleFilterChange(setSelectedAssignee)} style={getSelectStyle(false)}>
                <option value="All">전체 담당자 (All)</option>
                {availableAssignees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* 4. 이슈 유형 */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>이슈 유형 (TYPE)</span>
              <select value={selectedType} onChange={handleFilterChange(setSelectedType)} style={getSelectStyle(false)}>
                <option value="All">전체 유형 (All)</option>
                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 5. 상태 */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>상태 (STATUS)</span>
              <select value={selectedStatus} onChange={handleFilterChange(setSelectedStatus)} style={getSelectStyle(false)}>
                <option value="All">전체 상태 (All)</option>
                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2단: 전체 너비 검색창 & 우측 결과 건수 배지 */}
        <div className="flex-row justify-between align-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
          {/* 전체 너비 검색창 */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="이슈 키(PPLW-...) 또는 제목 실시간 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '9px 14px 9px 38px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* 우측 정렬 필터링된 이슈 건수 */}
          <div className="flex-row gap-3 align-center" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>필터링된 이슈: <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem', fontWeight: 700 }}>{filteredIssues.length.toLocaleString()}건</strong></span>
            {versionMetadata && (
              <>
                <span>•</span>
                <span>기간: <strong style={{ color: 'var(--text-primary)' }}>{versionMetadata.start} ~ {versionMetadata.end}</strong></span>
                <span>•</span>
                <span>Work Days: <strong style={{ color: 'var(--warning)' }}>{versionMetadata.workDays}일</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. 상단 차트 3종 영역 (FAB 접기 버튼 내장) */}
      {isChartsOpen ? (
        <div style={{ position: 'relative', width: '100%' }}>
          {/* 차트 영역 우측 상단 플로팅 접기 FAB 버튼 */}
          <button
            onClick={() => setIsChartsOpen(false)}
            style={{
              position: 'absolute',
              top: '-14px',
              right: '16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              zIndex: 5,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            title="통계 차트 접기"
          >
            <ChevronUp size={14} />
            <span>차트 접기</span>
          </button>

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
      ) : (
        /* 차트가 접혔을 때 펼치기 버튼 */
        <div className="flex-row justify-end w-full" style={{ marginTop: '-8px' }}>
          <button
            onClick={() => setIsChartsOpen(true)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
          >
            <Layers size={14} />
            <span>통계 차트 펼치기</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* 4. 하단 이슈 데이터 테이블 */}
      <div className="glass-panel flex-col" style={{ padding: '20px 24px', borderRadius: '12px', gap: '14px' }}>
        {/* 테이블 도움말 문구 */}
        <div className="flex-row justify-between align-center">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            💡 행(Row)을 클릭하면 상세 타임라인 및 설명·코멘트를 확인할 수 있습니다.
          </span>
        </div>

        {/* 반응형 스크롤 테이블 컨테이너 */}
        <div style={{
          width: '100%',
          maxHeight: '520px',
          overflowY: 'auto',
          overflowX: 'auto',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          background: 'var(--bg-secondary)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            {/* Sticky Header */}
            <thead style={{
              position: 'sticky',
              top: 0,
              background: 'var(--bg-tertiary)',
              borderBottom: '2px solid var(--border-color)',
              zIndex: 10
            }}>
              <tr>
                <th style={{ padding: '12px 14px', width: '105px', color: 'var(--text-muted)', fontWeight: 600 }}>KEY</th>
                <th style={{ padding: '12px 10px', width: '85px', color: 'var(--text-muted)', fontWeight: 600 }}>유형</th>
                <th style={{ padding: '12px 10px', width: '85px', color: 'var(--text-muted)', fontWeight: 600 }}>우선순위</th>
                <th style={{ padding: '12px 10px', width: '85px', color: 'var(--text-muted)', fontWeight: 600 }}>상태</th>
                <th style={{ padding: '12px 14px', minWidth: '240px', color: 'var(--text-muted)', fontWeight: 600 }}>제목 (SUMMARY)</th>
                <th style={{ padding: '12px 12px', width: '110px', color: 'var(--text-muted)', fontWeight: 600 }}>담당자</th>
                <th style={{ padding: '12px 12px', width: '110px', color: 'var(--text-muted)', fontWeight: 600 }}>수정버전</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedIssues.length > 0 ? (
                paginatedIssues.map((issue) => {
                  const priorityStyle = getPriorityColor(issue.priority);
                  const statusStyle = getStatusColor(issue.status);

                  return (
                    <tr
                      key={issue.id}
                      onClick={() => setSelectedModalIssue(issue)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Key */}
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                        <span style={{
                          color: 'var(--accent-primary)',
                          background: 'rgba(37, 99, 235, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          {issue.id}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {issue.type}
                        </span>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: priorityStyle.text,
                          background: priorityStyle.bg,
                          border: `1px solid ${priorityStyle.border}`,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {issue.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: statusStyle.text,
                          background: statusStyle.bg,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {issue.status}
                        </span>
                      </td>

                      {/* Summary */}
                      <td style={{ padding: '10px 14px' }}>
                        <div
                          style={{
                            maxWidth: '480px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--text-primary)',
                            fontWeight: 500
                          }}
                          title={issue.title}
                        >
                          {issue.title}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {issue.assignee}
                      </td>

                      {/* Fix Version */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        {issue.fixVersion}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    조건에 일치하는 이슈가 없습니다. 필터를 변경해 보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. 페이지네이션 컨트롤러 */}
        {totalPages > 1 && (
          <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              총 <strong>{filteredIssues.length}</strong>개 이슈 중{' '}
              <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> ~{' '}
              <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredIssues.length)}</strong>번째
            </span>

            <div className="flex-row gap-1 align-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-primary)'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                })
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        style={{
                          background: currentPage === page ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                          color: currentPage === page ? '#ffffff' : 'var(--text-primary)',
                          border: currentPage === page ? 'none' : '1px solid var(--border-color)',
                          borderRadius: '6px',
                          minWidth: '32px',
                          height: '32px',
                          fontSize: '0.85rem',
                          fontWeight: currentPage === page ? 700 : 500,
                          cursor: 'pointer',
                          boxShadow: currentPage === page ? 'var(--shadow-glow)' : 'none'
                        }}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-primary)'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. 이슈 상세 팝업 모달 */}
      {selectedModalIssue && (
        <IssueDetailModal
          issue={selectedModalIssue}
          onClose={() => setSelectedModalIssue(null)}
        />
      )}
    </div>
  );
};

export default DetailedStatsPage;
