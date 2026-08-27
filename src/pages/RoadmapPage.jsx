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
  RefreshCw
} from 'lucide-react';

/**
 * [차세대 개발 로드맵 페이지 (RoadmapPage)]
 * - 임시 페이지: 개발 계획 및 의사결정 과제 공유용
 */
const RoadmapPage = () => {
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
            프로젝트 고도화 계획 & 의사결정 과제
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Jira Analytics 대시보드의 확장성과 실무 활용도를 극대화하기 위한 단계별 추진 과제입니다.
          </p>
        </div>
      </div>

      {/* 로드맵 과제 리스트 */}
      <div className="flex-col gap-6 w-full">

        {/* TASK 01 */}
        <div className="glass-panel flex-col" style={{ padding: '24px 28px', gap: '18px', borderLeft: '5px solid var(--success)' }}>
          <div className="flex-row justify-between align-center">
            <div className="flex-row gap-3 align-center">
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--success)',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                <Database size={22} />
              </div>
              <div className="flex-col">
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700 }}>TASK 01</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  1. 데이터 처리 아키텍처 방향성 결정 (A안 vs B안)
                </h3>
              </div>
            </div>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--success)',
              padding: '4px 10px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={13} /> 적용 완료 (B안 채택)
            </span>
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

        {/* TASK 02 */}
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
              <li><strong>품질 지표(Quality Metrics)</strong>: 개인별 평균 처리 일수, 우선순위 대응 비율</li>
              <li><strong>필터 연동</strong>: 연도/월 및 스프린트별 개별 실적 조회</li>
            </ul>
          </div>
        </div>

        {/* TASK 03 */}
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
            이슈 생성부터 종료까지의 단계별 세부 일자(Date 1~5)를 연동하여 프로젝트 흐름의 지연 요인과 병목 구간을 시각적으로 진단합니다.
          </p>
        </div>

        {/* TASK 04 */}
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
            별도 인프라/서버 비용에 대한 부담 없이 언제 어디서든 안정적으로 지표를 확인할 수 있는 상시 웹 환경(Cloudflare Pages 등)을 마련합니다.
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
              <li><strong>방안 1 (On-demand)</strong>: 웹 화면의 [데이터 갱신] 버튼 클릭 시 실시간 백엔드/스크립트 트리거 연동</li>
              <li><strong>방안 2 (Scheduled)</strong>: 스케줄러 기반 정기 자동 동기화</li>
              <li><strong>방안 3 (Webhook)</strong>: Jira 이슈 변경 이벤트 발생 시 즉시 자동 동기화</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoadmapPage;
