import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  User,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  ArrowLeft,
  Target,
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

// 정해진 이슈 유형 정렬 순서
const TYPE_ORDER = ['Planning', 'Design', '스토리', 'Story', '작업', 'Task', '하위 작업', '하위작업', 'Sub-task', '버그', 'Bug'];

/**
 * [포털 기반 즉각 반응형 커스텀 툴팁 컴포넌트]
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

const getSelectStyle = () => ({
  appearance: 'none',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--glass-border)',
  borderRadius: '8px',
  padding: '8px 32px 8px 12px',
  fontSize: '0.88rem',
  fontWeight: 500,
  outline: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '14px',
  width: '100%'
});

/**
 * [개인별 맞춤 대시보드 (Personal Dashboard)]
 * - 1단: 상단 사용자 프로필 헤더, 연도/담당자 전환 드롭다운, 뒤로가기 버튼
 * - 2단: 🏆 팀 내 기여도 요약 카드 2종 (팀 내 점유율/순위 & 버전 참석률)
 * - 3단: 📊 개인 전용 4대 핵심 KPI 카드 (팀 평균 대비 비교 뱃지 탑재)
 * - 4단: 📈 2-Column 심층 분석 차트 (주력 업무 포지션 분포 & 수정버전별 추이)
 * - 5단: 📋 해당 사용자의 담당 이슈 목록 (검색, 필터, 소요일수, 모달 연동)
 */
