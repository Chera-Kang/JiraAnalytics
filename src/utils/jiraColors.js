/**
 * [Jira 표준 색상 체계 유틸리티]
 * - 우선순위 (Priority) & 이슈 유형 (Type) 통합 색상 매핑
 * - 차트 및 테이블/모달 배지 전역 공유
 */

/**
 * 우선순위 색상 헬퍼
 * - Highest: 빨간색
 * - High: 연한 빨간색
 * - Medium: 노란색
 * - Low: 파란색
 * - Lowest: 연한 파란색
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Highest':
      return { fill: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' }; // 빨간색
    case 'High':
      return { fill: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)', text: '#e11d48', border: 'rgba(251, 113, 133, 0.3)' }; // 연한 빨간색
    case 'Medium':
      return { fill: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' }; // 노란색
    case 'Low':
      return { fill: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' }; // 파란색
    case 'Lowest':
      return { fill: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', text: '#0284c7', border: 'rgba(56, 189, 248, 0.3)' }; // 연한 파란색
    default:
      return { fill: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', text: '#64748b', border: 'rgba(148, 163, 184, 0.3)' };
  }
};

/**
 * 이슈 유형 색상 헬퍼
 * - Planning: 보라색
 * - Design: 노란색
 * - 작업: 연한 파란색
 * - 스토리: 연두색
 * - 하위 작업: 짙은 하늘색
 * - 버그: 연한 빨간색
 */
export const getTypeColor = (type) => {
  switch (type) {
    case 'Planning':
    case '기획':
      return { fill: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', text: '#7c3aed', border: 'rgba(139, 92, 246, 0.3)' }; // 보라색
    case 'Design':
    case '디자인':
      return { fill: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' }; // 노란색
    case '작업':
    case 'Task':
      return { fill: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', text: '#0284c7', border: 'rgba(56, 189, 248, 0.3)' }; // 연한 파란색
    case '스토리':
    case 'Story':
      return { fill: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' }; // 연두색
    case '하위 작업':
    case 'Sub-task':
      return { fill: '#0284c7', bg: 'rgba(2, 132, 199, 0.15)', text: '#0369a1', border: 'rgba(2, 132, 199, 0.3)' }; // 짙은 하늘색
    case '버그':
    case 'Bug':
      return { fill: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)', text: '#e11d48', border: 'rgba(251, 113, 133, 0.3)' }; // 연한 빨간색
    default:
      return { fill: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', text: '#475569', border: 'rgba(100, 116, 139, 0.25)' };
  }
};
