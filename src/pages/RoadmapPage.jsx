import React from 'react';
import {
  Database,
  UserCheck,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Workflow,
  LineChart,
  GitCompare,
  Globe,
  RefreshCw,
  ExternalLink,
  Clock,
  Layers
} from 'lucide-react';

/**
 * [차세대 개발 로드맵 페이지 (RoadmapPage)]
 * - 대시보드 고도화 계획 및 마일스톤 현황 공유
 */
const RoadmapPage = () => {
  // 완료된 과제 카드 스타일 (녹색 톤 테두리 + 부드러운 그라데이션 + 성공 글로우)
  const completedCardStyle = {
    padding: '24px 28px',
    gap: '16px',
    border: '1.5px solid rgba(16, 185, 129, 0.45)',
    borderLeft: '6px solid var(--success)',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(255, 255, 255, 0.96) 100%)',
    boxShadow: '0 4px 18px rgba(16, 185, 129, 0.08)',
    borderRadius: '16px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  // 진행 예정/차기 로드맵 카드 스타일 (블루 점선 테두리 + 미래지향적 테마)
  const plannedCardStyle = {
    padding: '24px 28px',
    gap: '16px',
    border: '1.5px dashed rgba(37, 99, 235, 0.45)',
    borderLeft: '6px solid var(--accent-primary)',
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, rgba(255, 255, 255, 0.95) 100%)',
    boxShadow: '0 4px 18px rgba(37, 99, 235, 0.06)',
    borderRadius: '16px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  // 완료 상태 배지
  const renderCompletedBadge = (text = '적용 완료') => (
    <span style={{
      fontSize: '0.78rem',
      fontWeight: 700,
      background: 'rgba(16, 185, 129, 0.12)',
      color: 'var(--success)',
      padding: '4px 10px',
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    }}>
      <CheckCircle2 size={13} /> {text}
    </span>
  );

  return (
    <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }} className="flex-col gap-6 animate-fade-in">
      {/* 상단 타이틀 */}
      <div className="flex-row justify-between align-center" style={{ paddingBottom: '8px' }}>
        <div className="flex-col">
          <div className="flex-row gap-2 align-center" style={{ marginBottom: '6px' }}>
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
              <Sparkles size={13} /> NEXT MILESTONES & ROADMAP
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
            프로젝트 고도화 계획 & 마일스톤 현황
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Jira Analytics 대시보드의 확장성과 실무 활용도를 극대화하기 위한 단계별 추진 과제입니다.
          </p>
        </div>
      </div>

      {/* 로드맵 과제 리스트 */}
      <div className="flex-col gap-6 w-full">

        {/* TASK 01 - 완료 */}
        <div className="glass-panel flex-col" style={completedCardStyle}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Database size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 800 }}>TASK 01</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  1. 데이터 처리 아키텍처 방향성 결정 (A안 vs B안)
                </h3>
              </div>
            </div>
            {renderCompletedBadge('적용 완료 (B안 채택)')}
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            향후 연도/월/사용자별 다차원 세부 필터링 및 대시보드 확장성을 위해 비교 검토를 완료하였으며, <strong>[B안] 프론트엔드 Raw Data 실시간 연산 방식</strong>을 최종 채택하여 시스템에 적용을 마쳤습니다.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px',
            marginTop: '4px'
          }}>
            {/* [A안] */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '10px',
              padding: '16px 18px',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              opacity: 0.55,
              filter: 'grayscale(0.4)'
            }}>
              <div className="flex-row justify-between align-center">
                <div className="flex-row gap-2 align-center">
                  <Workflow size={17} color="var(--text-muted)" />
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>[A안] 스프레드시트 수식 사전 연산</strong>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>미채택</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                구글 스프레드시트 쿼리/수식(LET, SEQUENCE 등)에서 미리 통계를 계산해두고 웹은 결과만 표시
              </p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }} className="flex-col gap-1">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>• 장점: 프론트엔드 연산 부담 없음</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>• 한계: 컬럼 변경 시 수식 파손 및 복합 필터 지원 한계로 미채택</span>
              </div>
            </div>

            {/* [B안] */}
            <div style={{
              background: 'rgba(37, 99, 235, 0.05)',
              borderRadius: '10px',
              padding: '16px 18px',
              border: '2px solid var(--accent-primary)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative'
            }}>
              <div className="flex-row justify-between align-center">
                <div className="flex-row gap-2 align-center">
                  <GitCompare size={17} color="var(--accent-primary)" />
                  <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>[B안] 프론트엔드 Raw Data 실시간 연산</strong>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', background: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '6px' }}>
                  채택
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                스프레드시트는 순수 DB(Raw Data)로만 두고, React 메모리에서 다차원 조건으로 실시간 집계
              </p>
              <div style={{ borderTop: '1px solid rgba(37, 99, 235, 0.2)', paddingTop: '8px' }} className="flex-col gap-1">
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>• 장점: 다차원 필터링(사용자별/연월별/버전별) 자유자재, 즉각적 반응 속도</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>• 결과: raw_data 직접 파싱 및 실시간 글로벌/세부 통계 엔진 탑재 완료!</span>
              </div>
            </div>
          </div>
        </div>

        {/* TASK 02 - 완료 */}
        <div className="glass-panel flex-col" style={completedCardStyle}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <UserCheck size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 800 }}>TASK 02</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  2. 담당자별 맞춤 대시보드 구축 (Individual Dashboard)
                </h3>
              </div>
            </div>
            {renderCompletedBadge('적용 완료 (구축 완료)')}
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            조직 전체 지표뿐만 아니라 팀원 개개인의 업무 성과와 담당 영역을 집중 조명할 수 있는 <strong>담당자 전용 상세 분석 페이지(MemberStatsPage)</strong>를 신설하여 배포했습니다.
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex-row gap-2 align-center" style={{ marginBottom: '6px' }}>
              <LineChart size={16} color="var(--success)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>주요 제공 기능</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>팀 기여도 벤치마크</strong>: 전체 팀 내 이슈 처리 순위(Rank), 점유율(Share), 릴리즈 버전 참석률</li>
              <li><strong>품질 지표(Quality Metrics)</strong>: 개인별 평균 처리 일수 및 Reopen Rate와 팀 평균 대비 격차 뱃지 표출</li>
              <li><strong>포지션 및 버전별 추이</strong>: 기획/디자인/스토리/작업 등 개인별 롤 비중 및 버전별 처리량 변화 추이 시각화</li>
              <li><strong>담당 이슈 목록 및 모달 연동</strong>: 처리 이슈 목록 필터링 및 클릭 시 상세 정보 모달 제공</li>
            </ul>
          </div>
        </div>

        {/* TASK 03 - 완료 */}
        <div className="glass-panel flex-col" style={completedCardStyle}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <CalendarClock size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 800 }}>TASK 03</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  3. 단계별 타임라인 및 일자별 소요시간 분석 (Date 1 ~ 5 확장)
                </h3>
              </div>
            </div>
            {renderCompletedBadge('적용 완료 (구간 분석)')}
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            이슈 생성부터 최종 종료까지의 세부 일자(Date 1~5)를 데이터셋에 완전히 연동하고, <strong>단계별 병목 구간을 측정할 수 있는 핵심 리드타임 지표 계산 로직 및 상세 모달 타임라인 시각화</strong>를 구축했습니다.
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div className="flex-row gap-2 align-center">
              <Clock size={16} color="var(--success)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>구축 완료된 단계별 소요시간 지표</strong>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              marginTop: '4px'
            }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>구간 A (대기 시간)</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>생성일 ➔ Date 1 (작업 착수 대기)</p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>구간 B (순수 개발)</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Date 1 ➔ Date 2 (Dev Complete)</p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>구간 C (QA 검수)</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Date 2 ➔ Date 3 (검수 소요)</p>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>구간 D (전체 리드타임)</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>생성일 ➔ Date 4 (최종 종료)</p>
              </div>
            </div>
          </div>
        </div>

        {/* TASK 04 - 완료 */}
        <div className="glass-panel flex-col" style={completedCardStyle}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Globe size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 800 }}>TASK 04</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  4. 상시 안정적 웹 접근 환경 구축 (Cloudflare Pages)
                </h3>
              </div>
            </div>
            {renderCompletedBadge('적용 완료 (배포 성공)')}
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            별도 인프라 비용과 슬립 모드(지연) 없이 전 세계 어디서든 대시보드를 즉시 열람할 수 있도록 <strong>Cloudflare Pages 글로벌 CDN 환경에 정적 웹 애플리케이션 배포를 완료</strong>했습니다.
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div className="flex-row justify-between align-center">
              <div className="flex-row gap-2 align-center">
                <Globe size={16} color="var(--success)" />
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>배포 정보 및 라이브 URL</strong>
              </div>
              <a
                href="https://jira-analytics.pages.dev"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                데모 사이트 열기 <ExternalLink size={13} />
              </a>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>공개 URL</strong>: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>https://jira-analytics.pages.dev</code></li>
              <li><strong>호스팅 환경</strong>: Cloudflare Pages (트래픽 무제한, 서울 엣지 CDN 기반 초고속 로딩)</li>
              <li><strong>자동 배포 (CI/CD)</strong>: GitHub <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>main</code> 브랜치 푸시 시 자동 빌드 & 무중단 반영</li>
            </ul>
          </div>
        </div>

        {/* TASK 05 - 차기 로드맵 */}
        <div className="glass-panel flex-col" style={plannedCardStyle}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--accent-primary)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Layers size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 700 }}>TASK 05</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  5. 스프린트 릴리즈 간트 뷰 (Gantt View) & 자동 동기화 고도화
                </h3>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              background: 'rgba(37, 99, 235, 0.1)',
              color: 'var(--accent-primary)',
              padding: '4px 10px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }}>
              <Sparkles size={13} /> 차기 로드맵 (Planned)
            </span>
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            스프린트 릴리즈 일정의 타임라인 바(Bar) 가시화 및 주기적 데이터 자동 동기화 체계를 단계적으로 확장합니다.
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div className="flex-row gap-2 align-center">
              <RefreshCw size={16} color="var(--accent-primary)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>향후 개발 검토 항목</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>스프린트 릴리즈 간트 차트 (Gantt View)</strong>: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>query_fixversion</code>의 시작일~배포일을 타임라인 바로 표출하여 릴리즈 주기 비교</li>
              <li><strong>스케줄 기반 정기 동기화</strong>: Google Apps Script 트리거 기반 매일 정기 동기화 체계</li>
              <li><strong>Jira Webhook 연동</strong>: 이슈 변경 이벤트 발생 시 실시간 동기화 지원 방안 검토</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoadmapPage;
