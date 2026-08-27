import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, User, Clock, RefreshCw, MessageSquare, FileText, Link2, GitFork, Calendar } from 'lucide-react';

/**
 * [이슈 상세 보기 모달 컴포넌트]
 * - createPortal을 사용하여 브라우저 전체 화면(Full Viewport)에 백드롭 및 모달 표출
 * - 모달 활성화 시 background scroll 방지 (body overflow hidden)
 * - 상단 1행: 좌측 배지들 + 우측 X 닫기 버튼, 2행: 제목 표출
 * - 소요 일수 하단 타임라인 접기/펼치기 아코디언 지원 (모달 높이 82vh 고정 유지)
 * - 설명, 코멘트, 연결 이슈 항목 항상 표출 (없을 시 안내 문구)
 */
const IssueDetailModal = ({ issue, onClose }) => {
  // 타임라인 접기/펼치기 상태 (기본값: 닫힘)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // 모달 활성화 시 배경 스크롤 방지 & ESC 키 닫기 이벤트 리스너
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!issue) return null;

  // 우선순위 색상 헬퍼
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

  // 상태 배지 색상 헬퍼
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

  // 날짜 포맷 헬퍼 (YYYY-MM-DD HH:mm)
  const formatDate = (val) => {
    if (!val || val === '-') return '-';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      const hh = String(val.getHours()).padStart(2, '0');
      const mm = String(val.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${hh}:${mm}`;
    }
    return String(val);
  };

  // 연결된 이슈 줄바꿈 파싱
  const parseLinkedIssues = (linkedStr) => {
    if (!linkedStr || linkedStr === '-') return [];
    const lines = linkedStr.split(/\n+/).flatMap(chunk => {
      return chunk.split(/(?=[a-zA-Z\s\-_]+:\s*PPLW-\d+)/g).filter(Boolean);
    }).map(s => s.trim()).filter(Boolean);
    return lines.length > 0 ? lines : [linkedStr];
  };

  const priorityStyle = getPriorityColor(issue.priority);
  const statusStyle = getStatusColor(issue.status);
  const linkedList = parseLinkedIssues(issue.linkedIssues);

  // 타임라인 단계 정의
  const timelineSteps = [
    { label: '생성일시', date: issue.created, desc: '이슈 등록' },
    { label: 'Date 1 (시작)', date: issue.date1, desc: '작업 착수' },
    { label: 'Date 2 (개발완료)', date: issue.date2, desc: 'Dev Complete' },
    { label: 'Date 3 (QA진입)', date: issue.date3, desc: 'In QA' },
    { label: 'Date 4 (종료)', date: issue.date4, desc: 'Closed' }
  ];

  const hasDescription = issue.description && issue.description.trim() !== '' && issue.description !== '-';
  const hasComments = issue.comments && issue.comments.trim() !== '' && issue.comments !== '-';

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      {/* 모달 본체 카드 (고정 높이 82vh) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          height: '82vh',
          minHeight: '560px',
          maxHeight: '850px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* 1. 상단 고정 헤더 영역 */}
        <div style={{
          padding: '20px 28px 16px 28px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}>
          {/* 1행: 좌측 배지들(ID, 상태, 우선순위, 유형, Reopen) + 우측 X 닫기 버튼 */}
          <div className="flex-row justify-between align-center" style={{ width: '100%' }}>
            <div className="flex-row gap-2 align-center" style={{ flexWrap: 'wrap' }}>
              <span style={{
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '4px 10px',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}>
                {issue.id}
              </span>

              <span style={{
                background: statusStyle.bg,
                color: statusStyle.text,
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                {issue.status}
              </span>

              <span style={{
                background: priorityStyle.bg,
                color: priorityStyle.text,
                border: `1px solid ${priorityStyle.border}`,
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {issue.priority}
              </span>

              <span style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {issue.type}
              </span>

              {issue.reopenCounter > 0 && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <RefreshCw size={12} /> Reopen {issue.reopenCounter}회
                </span>
              )}
            </div>

            {/* X 닫기 버튼: 1행 우측 끝에 배치 */}
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'var(--bg-primary)';
              }}
              title="닫기 (ESC)"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2행: 이슈 제목 */}
          <h2 style={{ margin: '2px 0 0 0', fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
            {issue.title}
          </h2>
        </div>

        {/* 2. 내부 스크롤 가능한 본문 영역 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}>
          {/* 메타정보 4열 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>담당자</span>
              <div className="flex-row gap-1 align-center">
                <User size={14} color="var(--accent-primary)" />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{issue.assignee}</strong>
              </div>
            </div>

            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>수정버전</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>{issue.fixVersion}</strong>
            </div>

            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>보고자</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{issue.reporter || '-'}</span>
            </div>

            {/* 4번째 카드: 소요 일수 & 타임라인 토글 버튼 */}
            <div className="flex-col gap-1">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>소요 일수</span>
              <div className="flex-row gap-1 align-center">
                <Clock size={14} color="var(--warning)" />
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {issue.resolutionTimeDays ? `${issue.resolutionTimeDays}일` : '-'}
                </strong>
              </div>

              {/* 타임라인 접기/펼치기 버튼 */}
              <button
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                style={{
                  marginTop: '4px',
                  background: isTimelineOpen ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-tertiary)',
                  color: isTimelineOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: isTimelineOpen ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
              >
                <Calendar size={12} />
                <span>{isTimelineOpen ? '타임라인 닫기 ▲' : '타임라인 보기 ▼'}</span>
              </button>
            </div>
          </div>

          {/* 타임라인 시각화 바 (아코디언 형태: 토글 시 부드럽게 표출) */}
          {isTimelineOpen && (
            <div className="flex-col gap-3 animate-fade-in" style={{ background: 'var(--bg-tertiary)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                🕒 이슈 라이프사이클 타임라인
              </span>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px'
              }}>
                {timelineSteps.map((step, idx) => {
                  const hasDate = step.date && step.date !== '-';
                  return (
                    <div key={idx} className="flex-col gap-1" style={{
                      background: hasDate ? 'var(--bg-secondary)' : 'rgba(0,0,0,0.02)',
                      border: hasDate ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px',
                      opacity: hasDate ? 1 : 0.5
                    }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: hasDate ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {step.label}
                      </span>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        {formatDate(step.date)}
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1. 이슈 설명 (Description) - 항상 표출 */}
          <div className="flex-col gap-2">
            <div className="flex-row gap-2 align-center">
              <FileText size={16} color="var(--accent-primary)" />
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>이슈 설명 (Description)</h4>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: hasDescription ? 'var(--text-secondary)' : 'var(--text-muted)',
              whiteSpace: 'pre-wrap',
              maxHeight: '160px',
              overflowY: 'auto'
            }}>
              {hasDescription ? issue.description : '등록된 이슈 설명이 없습니다.'}
            </div>
          </div>

          {/* 2. 코멘트 이력 (Comments) - 항상 표출 */}
          <div className="flex-col gap-2">
            <div className="flex-row gap-2 align-center">
              <MessageSquare size={16} color="var(--accent-secondary)" />
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>코멘트 이력</h4>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '0.86rem',
              lineHeight: 1.6,
              color: hasComments ? 'var(--text-secondary)' : 'var(--text-muted)',
              whiteSpace: 'pre-wrap',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {hasComments ? issue.comments : '등록된 코멘트가 없습니다.'}
            </div>
          </div>

          {/* 3. 연결된 이슈 & 서브태스크 - 항상 표출 */}
          <div className="flex-col gap-3">
            <div className="flex-col gap-2">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Link2 size={14} color="var(--accent-primary)" /> 연결된 이슈 {linkedList.length > 0 && `(${linkedList.length}건)`}
              </span>
              {linkedList.length > 0 ? (
                <div className="flex-col gap-1" style={{ width: '100%' }}>
                  {linkedList.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  연결된 이슈가 없습니다.
                </div>
              )}
            </div>

            {issue.subTasks && issue.subTasks !== '-' && (
              <div className="flex-col gap-1" style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <GitFork size={14} color="var(--accent-secondary)" /> 서브태스크
                </span>
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}>
                  {issue.subTasks}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default IssueDetailModal;
