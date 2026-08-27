import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Filter,
  Search,
  RotateCcw,
  Sparkles,
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
const selectStyle = {
  appearance: 'none',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  padding: '8px 32px 8px 12px',
  fontSize: '0.88rem',
  outline: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '14px',
  minWidth: '130px'
};

/**
 * [세부 통계 심층 분석 & 이슈 탐색기 페이지 (DetailedStatsPage)]
 * - 다차원 복합 필터 (연도, 버전, 담당자, 유형, 상태, 검색어)
 * - 상단 실시간 반응형 차트 3종 (접기/펼치기 지원)
 * - 하단 고정 헤더 + 내부 스크롤 반응형 이슈 데이터 테이블 (20개 단위 페이지네이션)
 * - 행 클릭 시 상세 정보 모달(IssueDetailModal) 팝업
 */
const DetailedStatsPage = ({ onNavigate, issues = [], versions = [] }) => {
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
      // 1. 연도 필터
      if (selectedYear !== 'All') {
        const shortYear = selectedYear.slice(-2);
        const matchYear = (issue.created && issue.created.slice(0, 4) === selectedYear) ||
                          (issue.fixVersion && issue.fixVersion.startsWith(shortYear));
        if (!matchYear) return false;
      }

      // 2. 버전 필터
      if (selectedVersion !== 'All' && issue.fixVersion !== selectedVersion) {
        return false;
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

  return (
    <div style={{ width: '100%', maxWidth: '1240px', margin: '0 auto' }} className="flex-col gap-6 animate-fade-in">
      {/* 1. 상단 네비게이션 & 타이틀 */}
      <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex-col">
          <div className="flex-row gap-2 align-center" style={{ marginBottom: '6px' }}>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={16} />
              <span>대시보드로 돌아가기</span>
            </button>

            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--accent-primary)',
              padding: '4px 10px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Sparkles size={13} /> DETAILED ANALYTICS & ISSUE EXPLORER
            </span>
          </div>

          <h2 style={{ margin: '4px 0 0 0', fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
            세부 통계 심층 분석 & 이슈 탐색기
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            스프린트 버전 및 담당자별 다차원 필터링과 전체 이슈 실시간 검색·상세 조회를 제공합니다.
          </p>
        </div>

        {/* 차트 접기/펼치기 토글 버튼 */}
        <button
          onClick={() => setIsChartsOpen(!isChartsOpen)}
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Layers size={16} color="var(--accent-primary)" />
          <span>{isChartsOpen ? '통계 차트 접기' : '통계 차트 펼치기'}</span>
          {isChartsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* 2. 다차원 복합 필터 바 (Glass Panel) */}
      <div className="glass-panel flex-col gap-3" style={{ padding: '16px 20px', borderRadius: '12px' }}>
        <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex-row gap-2 align-center">
            <Filter size={18} color="var(--accent-primary)" />
            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>다차원 복합 필터</strong>
          </div>

          {/* 검색창 & 초기화 버튼 */}
          <div className="flex-row gap-2 align-center" style={{ flex: 1, maxWidth: '440px', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="이슈 키(PPLW-...) 또는 제목 검색..."
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
                  padding: '7px 12px 7px 32px',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleResetFilters}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
              title="모든 필터 및 검색 초기화"
            >
              <RotateCcw size={13} />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* 5개 드롭다운 필터 셀렉터 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          width: '100%'
        }}>
          {/* 1. 연도 */}
          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>연도 (YEAR)</span>
            <select value={selectedYear} onChange={handleFilterChange(setSelectedYear)} style={selectStyle}>
              <option value="All">전체 연도</option>
              {availableYears.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
          </div>

          {/* 2. 수정버전 */}
          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>수정버전 (VERSION)</span>
            <select value={selectedVersion} onChange={handleFilterChange(setSelectedVersion)} style={selectStyle}>
              <option value="All">전체 버전 (All)</option>
              {versions.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
          </div>

          {/* 3. 담당자 */}
          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>담당자 (ASSIGNEE)</span>
            <select value={selectedAssignee} onChange={handleFilterChange(setSelectedAssignee)} style={selectStyle}>
              <option value="All">전체 담당자 (All)</option>
              {availableAssignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* 4. 이슈 유형 */}
          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>이슈 유형 (TYPE)</span>
            <select value={selectedType} onChange={handleFilterChange(setSelectedType)} style={selectStyle}>
              <option value="All">전체 유형 (All)</option>
              {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* 5. 상태 */}
          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>상태 (STATUS)</span>
            <select value={selectedStatus} onChange={handleFilterChange(setSelectedStatus)} style={selectStyle}>
              <option value="All">전체 상태 (All)</option>
              {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* 필터 결과 요약 배지 */}
        <div className="flex-row justify-between align-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
          <div className="flex-row gap-3 align-center">
            <span>필터링된 이슈: <strong style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{filteredIssues.length.toLocaleString()}건</strong></span>
            {versionMetadata && (
              <>
                <span>•</span>
                <span>스프린트 기간: <strong style={{ color: 'var(--text-primary)' }}>{versionMetadata.start} ~ {versionMetadata.end}</strong></span>
                <span>•</span>
                <span>Work Days: <strong style={{ color: 'var(--warning)' }}>{versionMetadata.workDays}일</strong></span>
              </>
            )}
          </div>
          <span>페이지 당 <strong>{ITEMS_PER_PAGE}건</strong>씩 표출</span>
        </div>
      </div>

      {/* 3. 상단 차트 3종 영역 (토글형) */}
      {isChartsOpen && (
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
      )}

      {/* 4. 하단 이슈 데이터 테이블 (Issue Explorer) */}
      <div className="glass-panel flex-col" style={{ padding: '20px 24px', borderRadius: '12px', gap: '16px' }}>
        {/* 테이블 헤더 바 */}
        <div className="flex-row justify-between align-center">
          <div className="flex-row gap-2 align-center">
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              이슈 목록 (Issue Explorer)
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--accent-primary)',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {filteredIssues.length} Issues
            </span>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 행(Row)을 클릭하면 상세 정보 및 타임라인을 확인할 수 있습니다.
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

                      {/* Summary (Flex title with ellipsis) */}
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
              {/* 이전 버튼 */}
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

              {/* 페이지 번호 버튼 (최대 7개 노출) */}
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

              {/* 다음 버튼 */}
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
