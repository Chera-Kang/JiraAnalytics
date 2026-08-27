import React from 'react';
import { ArrowLeft, UserCheck, Sparkles, Award, CheckCircle2, Clock } from 'lucide-react';

/**
 * [담당자별 맞춤 대시보드 페이지 (MemberStatsPage)]
 * - 담당자별 참여 기능, 이슈 처리 건수, 평균 처리일수, 품질 지표 분석 (Task 4)
 */
const MemberStatsPage = ({ onNavigate, issues: _issues = [], versions: _versions = [] }) => {
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
              background: 'rgba(124, 58, 237, 0.1)',
              color: 'var(--accent-secondary)',
              padding: '4px 10px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Sparkles size={13} /> MEMBER DASHBOARD
            </span>
          </div>

          <h2 style={{ margin: '8px 0 0 0', fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
            담당자별 맞춤 대시보드
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            팀원 개개인의 버전별 기여 내역, 담당 기능, 처리 일수 및 품질 지표를 집중 분석하는 공간입니다.
          </p>
        </div>
      </div>

      {/* 준비 중 안내 카드 */}
      <div className="glass-panel flex-col" style={{ padding: '36px 32px', gap: '24px', textAlign: 'center', alignItems: 'center', minHeight: '380px', justifyContent: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-secondary)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <UserCheck size={32} />
        </div>

        <div className="flex-col gap-2" style={{ maxWidth: '580px' }}>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
            담당자별 맞춤 대시보드 구축 예정 (Task 4)
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            원천 데이터에서 담당자별 완료 이슈, 평균 처리일수(Date 1~2), 참여 기능 목록을 추출하여 맞춤형 뷰를 제공할 예정입니다.
          </p>
        </div>

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
              <Award size={18} color="var(--accent-primary)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>개인별 성과 & 기여도</strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              스프린트 버전별 처리 완료 건수 및 프로젝트 내 기여 비중
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
              <Clock size={18} color="var(--warning)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>순수 개발 처리 공수</strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Date 1(시작) ~ Date 2(개발완료) 기반의 순수 작업 소요 시간 정밀 통계
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
              <CheckCircle2 size={18} color="var(--success)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>담당 이슈 히스토리</strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              해당 담당자가 맡았던 모든 이슈와 해결 상태 및 타임라인 조회
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberStatsPage;
