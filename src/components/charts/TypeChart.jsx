import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 이슈 유형별 구분 색상 배열
const COLORS = ['#7c3aed', '#ec4899', '#0d9488', '#d97706', '#64748b'];

/**
 * [이슈 유형 커스텀 툴팁]
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', boxShadow: 'var(--shadow-md)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{payload[0].name}: </span>
        <strong style={{ color: 'var(--text-primary)' }}>{payload[0].value}</strong>
      </div>
    );
  }
  return null;
};

/**
 * [이슈 유형 도넛 차트]
 * - innerRadius/outerRadius 조절로 두께를 풍성하게 확장
 * - paddingAngle 조절로 각 조각 간 벌어지는 간격 축소
 */
const TypeChart = ({ data }) => {
  return (
    <div className="glass-panel flex-col" style={{ height: '340px', padding: '16px 20px' }}>
      {/* 차트 헤더 */}
      <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
        이슈 유형
      </h4>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}  /* 기존 60 -> 45로 변경하여 안쪽 방향으로 두께 1.5배 확장 */
            outerRadius={80}  /* 바깥 반경 */
            paddingAngle={2.5} /* 기존 5 -> 2.5로 조각 간 벌어지는 간격 절반 감소 */
            dataKey="value"
            animationBegin={0}
            animationDuration={250}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TypeChart;