const MemberStatsPage = ({ issues = [], versions = [], initialUser = null, onNavigate, isPrivacyMode = true }) => {
  // 유효 담당자 목록 및 전체 이슈 건수 순 정렬
  const availableAssignees = useMemo(() => {
    const map = new Map();
    issues.forEach(i => {
      const name = i.assignee;
      if (name && name !== '미지정' && name !== 'None' && name !== '-') {
        map.set(name, (map.get(name) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [issues]);

  // 기본 담당자 선정 (initialUser가 있으면 그것, 없으면 1위 담당자)
  const defaultUser = useMemo(() => {
    if (initialUser && availableAssignees.some(a => a.name === initialUser)) {
      return initialUser;
    }
    return availableAssignees.length > 0 ? availableAssignees[0].name : '';
  }, [initialUser, availableAssignees]);

  // 필터 상태
  const [selectedUser, setSelectedUser] = useState(defaultUser);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedModalIssue, setSelectedModalIssue] = useState(null);

  // initialUser 변경 시 동기화
  useEffect(() => {
    if (initialUser && availableAssignees.some(a => a.name === initialUser)) {
      setSelectedUser(initialUser);
      setCurrentPage(1);
    }
  }, [initialUser, availableAssignees]);

  // 연도 목록 (역순 2026년 우선)
  const availableYears = useMemo(() => {
    const set = new Set();
    issues.forEach(i => {
      if (i.created && i.created.length >= 4) set.add(i.created.slice(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [issues]);

  // 이슈 유형 목록
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

  // [연도 기준 전체 팀 이슈 vs 개인 이슈 분리]
  const { teamYearIssues, userYearIssues } = useMemo(() => {
    let yearIssues = issues;
    if (selectedYear !== 'All') {
      const shortYear = selectedYear.slice(-2);
      yearIssues = issues.filter(issue => {
        const matchCreated = issue.created && issue.created.slice(0, 4) === selectedYear;
        const matchVersion = issue.fixVersion && issue.fixVersion.startsWith(shortYear);
        return matchCreated || matchVersion;
      });
    }

    const uIssues = yearIssues.filter(i => i.assignee === selectedUser);
    return {
      teamYearIssues: yearIssues,
      userYearIssues: uIssues
    };
  }, [issues, selectedYear, selectedUser]);

  // [팀 전체 평균 지표 및 팀원 랭킹 산출]
  const teamAnalysis = useMemo(() => {
    const totalTeamCount = teamYearIssues.length;
    let teamResolved = 0;
    let teamTotalDays = 0;
    let teamDaysCount = 0;
    let teamReopenCount = 0;
    let teamTargetTotal = 0;

    const targetTypes = ['작업', 'Task', '하위 작업', 'Sub-task', '버그', 'Bug'];
    const memberCounts = new Map();

    teamYearIssues.forEach(i => {
      const name = i.assignee;
      if (name && name !== '미지정' && name !== 'None' && name !== '-') {
        memberCounts.set(name, (memberCounts.get(name) || 0) + 1);
      }

      const s = (i.status || '').toLowerCase();
      if (s === '종료' || s === 'done' || s === 'closed' || s === 'dev complete' || s === '개발완료') {
        teamResolved += 1;
      }

      if (typeof i.resolutionTimeDays === 'number' && i.resolutionTimeDays > 0) {
        teamTotalDays += i.resolutionTimeDays;
        teamDaysCount += 1;
      }

      if (targetTypes.includes(i.type)) {
        teamTargetTotal += 1;
        if (typeof i.reopenCounter === 'number' && i.reopenCounter > 0) {
          teamReopenCount += 1;
        }
      }
    });

    const teamAvgDays = teamDaysCount > 0 ? (teamTotalDays / teamDaysCount) : null;
    const teamReopenRate = teamTargetTotal > 0 ? ((teamReopenCount / teamTargetTotal) * 100) : 0;

    // 랭킹 산출
    const sortedMembers = Array.from(memberCounts.entries()).sort((a, b) => b[1] - a[1]);
    const userRankIndex = sortedMembers.findIndex(m => m[0] === selectedUser);
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '-';
    const totalMembers = sortedMembers.length;

    // 유효 버전 참석률 계산
    const allValidVersions = new Set(
      teamYearIssues.map(i => i.fixVersion).filter(v => v && v !== '미지정' && v !== 'None' && v !== '-')
    );
    const userVersions = new Set(
      userYearIssues.map(i => i.fixVersion).filter(v => v && v !== '미지정' && v !== 'None' && v !== '-')
    );

    const totalVersionCount = allValidVersions.size;
    const userVersionCount = userVersions.size;
    const participationRate = totalVersionCount > 0 ? ((userVersionCount / totalVersionCount) * 100).toFixed(1) : '0.0';

    return {
      totalTeamCount,
      teamAvgDays,
      teamReopenRate,
      userRank,
      totalMembers,
      userVersionCount,
      totalVersionCount,
      participationRate
    };
  }, [teamYearIssues, userYearIssues, selectedUser]);

  // [개인 4대 KPI 요약 지표 계산]
  const userKpi = useMemo(() => {
    const total = userYearIssues.length;
    if (total === 0) {
      return { total: 0, resolved: 0, avgDaysNum: null, avgDays: '-', reopenCount: 0, targetTotal: 0, reopenRateNum: 0, reopenRate: '0.0' };
    }

    let resolved = 0;
    let totalDays = 0;
    let daysCount = 0;
    let reopenCount = 0;
    let targetTotal = 0;
    const targetTypes = ['작업', 'Task', '하위 작업', 'Sub-task', '버그', 'Bug'];

    userYearIssues.forEach(i => {
      const s = (i.status || '').toLowerCase();
      if (s === '종료' || s === 'done' || s === 'closed' || s === 'dev complete' || s === '개발완료') {
        resolved += 1;
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

    const avgDaysNum = daysCount > 0 ? (totalDays / daysCount) : null;
    const reopenRateNum = targetTotal > 0 ? ((reopenCount / targetTotal) * 100) : 0;

    return {
      total,
      resolved,
      avgDaysNum,
      avgDays: avgDaysNum !== null ? avgDaysNum.toFixed(1) : '-',
      reopenCount,
      targetTotal,
      reopenRateNum,
      reopenRate: reopenRateNum.toFixed(1)
    };
  }, [userYearIssues]);

  // [차트 1: 개인 주력 업무 유형 분포 (Planning -> Bug)]
  const typeData = useMemo(() => {
    const typeCounts = new Map();
    userYearIssues.forEach(i => {
      let t = i.type || '기타';
      if (t === 'Task') t = '작업';
      if (t === 'Story') t = '스토리';
      if (t === 'Sub-task' || t === '하위작업') t = '하위 작업';
      if (t === 'Bug') t = '버그';
      typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
    });

    return Array.from(typeCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const indexA = TYPE_ORDER.indexOf(a.name);
        const indexB = TYPE_ORDER.indexOf(b.name);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return b.value - a.value;
      });
  }, [userYearIssues]);

  // [차트 2: 수정버전별 처리량 & 소요일수 추이]
  const versionTrendData = useMemo(() => {
    const issuesVersionSet = new Set(
      userYearIssues.map(i => i.fixVersion).filter(v => v && v !== '미지정' && v !== 'None' && v !== '-')
    );

    const validVersionsInOrder = versions
      .filter(v => issuesVersionSet.has(v.name))
      .map(v => v.name);

    let targetVersionNames = [];
    if (selectedYear !== 'All') {
      const yearPrefix = selectedYear.slice(-2);
      targetVersionNames = validVersionsInOrder.filter(vName => vName.startsWith(yearPrefix));
    } else {
      targetVersionNames = validVersionsInOrder.slice(-12);
    }

    if (targetVersionNames.length === 0) {
      targetVersionNames = Array.from(issuesVersionSet).slice(-12);
    }

    const versionMap = new Map();
    targetVersionNames.forEach(vName => {
      versionMap.set(vName, { name: vName, count: 0, totalDays: 0, daysCount: 0 });
    });

    userYearIssues.forEach(i => {
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

    return Array.from(versionMap.values()).map(item => ({
      name: item.name,
      count: item.count,
      avgDays: item.daysCount > 0 ? parseFloat((item.totalDays / item.daysCount).toFixed(1)) : 0
    }));
  }, [userYearIssues, versions, selectedYear]);

  // [하단 이슈 목록 필터링]
  const tableFilteredIssues = useMemo(() => {
    return userYearIssues.filter(issue => {
      if (selectedType !== 'All' && issue.type !== selectedType) return false;
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchKey = (issue.id || '').toLowerCase().includes(q);
        const matchTitle = (issue.title || '').toLowerCase().includes(q);
        if (!matchKey && !matchTitle) return false;
      }
      return true;
    });
  }, [userYearIssues, selectedType, selectedStatus, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(tableFilteredIssues.length / ITEMS_PER_PAGE));
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return tableFilteredIssues.slice(start, start + ITEMS_PER_PAGE);
  }, [tableFilteredIssues, currentPage]);

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === '종료' || s === 'done' || s === 'closed') return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
    if (s.includes('dev complete') || s === '개발완료' || s === '진행 중') return { bg: 'rgba(37, 99, 235, 0.15)', text: '#3b82f6' };
    if (s.includes('qa') || s.includes('검수')) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
    if (s.includes('reopen') || s.includes('재오픈')) return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
    return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8' };
  };

  // 팀 대비 차이 계산 헬퍼
  const getDiffDays = () => {
    if (userKpi.avgDaysNum === null || teamAnalysis.teamAvgDays === null) return null;
    const diff = userKpi.avgDaysNum - teamAnalysis.teamAvgDays;
    return diff;
  };

  const getDiffReopen = () => {
    if (userKpi.targetTotal === 0) return null;
    const diff = userKpi.reopenRateNum - teamAnalysis.teamReopenRate;
    return diff;
  };

  const diffDays = getDiffDays();
  const diffReopen = getDiffReopen();

  return (
    <div className="flex-col w-full animate-fade-in" style={{ gap: '20px' }}>
      {/* 1. 상단 프로필 헤더 & 네비게이션 */}
      <div className="glass-panel flex-row justify-between align-center" style={{ padding: '18px 24px', borderRadius: '12px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex-row align-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('detailedStats')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
          >
            <ArrowLeft size={15} />
            <span>전체 통계로 돌아가기</span>
          </button>

          <div className="flex-row align-center gap-2">
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}>
              <User size={18} />
            </div>
            <div className="flex-col">
              <div className="flex-row align-center gap-2">
                <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedUser}
                </h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  님의 개인 기여 분석 리포트
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 연도 & 담당자 전환 드롭다운 */}
        <div className="flex-row gap-3 align-center" style={{ flexWrap: 'wrap' }}>
          {/* 연도 선택 */}
          <div style={{ minWidth: '130px' }}>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              style={getSelectStyle()}
            >
              <option value="All">전체 연도</option>
              {availableYears.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
          </div>

          {/* 담당자 전환 */}
          <div style={{ minWidth: '160px' }}>
            <select
              value={selectedUser}
              onChange={(e) => { setSelectedUser(e.target.value); setCurrentPage(1); }}
              style={getSelectStyle()}
            >
              {availableAssignees.map(a => (
                <option key={a.name} value={a.name}>{a.name} ({a.count}건)</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. 🏆 팀 내 기여도 요약 카드 2종 (Gradient Accent) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        width: '100%'
      }}>
        {/* 카드 1: 팀 내 이슈 처리 점유율 및 기여 순위 */}
        <div className="glass-panel flex-col justify-center" style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          borderRadius: '12px'
        }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: '8px' }}>
            <div className="flex-row gap-2 align-center">
              <Award size={18} color="var(--accent-primary)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>팀 내 이슈 처리 기여도</strong>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {selectedYear === 'All' ? '전체 기간' : `${selectedYear}년`} 기준
            </span>
          </div>
          <div className="flex-row align-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="flex-row align-baseline gap-2">
              <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {teamAnalysis.userRank === 1 ? '🥇 1위' : teamAnalysis.userRank === 2 ? '🥈 2위' : teamAnalysis.userRank === 3 ? '🥉 3위' : `${teamAnalysis.userRank}위`}
              </span>
              <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                / 총 {teamAnalysis.totalMembers}명 중
              </span>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.88rem',
              fontWeight: 600
            }}>
              점유율: <strong style={{ color: 'var(--accent-primary)' }}>
                {teamAnalysis.totalTeamCount > 0 ? ((userKpi.total / teamAnalysis.totalTeamCount) * 100).toFixed(1) : 0}%
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                ({userKpi.total}건 / {teamAnalysis.totalTeamCount}건)
              </span>
            </div>
          </div>
        </div>

        {/* 카드 2: 수정버전(스프린트) 참석률 */}
        <div className="glass-panel flex-col justify-center" style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px'
        }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: '8px' }}>
            <div className="flex-row gap-2 align-center">
              <Target size={18} color="var(--success)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>수정버전 참석률</strong>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>릴리즈 참여도</span>
          </div>
          <div className="flex-row align-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="flex-row align-baseline gap-2">
              <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--success)' }}>
                {teamAnalysis.participationRate}%
              </span>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.88rem',
              fontWeight: 600
            }}>
              참여: <strong style={{ color: 'var(--success)' }}>{teamAnalysis.userVersionCount}개 버전</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                / 전체 {teamAnalysis.totalVersionCount}개
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 📊 개인 전용 4대 핵심 KPI 카드 (팀 평균 대비 비교 뱃지 탑재) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        width: '100%'
      }}>
        {/* KPI 1: 총 담당 이슈 */}
        <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>총 담당 이슈</span>
            <Award size={18} color="var(--accent-primary)" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {userKpi.total.toLocaleString()}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>건</span>
          </span>
        </div>

        {/* KPI 2: 해결 완료 */}
        <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--success)' }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>해결 완료</span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div className="flex-row align-center gap-2">
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
              {userKpi.resolved.toLocaleString()}
              <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>건</span>
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ({userKpi.total > 0 ? ((userKpi.resolved / userKpi.total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>

        {/* KPI 3: 평균 개발 소요일수 (팀 평균 비교) */}
        <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--warning)' }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
            <div className="flex-row gap-1 align-center">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>평균 개발 소요일수</span>
              <InfoTooltip content={
                <div>
                  <div>개인의 작업 시작(Date 1) ~ 개발 완료(Date 2) 평균 일수</div>
                  <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '0.73rem' }}>
                    * 팀 평균: {teamAnalysis.teamAvgDays !== null ? `${teamAnalysis.teamAvgDays.toFixed(1)}일` : '-'}
                  </div>
                </div>
              } />
            </div>
            <Clock size={18} color="var(--warning)" />
          </div>
          <div className="flex-row align-center justify-between">
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
              {userKpi.avgDays}
              {userKpi.avgDays !== '-' && <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>일</span>}
            </span>

            {/* 팀 대비 비교 뱃지 */}
            {diffDays !== null && (
              <span style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                background: diffDays <= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: diffDays <= 0 ? '#10b981' : '#d97706',
                border: `1px solid ${diffDays <= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
              }}>
                {diffDays <= 0 ? `⚡ 팀 대비 ${Math.abs(diffDays).toFixed(1)}일 빠름` : `팀 대비 +${diffDays.toFixed(1)}일`}
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Reopen Rate (팀 평균 비교) */}
        <div className="glass-panel flex-col justify-center" style={{ padding: '20px 22px', borderLeft: '4px solid var(--danger)' }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: '6px' }}>
            <div className="flex-row gap-1 align-center">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Reopen Rate</span>
              <InfoTooltip content={
                <div>
                  <div>작업·하위 작업·버그 이슈 중 재작업 발생 비율</div>
                  <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '0.73rem' }}>
                    * 팀 평균: {teamAnalysis.teamReopenRate.toFixed(1)}%
                  </div>
                </div>
              } />
            </div>
            <RefreshCw size={17} color="var(--danger)" />
          </div>
          <div className="flex-row align-center justify-between">
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
              {userKpi.reopenRate}%
            </span>

            {/* 팀 대비 비교 뱃지 */}
            {diffReopen !== null && (
              <span style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                background: diffReopen <= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: diffReopen <= 0 ? '#10b981' : '#dc2626',
                border: `1px solid ${diffReopen <= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
              }}>
                {diffReopen <= 0 ? `👏 팀 대비 ${Math.abs(diffReopen).toFixed(1)}%p 우수` : `팀 대비 +${diffReopen.toFixed(1)}%p`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. 📈 2-Column 심층 분석 차트: [좌측: 주력 업무 분포] vs [우측: 버전별 추이] */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '16px',
        width: '100%'
      }}>
        {/* 좌측: 주력 업무 포지션 분포 (Planning -> Bug 순서 도넛) */}
        <div className="glass-panel flex-col" style={{ minHeight: '370px', padding: '18px 20px' }}>
          <h4 style={{ margin: '0 0 12px 0', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
            {selectedUser} 님의 주력 업무 포지션 분포
          </h4>
          <div style={{ flex: 1, width: '100%', minHeight: '280px' }}>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2.5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={250}
                    animationEasing="ease-out"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`user-type-cell-${index}`} fill={getTypeColor(entry.name).fill} />
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
                          <div key={`user-type-legend-${item.name}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>

        {/* 우측: 수정버전별 처리량 & 소요일수 추이 */}
        <div className="glass-panel flex-col" style={{ minHeight: '370px', padding: '18px 20px' }}>
          <h4 style={{ margin: '0 0 12px 0', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
            수정버전별 처리량 및 개발 소요일수 추이
          </h4>
          <div style={{ flex: 1, width: '100%', minHeight: '280px' }}>
            {versionTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={versionTrendData}
                  margin={{ top: 10, right: 15, bottom: 0, left: -10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.7} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: '0.74rem', dy: 3 }}
                    interval={0}
                    angle={versionTrendData.length > 5 ? -25 : 0}
                    textAnchor={versionTrendData.length > 5 ? 'end' : 'middle'}
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
                    barSize={versionTrendData.length > 8 ? 16 : 24}
                    animationBegin={0}
                    animationDuration={250}
                    animationEasing="ease-out"
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

      {/* 5. 📋 담당 이슈 탐색 목록 (검색 & 간이 필터 & 소요일수 & 모달 연동) */}
      <div className="glass-panel flex-col gap-4" style={{ padding: '20px 22px', borderRadius: '12px' }}>
        <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex-row gap-2 align-center">
            <ListFilter size={18} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedUser} 님의 담당 이슈 목록
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              (총 <strong style={{ color: 'var(--accent-primary)' }}>{tableFilteredIssues.length.toLocaleString()}</strong>건)
            </span>
          </div>

          {/* 간이 필터 & 검색창 */}
          <div className="flex-row gap-2 align-center" style={{ flexWrap: 'wrap' }}>
            <div style={{ width: '130px' }}>
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                style={{ ...getSelectStyle(), padding: '6px 28px 6px 10px', fontSize: '0.82rem' }}
              >
                <option value="All">전체 유형</option>
                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ width: '130px' }}>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                style={{ ...getSelectStyle(), padding: '6px 28px 6px 10px', fontSize: '0.82rem' }}
              >
                <option value="All">전체 상태</option>
                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="이슈 키 또는 제목 검색..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '6px 10px 6px 30px',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* 테이블 컨테이너 */}
        <div style={{
          width: '100%',
          maxHeight: '480px',
          overflowY: 'auto',
          overflowX: 'auto',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          background: 'var(--bg-secondary)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead style={{
              position: 'sticky',
              top: 0,
              background: 'var(--bg-tertiary)',
              borderBottom: '2px solid var(--border-color)',
              zIndex: 10
            }}>
              <tr>
                <th style={{ padding: '12px 14px', width: '120px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>키</th>
                <th style={{ padding: '12px 10px', width: '85px', color: 'var(--text-muted)', fontWeight: 600 }}>유형</th>
                <th style={{ padding: '12px 10px', width: '85px', color: 'var(--text-muted)', fontWeight: 600 }}>우선순위</th>
                <th style={{ padding: '12px 10px', width: '95px', color: 'var(--text-muted)', fontWeight: 600 }}>상태</th>
                <th style={{ padding: '12px 14px', minWidth: '240px', color: 'var(--text-muted)', fontWeight: 600 }}>제목</th>
                <th style={{ padding: '12px 12px', width: '120px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>수정버전</th>
                <th style={{ padding: '12px 12px', width: '95px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>소요일수</th>
              </tr>
            </thead>
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
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <span style={{
                          color: 'var(--accent-primary)',
                          background: 'rgba(37, 99, 235, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {issue.id}
                        </span>
                      </td>

                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: typeStyle.text,
                          background: typeStyle.bg,
                          border: `1px solid ${typeStyle.border}`,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {issue.type}
                        </span>
                      </td>

                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
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

                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
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
                          title={isPrivacyMode ? '' : issue.title}
                        >
                          {issue.title}
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {issue.fixVersion || '-'}
                      </td>

                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--warning)', whiteSpace: 'nowrap' }}>
                        {issue.resolutionTimeDays ? `${issue.resolutionTimeDays}일` : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    조건에 일치하는 이슈가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              총 <strong>{tableFilteredIssues.length.toLocaleString()}</strong>개 이슈 중{' '}
              <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> ~{' '}
              <strong>{Math.min(currentPage * ITEMS_PER_PAGE, tableFilteredIssues.length)}</strong>번째
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

export default MemberStatsPage;
