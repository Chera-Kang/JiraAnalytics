import React, { useState, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Filter,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  CheckCircle2,
  Clock,
  RefreshCw,
  Info,
  ListFilter
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import IssueDetailModal from '../components/common/IssueDetailModal';
import { getPriorityColor, getTypeColor } from '../utils/jiraColors';

const ITEMS_PER_PAGE = 20;

// 정해진 우선순위 정렬 순서 (Highest -> High -> Medium -> Low -> Lowest)
const PRIORITY_ORDER = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

// 정해진 이슈 유형 정렬 순서 (Planning -> Design -> 스토리 -> 작업 -> 하위 작업 -> 버그)
const TYPE_ORDER = ['Planning', 'Design', '스토리', 'Story', '작업', 'Task', '하위 작업', '하위작업', 'Sub-task', '버그', 'Bug'];

/**
 * [포털 기반 즉각 반응형 커스텀 툴팁 컴포넌트]
 * - ReactDOM.createPortal을 사용하여 document.body에 최상위(z-index: 999999) fixed 렌더링
 * - 어떤 부모의 backdrop-filter, overflow, glass-panel 스타일에도 가려지지 않음
 */
const InfoTooltip = ({ content }) => {
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);

  const handleMouseEnter = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2
      });
    }
  };

  const handleMouseLeave = () => {
    setCoords(null);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          cursor: 'help',
          display: 'inline-flex',
          alignItems: 'center',
          color: coords ? 'var(--accent-primary)' : 'var(--text-muted)',
          transition: 'color 0.15s'
        }}
      >
        <Info size={14} />
      </button>
      {coords && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(8px)',
            color: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 500,
            lineHeight: 1.45,
            whiteSpace: 'nowrap',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 999999,
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease',
            textAlign: 'center'
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: 'rgba(15, 23, 42, 0.96) transparent transparent transparent'
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
};

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
  fontWeight: 500,
  outline: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.55 : 1,
  transition: 'all 0.2s',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '14px',
  width: '100%'
});

/**
 * [세부 통계 심층 분석 & 이슈 탐색기 페이지 (DetailedStatsPage)]
 * - 1단 5종 드롭다운 검색필터 (연도, 수정버전, 담당자, 이슈유형, 상태) + 초기화
 * - 필터 하단 테두리에 1/3 걸친 플로팅 접기/펼치기 토글 (4대 KPI + 차트 전체 포함)
 * - 2-Column 차트: [좌측: 12시 시계방향 우선순위/유형 순서정렬 도넛 통합] vs [우측: 스프린트/담당자 전환 콤보 차트]
 * - 하단 이슈 탐색기: 헤더 내 검색창 배치, 소요일수 칼럼 추가, 20건 페이징, 상세 모달 연동
 */
