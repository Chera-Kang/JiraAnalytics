import React from 'react';
import { ArrowLeft, BarChart3, Filter, Users, Table, Sparkles } from 'lucide-react';

/**
 * [세부 통계 심층 분석 페이지 (DetailedStatsPage)]
 * - 세부 통계 '더보기' 클릭 시 이동하는 상세 페이지 (Task 3)
 * - 버전별 이슈 테이블, 다차원 필터, 상세 타임라인 분석 제공
 */
const DetailedStatsPage = ({ onNavigate, issues = [], versions = [] }) => {
  return (
    <div style={{ width: '100%', maxWidth: '1080px', margin: '0 auto' }} className="flex-col gap-6 animate-fade-in">
      {/* 상단 네비게이션 & 타이틀 */}
      <div className="flex-row justify-between align-center" style={{ paddingBottom: '8px' }}>
        <div className="flex-col">
          <div className="flex-row gap-2 align-center" style={{ marginBottom: '6px' }}>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 12px',
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
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={16} />
              <span>대시보드로 돌아가기</span>
            </button>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--accent-primary)',
              padding: '4px 10px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Sparkles size={13} /> DETAILED ANALYTICS
            </span>
          </div>

          <h2 style={{ margin: '8px 0 0 0', fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
            세부 통계 심층 분석
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            버전별 전체 이슈 목록, 담당자별 기능 참여 내역 및 커스텀 필터링을 제공하는 상세 분석 공간입니다.
          </p>
        </div>
      </div>

      {/* 준비 중 / 스캐폴드 안내 카드 */}
      <div className="glass-panel flex-col" style={{ padding: '36px 32px', gap: '24px', textAlign: 'center', alignItems: 'center', minHeight: '380px', justifyContent: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <BarChart3 size={32} />
        </div>

        <div className="flex-col gap-2" style={{ maxWidth: '580px' }}>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
            세부 통계 심층 기능 구현 예정 (Task 3)
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            현재 페이지는 독립 컴포넌트로 완벽히 분리되어 있으며, 기획에 맞춰 다음 기능들을 순차적으로 배치할 수 있습니다.
          </p>
          <div className="flex-row gap-3 justify-center" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>로드된 원천 이슈: <strong style={{ color: 'var(--accent-primary)' }}>{issues.length.toLocaleString()}건</strong></span>
            <span>•</span>
            <span>버전 메타: <strong style={{ color: 'var(--accent-secondary)' }}>{versions.length}개</strong></span>
          </div>
        </div>

        {/* 예정 기능 카드 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          width: '100%',
          marginTop: '12px'
        }}>
          <div className="flex-col gap-2" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div className="flex-row gap-2 align-center">
              <Filter size={18} color="var(--accent-primary)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>다차원 복합 필터</strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              연도, 스프린트 버전, 담당자, 이슈 유형을 동시 조합하여 조건별 데이터 추출
            </span>
          </div>

          <div className="flex-col gap-2" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div className="flex-row gap-2 align-center">
              <Table size={18} color="var(--accent-secondary)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>이슈 상세 데이터 테이블</strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              이슈 제목(Summary), Date 1~4 타임라인, 처리일수, Reopen 횟수 실시간 검색 및 정렬
            </span>
          </div>

          <div className="flex-col gap-2" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div className="flex-row gap-2 align-center">
              <Users size={18} color="var(--success)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>담당자별 참여 분석</strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              특정 담당자가 참여한 버전별 기능 및 이슈 처리 현황 상세 브레이크다운
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedStatsPage;
