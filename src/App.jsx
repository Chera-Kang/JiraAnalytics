import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import GlobalStatsSection from './components/GlobalStatsSection';
import DetailedStatsSection from './components/DetailedStatsSection';
import NextRoadmapSection from './components/NextRoadmapSection';

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
    // 병렬로 시트 데이터 요청 (raw_data, query2, query3)
    const [rawDataTable, query2Table, query3Table] = await Promise.all([
      fetchGvizSheet('raw_data'),
      fetchGvizSheet('query2'),
      fetchGvizSheet('query3')
    ]);

    // 1. Last Updated 시간 파싱 (raw_data M1)
    let lastUpdated = null;
    if (rawDataTable) {
      const headerStr = rawDataTable.cols?.[12]?.label || '';
      const cellStr = rawDataTable.rows?.[0]?.c?.[12]?.v || rawDataTable.rows?.[0]?.c?.[12]?.f || '';
      const fullText = `${headerStr} ${cellStr}`;
      
      const match = fullText.match(/(\d{4}[-./]\d{2}[-./]\d{2}\s+\d{2}:\d{2})/);
      if (match) {
        lastUpdated = match[1];
      }
    }

    // 2. 버전 정보 파싱 (query2)
    const versions = query2Table.rows.map(row => ({
      name: row.c[0]?.v || '',
      start: row.c[1]?.f || row.c[1]?.v || '',
      end: row.c[2]?.f || row.c[2]?.v || '',
      workDays: Number(row.c[3]?.v) || 0
    })).filter(v => v.name);

    // 3. 글로벌 통계 파싱 (query3 G~K열, 인덱스 6~10)
    const globalStats = query3Table.rows.map(row => {
      const year = row.c[6]?.f || row.c[6]?.v?.toString();
      const monthRaw = row.c[7]?.f || row.c[7]?.v?.toString(); // "10" 또는 "10월"

      if (!year || !monthRaw) return null;

      return {
        year: year,
        month: monthRaw.replace('월', '').padStart(2, '0'),
        created: Number(row.c[8]?.v) || 0,
        resolved: Number(row.c[9]?.v) || 0,
        remaining: Number(row.c[10]?.v) || 0
      };
    }).filter(Boolean); // null 제거

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

    // 이슈 처리 소요 일수 계산 헬퍼 함수 (Date 2 - Date 1)
    const calcWorkDays = (d1, d2) => {
      if (!d1 || !d2) return null;
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays + 1);
    };

    // 4. 이슈 데이터 파싱 (raw_data 기준 전체 데이터 직접 파싱)
    const issues = rawDataTable.rows.map(row => {
      const key = row.c[0]?.v;
      if (!key || !key.toString().startsWith('PPLW')) return null;

      const d1 = parseGvizDate(row.c[9]);
      const d2 = parseGvizDate(row.c[10]);

      return {
        id: key,
        fixVersion: row.c[1]?.v || '미지정',
        assignee: row.c[2]?.v || '미지정',
        priority: row.c[3]?.v || 'None',
        type: row.c[4]?.v || 'None',
        status: row.c[5]?.v || 'None',
        resolution: row.c[6]?.v || 'None',
        created: row.c[8]?.f || row.c[8]?.v?.toString() || '',
        resolutionTimeDays: calcWorkDays(d1, d2)
      };
    }).filter(Boolean);

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

  // 뷰 전환 상태 ('dashboard' | 'next')
  const [currentView, setCurrentView] = useState('dashboard');

  const [globalYear, setGlobalYear] = useState('All');
  const [selectedVersion, setSelectedVersion] = useState('');

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
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>구글 시트에서 데이터를 불러오는 중입니다...</span>
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
    <div className="app-container" style={{ gap: '3rem' }}>
      <Header
        lastUpdated={lastUpdated}
        isSyncing={isSyncing}
        onSync={handleSync}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {currentView === 'dashboard' ? (
        <>
          {/* Global Stats Section */}
          <GlobalStatsSection
            globalStats={rawData.globalStats}
            globalYear={globalYear}
            setGlobalYear={setGlobalYear}
            availableYears={availableYears}
          />

          <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '1rem 0' }} />

          {/* Detailed Stats Section */}
          <DetailedStatsSection
            issues={rawData.issues}
            versions={rawData.versions}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            availableYears={availableYears}
          />
        </>
      ) : (
        /* Next Roadmap Section */
        <NextRoadmapSection />
      )}
    </div>
  );
}

export default App;
