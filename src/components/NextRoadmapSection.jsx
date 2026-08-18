import React from 'react';
import {
  Database,
  UserCheck,
  Sparkles,
  CalendarClock,
  HelpCircle,
  Workflow,
  LineChart,
  GitCompare,
  Globe,
  RefreshCw
} from 'lucide-react';

/**
 * [차세대 개발 로드맵 & To-Do 컴포넌트]
 * - 상급자 보고 및 팀 내 공유를 위해 과제별 검토 배경과 장단점을 정돈된 List 형태로 표현
 * - 콘텐츠를 중앙(maxWidth: 880px)으로 모아 안정적인 가독성 제공
 */
const NextRoadmapSection = () => {
  return (
    <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }} className="flex-col gap-6 animate-fade-in">
      {/* 상단 네비게이션 & 타이틀 */}
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
            프로젝트 고도화 계획 & 의사결정 과제
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Jira Analytics 대시보드의 확장성과 실무 활용도를 극대화하기 위한 단계별 추진 과제입니다.
          </p>
        </div>


      </div>

      {/* 로드맵 과제 리스트 (단일 컬럼 세로 목록) */}
      <div className="flex-col gap-6 w-full">

        {/* ========================================================
            TASK 01: 데이터 취급 방식 선택 (A안 vs B안 비교 검토)
        ======================================================== */}
        <div className="glass-panel flex-col" style={{ padding: '24px 28px', gap: '18px', borderLeft: '5px solid var(--accent-primary)' }}>
          {/* 과제 헤더 */}
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--accent-primary)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Database size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 700 }}>TASK 01</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  1. 데이터 처리 아키텍처 방향성 결정 (A안 vs B안)
                </h3>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(217, 119, 6, 0.12)',
              color: 'var(--warning)',
              padding: '4px 10px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <HelpCircle size={13} /> 의사결정 검토 중
            </span>
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            향후 연도/월/사용자별 다차원 세부 필터링 및 대시보드 확장성을 위해 데이터 가공 주체를 어디에 둘 것인지 두 가지 방식을 놓고 비교·검토하고 있습니다.
          </p>

          {/* A안 vs B안 비교 박스 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px',
            marginTop: '4px'
          }}>
            {/* [A안] 스프레드시트 수식 사전 연산 */}
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: '10px',
              padding: '16px 18px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div className="flex-row gap-2 align-center">
                <Workflow size={17} color="var(--text-muted)" />
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>[A안] 스프레드시트 수식 사전 연산</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                구글 스프레드시트 쿼리/수식(LET, SEQUENCE 등)에서 미리 통계를 계산해두고 웹은 결과만 표시
              </p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }} className="flex-col gap-1">
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>• 장점: 프론트엔드 연산 부담 없음, 시트 내 수식 검증 용이</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 500 }}>• 한계: 복합 필터(사용자+기간+버전) 추가 시 시트 수식이 기하급수적으로 복잡해짐</span>
              </div>
            </div>

            {/* [B안] 프론트엔드 Raw Data 실시간 연산 */}
            <div style={{
              background: 'rgba(37, 99, 235, 0.03)',
              borderRadius: '10px',
              padding: '16px 18px',
              border: '1px solid rgba(37, 99, 235, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div className="flex-row gap-2 align-center">
                <GitCompare size={17} color="var(--accent-primary)" />
                <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>[B안] 프론트엔드 Raw Data 실시간 연산</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                스프레드시트는 순수 DB(Raw Data)로만 두고, React 메모리에서 다차원 조건으로 실시간 집계
              </p>
              <div style={{ borderTop: '1px solid rgba(37, 99, 235, 0.15)', paddingTop: '8px' }} className="flex-col gap-1">
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>• 장점: 다차원 필터링(사용자별/연월별/버전별) 자유자재, 즉각적 반응 속도</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>• 고려사항: 프론트엔드 통계 가공 로직 구현 및 데이터 정합성 검증 필요</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            TASK 02: 각 사용자 별 Dashboard 생성
        ======================================================== */}
        <div className="glass-panel flex-col" style={{ padding: '24px 28px', gap: '14px', borderLeft: '5px solid var(--accent-secondary)' }}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(124, 58, 237, 0.1)',
                color: 'var(--accent-secondary)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <UserCheck size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>TASK 02</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  2. 담당자별 맞춤 대시보드 구축 (Individual Dashboard)
                </h3>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(124, 58, 237, 0.12)',
              color: 'var(--accent-secondary)',
              padding: '4px 10px',
              borderRadius: '8px'
            }}>
              차기 개발 예정
            </span>
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            조직 전체 지표뿐만 아니라 팀원 개개인의 업무 성과와 담당 영역을 집중 조명할 수 있는 <strong>담당자 전용 상세 페이지</strong>를 신설합니다.
          </p>

          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid var(--border-color)'
          }}>
            <div className="flex-row gap-2 align-center" style={{ marginBottom: '6px' }}>
              <LineChart size={16} color="var(--accent-secondary)" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>주요 제공 기능</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>참여 기능(Feature) 및 이슈 추적</strong>: 각 담당자가 담당·해결한 이슈 내역 및 버전별 기여도</li>
              <li><strong>품질 지표(Quality Metrics)</strong>: 개인별 평균 처리 일수, 우선순위(Highest/High) 대응 비율</li>
              <li><strong>필터 연동</strong>: 연도/월 및 스프린트별 개별 실적 조회</li>
            </ul>
          </div>
        </div>

        {/* ========================================================
            TASK 03: 타임라인 고도화 (Date 1 ~ 5)
        ======================================================== */}
        <div className="glass-panel flex-col" style={{ padding: '24px 28px', gap: '14px', borderLeft: '5px solid var(--success)' }}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(5, 150, 105, 0.1)',
                color: 'var(--success)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <CalendarClock size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700 }}>TASK 03</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  3. 타임라인(Gantt) 및 단계별 병목 구간 분석 (Date 1 ~ 5 확장)
                </h3>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(5, 150, 105, 0.12)',
              color: 'var(--success)',
              padding: '4px 10px',
              borderRadius: '8px'
            }}>
              중기 로드맵
            </span>
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            이슈 생성부터 종료까지의 단계별 세부 일자(Date 1~5: 기획, 디자인, 개발, QA, 배포 등)를 연동하여 프로젝트 흐름의 지연 요인과 병목 구간을 시각적으로 진단합니다.
          </p>
        </div>

        {/* ========================================================
            TASK 04: 상시 접근성 확보 & 데이터 동기화 자동화 방식 개선
        ======================================================== */}
        <div className="glass-panel flex-col" style={{ padding: '24px 28px', gap: '14px', borderLeft: '5px solid #0284c7' }}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Globe size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>TASK 04</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  4. 상시 안정적 접근 환경 구축 & 데이터 갱신 방식 자동화
                </h3>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              padding: '4px 10px',
              borderRadius: '8px'
            }}>
              구조 개선 검토
            </span>
          </div>

          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6 }}>
            별도 인프라/서버 비용에 대한 부담 없이 언제 어디서든 안정적으로 지표를 확인할 수 있는 상시 웹 환경을 마련하고, 수동 스크립트 실행에 의존하던 데이터 갱신 방식을 고도화합니다.
          </p>

          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            padding: '14px 18px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div className="flex-row gap-2 align-center">
              <RefreshCw size={16} color="#0284c7" />
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>데이터 동기화(Sync) 방식 개선 검토안</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>현행 방식의 한계</strong>: Google Apps Script(GAS)에서 수동으로 배포/실행해야만 최신 데이터가 반영되는 구조</li>
              <li><strong>방안 1 (On-demand)</strong>: 웹 화면의 [데이터 갱신] 버튼 클릭 시 실시간 백엔드/스크립트 트리거 연동</li>
              <li><strong>방안 2 (Scheduled)</strong>: 스케줄러 기반 정기 자동 동기화 (예: 매일 특정 시간 또는 주기적 자동 배치 실행)</li>
              <li><strong>방안 3 (Webhook)</strong>: Jira 이슈 변경 이벤트 발생 시 즉시 자동 동기화되는 전면 자동화 파이프라인</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NextRoadmapSection;
