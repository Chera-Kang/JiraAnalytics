import React, { useEffect } from 'react';
import { X, User, Clock, RefreshCw, MessageSquare, FileText, Link2 } from 'lucide-react';

/**
 * [이슈 상세 보기 모달 컴포넌트]
 * - 이슈 행(Row) 클릭 시 화면 이동 없이 열리는 심층 정보 팝업
 * - Date 1~4 타임라인 시각화, 설명(Description), 코멘트, 메타정보 표출
 */
const IssueDetailModal = ({ issue, onClose }) => {
  // ESC 키 입력 시 팝업 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const priorityStyle = getPriorityColor(issue.priority);
  const statusStyle = getStatusColor(issue.status);

  // 타임라인 단계 정의
  const timelineSteps = [
    { label: '생성일시', date: issue.created, desc: '이슈 등록' },
    { label: 'Date 1 (시작)', date: issue.date1, desc: '작업 착수' },
    { label: 'Date 2 (개발완료)', date: issue.date2, desc: 'Dev Complete' },
    { label: 'Date 3 (QA진입)', date: issue.date3, desc: 'In QA' },
    { label: 'Date 4 (종료)', date: issue.date4, desc: 'Closed' }
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel flex-col"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-xl)',
          overflowY: 'auto',
          gap: '24px',
          position: 'relative'
        }}
      >
        {/* 상단 헤더 & 배지 영역 */}
        <div className="flex-row justify-between align-start" style={{ gap: '16px' }}>
          <div className="flex-col gap-2" style={{ flex: 1 }}>
            <div className="flex-row gap-2 align-center" style={{ flexWrap: 'wrap' }}>
              <span style={{
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
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

            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
              {issue.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
            title="닫기 (ESC)"
          >
            <X size={20} />
          </button>
        </div>

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

          <div className="flex-col gap-1">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>소요 일수 (Date 1~2)</span>
            <div className="flex-row gap-1 align-center">
              <Clock size={14} color="var(--warning)" />
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {issue.resolutionTimeDays ? `${issue.resolutionTimeDays}일` : '-'}
              </strong>
            </div>
          </div>
        </div>

        {/* 타임라인 시각화 바 */}
        <div className="flex-col gap-3" style={{ background: 'var(--bg-tertiary)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div className="flex-row justify-between align-center">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🕒 이슈 라이프사이클 타임라인
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            position: 'relative'
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: hasDate ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {step.label}
                  </span>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {formatDate(step.date)}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 설명 (Description) */}
        {issue.description && issue.description !== '-' && (
          <div className="flex-col gap-2">
            <div className="flex-row gap-2 align-center">
              <FileText size={16} color="var(--accent-primary)" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>이슈 설명 (Description)</h4>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              {issue.description}
            </div>
          </div>
        )}

        {/* 코멘트 (Comments) */}
        {issue.comments && issue.comments !== '-' && (
          <div className="flex-col gap-2">
            <div className="flex-row gap-2 align-center">
              <MessageSquare size={16} color="var(--accent-secondary)" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>코멘트 이력</h4>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              maxHeight: '160px',
              overflowY: 'auto'
            }}>
              {issue.comments}
            </div>
          </div>
        )}

        {/* 연결된 이슈 및 서브태스크 */}
        {(issue.linkedIssues || issue.subTasks) && (
          <div className="flex-row gap-4" style={{ flexWrap: 'wrap' }}>
            {issue.linkedIssues && issue.linkedIssues !== '-' && (
              <div className="flex-col gap-1" style={{ flex: 1, minWidth: '220px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Link2 size={13} /> 연결된 이슈
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {issue.linkedIssues}
                </span>
              </div>
            )}
            {issue.subTasks && issue.subTasks !== '-' && (
              <div className="flex-col gap-1" style={{ flex: 1, minWidth: '220px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>서브태스크</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {issue.subTasks}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetailModal;
