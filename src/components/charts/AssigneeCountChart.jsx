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
        <strong style={{ color: 'var(--text-primary)' }}>{payload[0].value}</strong>
      </div>
    );
  }
  return null;
};

/**
 * [담당자별 이슈 개수 수평 바 차트]
 * - 카드 높이는 390px로 고정하고, 막대 두께만 인원수에 따라 가변적으로 조절
 */
const AssigneeCountChart = ({ data }) => {
  const count = data ? data.length : 0;
  // 소수 인원 시 막대가 돋보이도록 두께만 동적 조절
  const dynamicBarSize = count <= 3 ? 26 : count <= 6 ? 20 : 16;

  return (
    <div className="glass-panel flex-col" style={{ height: '340px', padding: '16px 20px' }}>
      {/* 차트 제목 */}
      <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
        담당자 별 이슈 개수
      </h4>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
          {/* 세로 격자선 */}
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" opacity={0.6} />
          
          {/* X축 (이슈 개수) */}
          <XAxis type="number" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
          
          {/* Y축 (담당자 이름): interval={0}으로 설정하여 잘림 없이 모든 담당자 라벨 표출 */}
          <YAxis 
            dataKey="name" 
            type="category" 
            interval={0} 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-primary)', fontSize: '0.85rem' }} 
            tickLine={false} 
            axisLine={false} 
            width={90} 
          />
          
          {/* 툴팁 및 바 (동적 barSize 적용) */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
          <Bar 
            dataKey="value" 
            fill="#2563eb" 
            radius={[0, 4, 4, 0]} 
            barSize={dynamicBarSize} 
            animationBegin={0}
            animationDuration={250}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssigneeCountChart;