const DetailedStatsPage = ({ issues = [], versions = [], onNavigate, isPrivacyMode = true }) => {
  // 필터 상태
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedVersion, setSelectedVersion] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 콤보 차트 뷰 모드: 'auto' | 'sprint' | 'assignee'
  const [comboViewMode, setComboViewMode] = useState('auto');

  // UI 상태 (통계 요약 & 차트 접기/펼치기)
  const [isChartsOpen, setIsChartsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedModalIssue, setSelectedModalIssue] = useState(null);

  // 드롭다운 목록 추출 (역순 정렬: 2026년 우선)
  const availableYears = useMemo(() => {
    const set = new Set();
    issues.forEach(i => {
      if (i.created && i.created.length >= 4) set.add(i.created.slice(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [issues]);

  const availableAssignees = useMemo(() => {
    const set = new Set();
    issues.forEach(i => { if (i.assignee && i.assignee !== '미지정' && i.assignee !== 'None' && i.assignee !== '-') set.add(i.assignee); });
    return Array.from(set).sort();
  }, [issues]);

  // 이슈 유형 드롭다운 목록 (정해진 TYPE_ORDER 순 정렬)
  const availableTypes = useMemo(() => {
    const set = new Set();
    issues.forEach(i => { if (i.type && i.type !== 'None') set.add(i.type); });
    return Array.from(set).sort((a, b) => {
      const idxA = TYPE_ORDER.indexOf(a);
      const idxB = TYPE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, 'ko');
    });
  }, [issues]);

  const availableStatuses = useMemo(() => {
    const set = new Set();
    issues.forEach(i => { if (i.status && i.status !== 'None') set.add(i.status); });
    return Array.from(set).sort();
  }, [issues]);

  // 수정버전 최신순 정렬 (역순)
  const reversedVersions = useMemo(() => {
    return [...versions].reverse();
  }, [versions]);

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedYear('All');
    setSelectedVersion('All');
    setSelectedAssignee('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setComboViewMode('auto');
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

  // 4대 KPI 요약 지표 계산
  const kpiStats = useMemo(() => {
    const total = filteredIssues.length;
    if (total === 0) {
      return { total: 0, resolved: 0, avgDays: '-', reopenCount: 0, targetTotal: 0, reopenRate: '0.0' };
    }

    let resolvedCount = 0;
    let totalDays = 0;
    let daysCount = 0;
    let reopenCount = 0;
    let targetTotal = 0;

    const targetTypes = ['작업', 'Task', '하위 작업', 'Sub-task', '버그', 'Bug'];

    filteredIssues.forEach(i => {
      const s = (i.status || '').toLowerCase();
      if (s === '종료' || s === 'done' || s === 'closed' || s === 'dev complete' || s === '개발완료') {
        resolvedCount += 1;
      }

      if (typeof i.resolutionTimeDays === 'number' && i.resolutionTimeDays > 0) {
        totalDays += i.resolutionTimeDays;
        daysCount += 1;
      }

      if (targetTypes.includes(i.type)) {
        targetTotal += 1;
        if (typeof i.reopenCounter === 'number' && i.reopenCounter > 0) {
          reopenCount += 1;
        }
      }
    });

    const avgDays = daysCount > 0 ? (totalDays / daysCount).toFixed(1) : '-';
    const reopenRate = targetTotal > 0 ? ((reopenCount / targetTotal) * 100).toFixed(1) : '0.0';

    return {
      total,
      resolved: resolvedCount,
      avgDays,
      reopenCount,
      targetTotal,
      reopenRate
    };
  }, [filteredIssues]);

  // 차트 1 & 2 데이터: 우선순위 및 이슈 유형 (정해진 순서대로 엄격 정렬)
  const { priorityData, typeData } = useMemo(() => {
    const priorityCounts = new Map();
    const typeCounts = new Map();

    filteredIssues.forEach(i => {
      // 우선순위 집계
      const p = i.priority || 'Medium';
      priorityCounts.set(p, (priorityCounts.get(p) || 0) + 1);

      // 이슈 유형 정규화 & 집계
      let t = i.type || '기타';
      if (t === 'Task') t = '작업';
      if (t === 'Story') t = '스토리';
      if (t === 'Sub-task' || t === '하위작업') t = '하위 작업';
      if (t === 'Bug') t = '버그';
      typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
    });

    // 1. 우선순위: Highest -> High -> Medium -> Low -> Lowest
    const sortedPriorityData = Array.from(priorityCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const indexA = PRIORITY_ORDER.indexOf(a.name);
        const indexB = PRIORITY_ORDER.indexOf(b.name);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return b.value - a.value;
      });

    // 2. 이슈 유형: Planning -> Design -> 스토리 -> 작업 -> 하위 작업 -> 버그
    const sortedTypeData = Array.from(typeCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const indexA = TYPE_ORDER.indexOf(a.name);
        const indexB = TYPE_ORDER.indexOf(b.name);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return b.value - a.value;
      });

    return {
      priorityData: sortedPriorityData,
      typeData: sortedTypeData
    };
  }, [filteredIssues]);

  // 수정버전 선택 여부 및 담당자 뷰 모드 결정
  const isVersionSelected = selectedVersion !== 'All';
  const isAssigneeMode = isVersionSelected || comboViewMode === 'assignee';

  // 차트 3 데이터: 스마트 동적 콤보 차트 (스프린트별 ⟷ 담당자별 모드 지원)
  const { chartData: smartChartData, chartTitle: smartChartTitle } = useMemo(() => {
    // [모드 A] 담당자별 모드: 필터링된 이슈 기준 담당자별 처리 건수 & 소요일수 집계
    if (isAssigneeMode) {
      const assigneeMap = new Map();
      filteredIssues.forEach(i => {
        const name = i.assignee && i.assignee !== '미지정' && i.assignee !== 'None' && i.assignee !== '-' ? i.assignee : '미지정';
        if (!assigneeMap.has(name)) {
          assigneeMap.set(name, { name, count: 0, totalDays: 0, daysCount: 0 });
        }
        const item = assigneeMap.get(name);
        item.count += 1;
        if (typeof i.resolutionTimeDays === 'number' && i.resolutionTimeDays > 0) {
          item.totalDays += i.resolutionTimeDays;
          item.daysCount += 1;
        }
      });

      const data = Array.from(assigneeMap.values())
        .sort((a, b) => b.count - a.count)
        .map(item => ({
          name: item.name,
          count: item.count,
          avgDays: item.daysCount > 0 ? parseFloat((item.totalDays / item.daysCount).toFixed(1)) : 0
        }));

      let title = '담당자별 이슈 처리 건수 & 소요 일수';
      if (selectedVersion !== 'All') {
        title = `[${selectedVersion}] 담당자별 처리 건수 & 소요 일수`;
      } else if (selectedYear !== 'All') {
        title = `[${selectedYear}년] 담당자별 처리 건수 & 소요 일수`;
      }

      return {
        chartData: data,
        chartTitle: title
      };
    }

    // [모드 B] 스프린트 버전별 모드: 연도 또는 전체 연도 기준 스프린트 트렌드
    const issuesVersionSet = new Set(
      issues.map(i => i.fixVersion).filter(v => v && v !== '미지정' && v !== 'None' && v !== '-')
    );

    const validVersionsInOrder = versions
      .filter(v => issuesVersionSet.has(v.name))
      .map(v => v.name);

    let targetVersionNames = [];
    let title = '이슈 평균 처리 건수 & 소요 일수';

    if (selectedYear !== 'All') {
      const yearPrefix = selectedYear.slice(-2); // '25'
      targetVersionNames = validVersionsInOrder.filter(vName => {
        const vObj = versions.find(v => v.name === vName);
        return vName.startsWith(yearPrefix) || (vObj?.start && vObj.start.includes(selectedYear));
      });
      title = `[${selectedYear}년] 이슈 평균 처리 건수 & 소요 일수`;
    } else {
      // 전체 연도일 때: 실제 이슈가 있는 최근 12개 유효 스프린트 (과거 -> 최신 순)
      targetVersionNames = validVersionsInOrder.slice(-12);
      title = `이슈 평균 처리 건수 & 소요 일수 (최근 스프린트)`;
    }

    if (targetVersionNames.length === 0) {
      const presentVersions = Array.from(new Set(
        filteredIssues.map(i => i.fixVersion).filter(v => v && v !== '미지정' && v !== '-')
      ));
      targetVersionNames = presentVersions.slice(-12);
    }

    const versionMap = new Map();
    targetVersionNames.forEach(vName => {
      versionMap.set(vName, { name: vName, count: 0, totalDays: 0, daysCount: 0 });
    });

    filteredIssues.forEach(i => {
      const v = i.fixVersion;
      if (v && versionMap.has(v)) {
        const item = versionMap.get(v);
        item.count += 1;
        if (typeof i.resolutionTimeDays === 'number' && i.resolutionTimeDays > 0) {
          item.totalDays += i.resolutionTimeDays;
          item.daysCount += 1;
        }
      }
    });

    const data = Array.from(versionMap.values()).map(item => ({
      name: item.name,
      count: item.count,
      avgDays: item.daysCount > 0 ? parseFloat((item.totalDays / item.daysCount).toFixed(1)) : 0
    }));

    return {
      chartData: data,
      chartTitle: title
    };
  }, [issues, filteredIssues, versions, selectedYear, selectedVersion, isAssigneeMode]);

  // 페이지네이션 슬라이스
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / ITEMS_PER_PAGE));
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIssues.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIssues, currentPage]);

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === '종료' || s === 'done' || s === 'closed') {
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
    }
    if (s === '진행 중' || s === 'in progress' || s === '개발중' || s === 'dev complete' || s.includes('dev complete') || s === '개발완료') {
      return { bg: 'rgba(37, 99, 235, 0.15)', text: '#3b82f6' };
    }
    if (s.includes('qa') || s.includes('검수')) {
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
    }
    if (s.includes('reopen') || s.includes('재오픈')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
    }
    return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8' };
  };

  // 연도/수정버전 상호 배타성 플래그
  const isYearDisabled = selectedVersion !== 'All';
  const isVersionDisabled = selectedYear !== 'All';

  // 미지정 대체 포맷 헬퍼
  const formatValue = (val) => (!val || val === '미지정' || val === 'None') ? '-' : val;

  return (
    <div className="flex-col w-full animate-fade-in" style={{ gap: '14px' }}>
      {/* 1. 상단 타이틀 영역 (Title | Subtitle 1줄 표기) */}
      <div className="flex-row align-center gap-3" style={{ flexWrap: 'wrap', marginBottom: '6px' }}>
        <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
          세부 통계 심층 분석
        </h2>
        <span style={{ color: 'var(--border-color)', fontSize: '1.2rem', fontWeight: 300 }}>|</span>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: 500 }}>
          다차원 필터링 기반 심층 이슈 탐색 및 세부 통계
        </p>
      </div>

      {/* 2. 1단 검색필터 바 + 테두리에 1/3 걸친 플로팅 접기/펼치기 버튼 */}
      <div style={{ position: 'relative', width: '100%', marginBottom: isChartsOpen ? '16px' : '0px' }}>
        <div className="glass-panel flex-col gap-3" style={{ padding: '20px 22px 26px 22px', borderRadius: '12px' }}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-2 align-center">
              <Filter size={17} color="var(--accent-primary)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>검색필터</strong>
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
              title="모든 필터 초기화"
            >
              <RotateCcw size={13} />
              <span>초기화</span>
            </button>
          </div>

          {/* 5개 드롭다운 필터 셀렉터 (순서: 연도 -> 수정버전 -> 담당자 -> 이슈 유형 -> 상태) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            width: '100%'
          }}>
            {/* 1. 연도 (수정버전 선택 시 비활성화, 역순 2026 우선) */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                연도 (Year) {isYearDisabled && <span style={{ color: 'var(--warning)', fontSize: '0.68rem' }}>(버전선택됨)</span>}
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

            {/* 2. 수정버전 (연도 선택 시 비활성화, 최신순 역순) */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                수정버전 {isVersionDisabled && <span style={{ color: 'var(--warning)', fontSize: '0.68rem' }}>(연도선택됨)</span>}
              </span>
              <select
                value={selectedVersion}
                onChange={handleFilterChange(setSelectedVersion)}
                disabled={isVersionDisabled}
                style={getSelectStyle(isVersionDisabled)}
              >
                <option value="All">전체 버전</option>
                {reversedVersions.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
            </div>

            {/* 3. 담당자 */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>담당자</span>
              <select value={selectedAssignee} onChange={handleFilterChange(setSelectedAssignee)} style={getSelectStyle(false)}>
                <option value="All">전체 담당자</option>
                {availableAssignees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* 4. 이슈 유형 (Planning -> Bug 순) */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>이슈 유형</span>
              <select value={selectedType} onChange={handleFilterChange(setSelectedType)} style={getSelectStyle(false)}>
                <option value="All">전체 유형</option>
                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 5. 상태 */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>상태</span>
              <select value={selectedStatus} onChange={handleFilterChange(setSelectedStatus)} style={getSelectStyle(false)}>
                <option value="All">전체 상태</option>
                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 필터 하단 테두리에 1/3 걸친 플로팅 접기/펼치기 토글 버튼 */}
        <div style={{
          position: 'absolute',
          bottom: '-14px',
          right: '26px',
          zIndex: 20
        }}>
          <button
            onClick={() => setIsChartsOpen(!isChartsOpen)}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
          >
            <Layers size={13} />
            <span>{isChartsOpen ? '통계 요약 및 차트 접기' : '통계 요약 및 차트 펼치기'}</span>
            {isChartsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* 3. 접힘 대상: [4대 KPI 요약 카드] + [2-Column 통합 차트 영역] */}
      {isChartsOpen && (
        <div className="flex-col gap-4 w-full animate-fade-in" style={{ marginBottom: '6px' }}>
          {/* [1] 4대 KPI 요약 카드 4종 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            width: '100%'
          }}>
            {/* 카드 1: 총 이슈 */}
            <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>총 이슈</span>
                <Award size={18} color="var(--accent-primary)" />
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {kpiStats.total.toLocaleString()}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>건</span>
              </span>
            </div>

            {/* 카드 2: 해결 완료 */}
            <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--success)' }}>
              <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>해결 완료</span>
                <CheckCircle2 size={18} color="var(--success)" />
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                {kpiStats.resolved.toLocaleString()}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>건</span>
              </span>
            </div>

            {/* 카드 3: 평균 개발 소요일수 (포털 툴팁 & 이탤릭 안내) */}
            <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--warning)' }}>
              <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
                <div className="flex-row gap-1 align-center">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>평균 개발 소요일수</span>
                  <InfoTooltip content={
                    <div>
                      <div>작업 시작(Date 1) ~ 개발 완료(Date 2) 소요 일수의 평균</div>
                      <div style={{ marginTop: '4px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.73rem' }}>
                        * 기획/디자인/검증은 정확하지 않을 수 있음
                      </div>
                    </div>
                  } />
                </div>
                <Clock size={18} color="var(--warning)" />
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                {kpiStats.avgDays}
                {kpiStats.avgDays !== '-' && <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>일</span>}
              </span>
            </div>

            {/* 카드 4: Reopen Rate (포털 툴팁) */}
            <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--danger)' }}>
              <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
                <div className="flex-row gap-1 align-center">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Reopen Rate</span>
                  <InfoTooltip content={
                    <div>작업·하위 작업·버그 이슈 중 Reopen(재작업)이 1회 이상 발생한 이슈 비율</div>
                  } />
                </div>
                <RefreshCw size={17} color="var(--danger)" />
              </div>
              <div className="flex-row align-center gap-2">
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
                  {kpiStats.reopenRate}%
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '2px' }}>
                  ({kpiStats.reopenCount}건 / {kpiStats.targetTotal}건)
                </span>
              </div>
            </div>
          </div>

          {/* [2] 2-Column 차트 그리드: [좌측: 우선순위+유형 통합 도넛] vs [우측: 와이드 콤보 차트] */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '16px',
              width: '100%',
              marginTop: '4px'
            }}
          >
            {/* 좌측: 이슈 분류 분포 (우선순위 & 이슈 유형 나란히 2개 도넛) */}
            <div className="glass-panel flex-col" style={{ minHeight: '370px', padding: '18px 20px' }}>
              <h4 style={{ margin: '0 0 12px 0', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                이슈 분류 분포
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                flex: 1,
                width: '100%',
                minHeight: '280px'
              }}>
                {/* 도넛 1: 우선순위 (12시 시작 시계방향 Highest -> Lowest 순 정렬) */}
                <div className="flex-col align-center" style={{ width: '100%', height: '100%' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px', textAlign: 'center', width: '100%' }}>
                    우선순위
                  </span>
                  <div style={{ flex: 1, width: '100%', minHeight: '240px' }}>
                    {priorityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
                            endAngle={-270}
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2.5}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={250}
                            animationEasing="ease-out"
                          >
                            {priorityData.map((entry, index) => (
                              <Cell key={`pri-cell-${index}`} fill={getPriorityColor(entry.name).fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', boxShadow: 'var(--shadow-md)' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{payload[0].name}: </span>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{payload[0].value}건</strong>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend
                            content={() => (
                              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 12px', fontSize: '0.76rem', paddingTop: '8px' }}>
                                {priorityData.map((item) => (
                                  <div key={`pri-legend-${item.name}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getPriorityColor(item.name).fill }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        데이터 없음
                      </div>
                    )}
                  </div>
                </div>

                {/* 도넛 2: 이슈 유형 (Planning -> Design -> 스토리 -> 작업 -> 하위 작업 -> 버그 순 정렬) */}
                <div className="flex-col align-center" style={{ width: '100%', height: '100%' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px', textAlign: 'center', width: '100%' }}>
                    이슈 유형
                  </span>
                  <div style={{ flex: 1, width: '100%', minHeight: '240px' }}>
                    {typeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeData}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
                            endAngle={-270}
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2.5}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={250}
                            animationEasing="ease-out"
                          >
                            {typeData.map((entry, index) => (
                              <Cell key={`type-cell-${index}`} fill={getTypeColor(entry.name).fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', boxShadow: 'var(--shadow-md)' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{payload[0].name}: </span>
                                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{payload[0].value}건</strong>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend
                            content={() => (
                              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 12px', fontSize: '0.76rem', paddingTop: '8px' }}>
                                {typeData.map((item) => (
                                  <div key={`type-legend-${item.name}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getTypeColor(item.name).fill }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        데이터 없음
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 스마트 동적 콤보 차트 (스프린트별 ⟷ 담당자별 뷰 전환 토글 지원 & 하단 공간 최적화) */}
            <div className="glass-panel flex-col" style={{ minHeight: '370px', padding: '18px 20px' }}>
              <div className="flex-row justify-between align-center" style={{ marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {smartChartTitle}
                </h4>

                {/* 수정버전 vs 담당자 뷰 토글 스위처 (수정버전 선택 시 수정버전별 비활성화) */}
                <div className="flex-row gap-1" style={{
                  background: 'var(--bg-secondary)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <button
                    type="button"
                    disabled={isVersionSelected}
                    onClick={() => setComboViewMode('sprint')}
                    style={{
                      background: !isAssigneeMode ? 'var(--accent-gradient)' : 'transparent',
                      color: !isAssigneeMode ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: isVersionSelected ? 'not-allowed' : 'pointer',
                      opacity: isVersionSelected ? 0.4 : 1,
                      transition: 'all 0.15s'
                    }}
                    title={isVersionSelected ? '수정버전 선택 시 담당자별 통계로 고정됩니다' : '수정버전별 추세 보기'}
                  >
                    수정버전
                  </button>
                  <button
                    type="button"
                    onClick={() => setComboViewMode('assignee')}
                    style={{
                      background: isAssigneeMode ? 'var(--accent-gradient)' : 'transparent',
                      color: isAssigneeMode ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    담당자
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, width: '100%', minHeight: '290px' }}>
                {smartChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={smartChartData}
                      margin={{
                        top: 10,
                        right: 15,
                        bottom: 0,
                        left: -10
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.7} vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="var(--text-muted)"
                        tick={{
                          fill: 'var(--text-secondary)',
                          fontSize: smartChartData.length > 8 ? '0.72rem' : '0.78rem',
                          dy: 3
                        }}
                        interval={0}
                        angle={smartChartData.length > 5 ? -25 : 0}
                        textAnchor={smartChartData.length > 5 ? 'end' : 'middle'}
                        height={38}
                        axisLine={{ stroke: 'var(--border-color)' }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="var(--text-muted)"
                        tick={{ fill: 'var(--text-secondary)', fontSize: '0.8rem' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="var(--text-muted)"
                        tick={{ fill: 'var(--text-secondary)', fontSize: '0.8rem' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
                                <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
                                {payload.map((entry, index) => (
                                  <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: entry.color }} />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                      {entry.name}: <strong style={{ color: 'var(--text-primary)' }}>{entry.value}{entry.dataKey === 'avgDays' ? '일' : '건'}</strong>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: '8px', paddingBottom: '0px', lineHeight: '20px', fontSize: '0.8rem' }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="count"
                        name="처리 이슈 건수"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={smartChartData.length > 8 ? 16 : 24}
                        animationBegin={0}
                        animationDuration={250}
                        animationEasing="ease-out"
                        cursor={isAssigneeMode ? 'pointer' : 'default'}
                        onClick={(entry) => {
                          if (isAssigneeMode && entry?.name && entry.name !== '미지정' && entry.name !== '-' && onNavigate) {
                            onNavigate('memberStats', { user: entry.name });
                          }
                        }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgDays"
                        name="평균 소요일수"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, strokeWidth: 1.5, fill: 'var(--bg-secondary)' }}
                        activeDot={{ r: 5, strokeWidth: 0, fill: '#f59e0b' }}
                        animationBegin={0}
                        animationDuration={250}
                        animationEasing="ease-out"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    데이터가 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 전체 이슈 목록 탐색기 (헤더 내 검색창 & 소요일수 칼럼 추가) */}
      <div className="glass-panel flex-col gap-4" style={{ padding: '20px 22px', borderRadius: '12px' }}>
        {/* 테이블 상단 헤더: 타이틀 & 건수 & 실시간 검색창 */}
        <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex-row gap-2 align-center">
            <ListFilter size={18} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              이슈 목록
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              (총 <strong style={{ color: 'var(--accent-primary)' }}>{filteredIssues.length.toLocaleString()}</strong>건)
            </span>
            {versionMetadata && (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                • 기간: <strong style={{ color: 'var(--text-primary)' }}>{versionMetadata.start} ~ {versionMetadata.end}</strong>
                {' '}(<strong style={{ color: 'var(--warning)' }}>{versionMetadata.workDays}일</strong>)
              </span>
            )}
          </div>

          {/* 분리된 검색 필드 */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="이슈 키 또는 제목 검색..."
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
                <th style={{ padding: '12px 14px', width: '120px', minWidth: '115px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>키</th>
                <th style={{ padding: '12px 10px', width: '85px', color: 'var(--text-muted)', fontWeight: 600 }}>유형</th>
                <th style={{ padding: '12px 10px', width: '85px', color: 'var(--text-muted)', fontWeight: 600 }}>우선순위</th>
                <th style={{ padding: '12px 10px', width: '95px', color: 'var(--text-muted)', fontWeight: 600 }}>상태</th>
                <th style={{ padding: '12px 14px', minWidth: '240px', color: 'var(--text-muted)', fontWeight: 600 }}>제목</th>
                <th style={{ padding: '12px 12px', width: '110px', minWidth: '90px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>담당자</th>
                <th style={{ padding: '12px 12px', width: '110px', minWidth: '90px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>수정버전</th>
                <th style={{ padding: '12px 12px', width: '95px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>소요일수</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedIssues.length > 0 ? (
                paginatedIssues.map((issue) => {
                  const priorityStyle = getPriorityColor(issue.priority);
                  const typeStyle = getTypeColor(issue.type);
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
                      <td style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <span style={{
                          color: 'var(--accent-primary)',
                          background: 'rgba(37, 99, 235, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap'
                        }}>
                          {issue.id}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: typeStyle.text,
                          background: typeStyle.bg,
                          border: `1px solid ${typeStyle.border}`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {issue.type}
                        </span>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: priorityStyle.text,
                          background: priorityStyle.bg,
                          border: `1px solid ${priorityStyle.border}`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {issue.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: statusStyle.text,
                          background: statusStyle.bg,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {issue.status}
                        </span>
                      </td>

                      {/* Summary */}
                      <td style={{ padding: '10px 14px' }}>
                        <div
                          className={isPrivacyMode ? 'privacy-blur' : ''}
                          style={{
                            maxWidth: '480px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: 'var(--text-primary)',
                            fontWeight: 500
                          }}
                          title={isPrivacyMode ? '마스킹 처리됨' : issue.title}
                        >
                          {issue.title}
                        </div>
                      </td>

                      {/* Assignee (클릭 시 개인별 대시보드로 이동) */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {issue.assignee && issue.assignee !== '미지정' && issue.assignee !== 'None' && issue.assignee !== '-' ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate) {
                                onNavigate('memberStats', { user: issue.assignee });
                              }
                            }}
                            className={isPrivacyMode ? 'privacy-blur' : ''}
                            style={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'rgba(37, 99, 235, 0.06)',
                              border: '1px solid rgba(37, 99, 235, 0.15)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.15)';
                              e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.06)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            title={isPrivacyMode ? '마스킹 처리됨' : `👤 ${issue.assignee} 님의 개인 기여 리포트 보기`}
                          >
                            {issue.assignee}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      {/* Fix Version */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatValue(issue.fixVersion)}
                      </td>

                      {/* Resolution Time Days */}
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--warning)', whiteSpace: 'nowrap' }}>
                        {issue.resolutionTimeDays ? `${issue.resolutionTimeDays}일` : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
              총 <strong>{filteredIssues.length.toLocaleString()}</strong>개 이슈 중{' '}
              <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> ~{' '}
              <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredIssues.length)}</strong>번째
            </span>

            <div className="flex-row gap-1 align-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1
                }}
                title="첫 페이지"
              >
                <ChevronsLeft size={14} />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1
                }}
                title="이전 페이지"
              >
                <ChevronLeft size={14} />
              </button>

              <span style={{ fontSize: '0.85rem', padding: '0 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1
                }}
                title="다음 페이지"
              >
                <ChevronRight size={14} />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1
                }}
                title="마지막 페이지"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. 상세 모달 연동 */}
      {selectedModalIssue && (
        <IssueDetailModal
          issue={selectedModalIssue}
          onClose={() => setSelectedModalIssue(null)}
          onNavigate={onNavigate}
          isPrivacyMode={isPrivacyMode}
        />
      )}
    </div>
  );
};

export default DetailedStatsPage;
