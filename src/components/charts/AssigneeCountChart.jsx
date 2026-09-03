import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * [담당자별 이슈 개수 커스텀 툴팁]
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        <span style={{ color: 'var(--text-secondary)' }}>이슈 개수: </span>
        <strong style={{ color: 'var(--text-primary)' }}>{payload[0].value}건</strong>
        <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
          클릭 시 개인 리포트로 이동 ➔
        </div>
      </div>
    );
  }
  return null;
};

/**
 * [담당자별 이슈 개수 수평 바 차트]
 * - 막대 클릭 시 해당 담당자의 개인별 맞춤 대시보드로 이동
 */
const AssigneeCountChart = ({ data, onNavigate }) => {
  const count = data ? data.length : 0;
  const dynamicBarSize = count <= 3 ? 26 : count <= 6 ? 20 : 16;

  const handleBarClick = (entry) => {
    if (entry && entry.name && entry.name !== '미지정' && entry.name !== '-' && onNavigate) {
      onNavigate('memberStats', { user: entry.name });
    }
  };

  return (
    <div className="glass-panel flex-col" style={{ height: '340px', padding: '16px 20px' }}>
      {/* 차트 제목 */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: 0, textAlign: 'center', width: '100%', color: 'var(--text-primary)', fontWeight: 600 }}>
          담당자 별 이슈 개수
        </h4>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
          {/* 세로 격자선 */}
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" opacity={0.6} />
          
          {/* X축 (이슈 개수) */}
          <XAxis type="number" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
          
          {/* Y축 (담당자 이름) */}
          <YAxis 
            dataKey="name" 
            type="category" 
            interval={0} 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer' }} 
            tickLine={false} 
            axisLine={false} 
            width={90}
            onClick={(e) => {
              if (e?.value && e.value !== '미지정' && onNavigate) {
                onNavigate('memberStats', { user: e.value });
              }
            }}
          />
          
          {/* 툴팁 및 바 */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6" 
            radius={[0, 4, 4, 0]} 
            barSize={dynamicBarSize} 
            animationBegin={0}
            animationDuration={250}
            animationEasing="ease-out"
            cursor="pointer"
            onClick={handleBarClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssigneeCountChart;
