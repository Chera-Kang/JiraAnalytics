import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/common/Header';
import MainPage from './pages/MainPage';
import DetailedStatsPage from './pages/DetailedStatsPage';
import MemberStatsPage from './pages/MemberStatsPage';
import RoadmapPage from './pages/RoadmapPage';

const SHEET_ID = '1C_sTWWr-n6B1rRcajcFHAAbH-WTxT1vLXDrwDjwM5n4';

/**
 * 구글 시트의 공개 JSON API (gviz)에서 데이터를 읽어와 파싱하는 헬퍼 함수
 */
const fetchGvizSheet = async (sheetName) => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
  const response = await fetch(url);
  const text = await response.text();

  // 정규식 대신 안전하게 처음 나오는 '{' 와 마지막에 나오는 '}' 를 추출하여 JSON 파싱
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error("Invalid format from gviz api");

  const jsonString = text.substring(start, end + 1);
  const data = JSON.parse(jsonString);
  return data.table; // { cols: [...], rows: [...] }
};

/**
 * [데이터 로딩 함수]
 * 4개의 시트에서 필요한 데이터를 직접 가져옵니다.
 */
const fetchSheetData = async () => {
  try {
    // 병렬로 시트 데이터 요청 (raw_data, query_fixversion)
    const [rawDataTable, queryFixVersionTable] = await Promise.all([
      fetchGvizSheet('raw_data'),
      fetchGvizSheet('query_fixversion')
    ]);

    // 1. Last Updated 시간 파싱 (raw_data 컬럼 0 라벨 또는 전체 텍스트에서 추출)
    let lastUpdated = null;
    if (rawDataTable) {
      const headerStr = rawDataTable.cols?.[0]?.label || '';
      const cellStr = rawDataTable.rows?.[0]?.c?.[0]?.v || '';
      const fullText = `${headerStr} ${cellStr}`;

      const match = fullText.match(/(\d{4}[-./]\d{2}[-./]\d{2}\s+\d{2}:\d{2})/);
      if (match) {
        lastUpdated = match[1];
      }
    }

    // 2. 버전 정보 파싱 (query_fixversion 시트: 0=버전명, 2=시작일, 3=배포일, 4=일수)
    const versions = queryFixVersionTable.rows.map(row => ({
      name: row.c[0]?.v || '',
      code: row.c[1]?.v || '',
      start: row.c[2]?.f || row.c[2]?.v || '',
      end: row.c[3]?.f || row.c[3]?.v || '',
      workDays: Number(row.c[4]?.v) || 0,
      description: row.c[5]?.v || ''
    })).filter(v => v.name);

    // 날짜 파싱 헬퍼 함수
    const parseGvizDate = (cell) => {
      if (!cell) return null;
      if (cell.v && typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
        const parts = cell.v.match(/\d+/g).map(Number);
        return new Date(parts[0], parts[1], parts[2]);
      }
      if (cell.f) {
        const parts = cell.f.split(/[-./\s]+/).filter(Boolean).map(Number);
        if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]);
      }
      return null;
    };

    // 3. 이슈 데이터 파싱 (raw_data 기준 전체 데이터 직접 파싱)
    const issues = rawDataTable.rows.map(row => {
      const key = row.c[0]?.v;
      if (!key || !key.toString().startsWith('PPLW')) return null;

      const createdDate = parseGvizDate(row.c[9]);
      const d1 = parseGvizDate(row.c[10]);
      const d2 = parseGvizDate(row.c[11]) || parseGvizDate(row.c[13]); // date2 또는 date4

      let resolutionTimeDays = null;
      if (d1 && d2) {
        const diffTime = d2.getTime() - d1.getTime();
        resolutionTimeDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      }

      return {
        id: key,
        title: row.c[1]?.v || '',
        fixVersion: row.c[2]?.v || '미지정',
        assignee: row.c[3]?.v || '미지정',
        priority: row.c[4]?.v || 'None',
        type: row.c[5]?.v || 'None',
        status: row.c[6]?.v || 'None',
        resolution: row.c[7]?.v || 'None',
        reporter: row.c[8]?.v || '',
        created: row.c[9]?.f || row.c[9]?.v?.toString() || '',
        createdDate: createdDate,
        resolvedDate: d2 || (row.c[6]?.v === '종료' ? createdDate : null),
        date1: row.c[10]?.f || row.c[10]?.v || '',
        date2: row.c[11]?.f || row.c[11]?.v || '',
        date3: row.c[12]?.f || row.c[12]?.v || '',
        date4: row.c[13]?.f || row.c[13]?.v || '',
        reopenCounter: Number(row.c[14]?.v) || 0,
        linkedIssues: row.c[15]?.v || '',
        subTasks: row.c[16]?.v || '',
        description: row.c[17]?.v || '',
        comments: row.c[18]?.v || '',
        resolutionTimeDays: resolutionTimeDays
      };
    }).filter(Boolean);

    // 4. 프론트엔드 실시간 글로벌 통계 집계 (월별 생성/해결/잔여 이슈)
    const monthsMap = {};
    issues.forEach(issue => {
      if (issue.createdDate) {
        const y = issue.createdDate.getFullYear().toString();
        const m = String(issue.createdDate.getMonth() + 1).padStart(2, '0');
        const ym = `${y}-${m}`;
        if (!monthsMap[ym]) monthsMap[ym] = { year: y, month: m, created: 0, resolved: 0 };
        monthsMap[ym].created += 1;
      }
      if (issue.status === '종료' && issue.resolvedDate) {
        const y = issue.resolvedDate.getFullYear().toString();
        const m = String(issue.resolvedDate.getMonth() + 1).padStart(2, '0');
        const ym = `${y}-${m}`;
        if (!monthsMap[ym]) monthsMap[ym] = { year: y, month: m, created: 0, resolved: 0 };
        monthsMap[ym].resolved += 1;
      }
    });

    const sortedKeys = Object.keys(monthsMap).sort();
    let cumulativeRemaining = 0;
    const globalStats = sortedKeys.map(k => {
      const item = monthsMap[k];
      cumulativeRemaining += (item.created - item.resolved);
      return {
        year: item.year,
        month: item.month,
        created: item.created,
        resolved: item.resolved,
        remaining: Math.max(0, cumulativeRemaining)
      };
    });

    return {
      data: { issues, versions, globalStats },
      lastUpdated
    };
  } catch (error) {
    console.error("데이터 통신 에러:", error);
    throw error;
  }
};

function App() {
  const [rawData, setRawData] = useState({ issues: [], versions: [], globalStats: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [globalYear, setGlobalYear] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchSheetData();
      setRawData(response.data);
      setLastUpdated(response.lastUpdated);

      // 기본 선택값을 'All' (전체) 로 설정합니다.
      setSelectedVersion('All');
    } catch {
      setError('데이터를 불러오는데 실패했습니다. 네트워크 상태나 스프레드시트 공유 설정을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // URL 해시(#) 또는 쿼리에서 초기 view 추출 ('dashboard' | 'detailedStats' | 'memberStats' | 'next')
  const getViewFromUrl = () => {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'detailedStats', 'memberStats', 'next'].includes(hash)) {
      return hash;
    }
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (['dashboard', 'detailedStats', 'memberStats', 'next'].includes(viewParam)) {
      return viewParam;
    }
    return 'dashboard';
  };

  const [currentView, setCurrentView] = useState(getViewFromUrl);

  // 브라우저 뒤로가기 / 앞으로가기 (popstate) 이벤트 리스너
  useEffect(() => {
    const handlePopState = (event) => {
      const view = event.state?.view || getViewFromUrl();
      setCurrentView(view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 페이지 이동 함수 (Browser History에 상태 기록)
  const handleNavigate = (view) => {
    if (view === currentView) return;
    setCurrentView(view);
    const newUrl = view === 'dashboard' ? window.location.pathname : `#${view}`;
    window.history.pushState({ view }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      await loadData();
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // query3에서 직접 가져온 globalStats에서 연도를 추출합니다.
  const availableYears = useMemo(() => {
    if (!rawData.globalStats) return [];
    const years = new Set(rawData.globalStats.map(item => item.year));
    return Array.from(years).sort();
  }, [rawData]);

  if (isLoading && !isSyncing) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="flex-col" style={{ alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px', height: '48px',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Data Analyzing</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', border: '1px solid var(--danger)' }}>
          <h2 style={{ color: 'var(--danger)' }}>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ gap: '2.5rem' }}>
      <Header
        lastUpdated={lastUpdated}
        isSyncing={isSyncing}
        onSync={handleSync}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {currentView === 'dashboard' && (
        <MainPage
          globalStats={rawData.globalStats}
          globalYear={globalYear}
          setGlobalYear={setGlobalYear}
          availableYears={availableYears}
          issues={rawData.issues}
          onNavigate={handleNavigate}
        />
      )}

      {(currentView === 'detailedStats' || currentView === 'detailedStatsMore') && (
        <DetailedStatsPage
          issues={rawData.issues}
          versions={rawData.versions}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'memberStats' && (
        <MemberStatsPage
          issues={rawData.issues}
          versions={rawData.versions}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'next' && (
        <RoadmapPage />
      )}
    </div>
  );
}

export default App;
