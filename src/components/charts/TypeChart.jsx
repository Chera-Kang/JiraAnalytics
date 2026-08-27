import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getTypeColor } from '../../utils/jiraColors';

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
 */
const TypeChart = ({ data }) => {
  return (
    <div className="glass-panel flex-col" style={{ height: '340px', padding: '16px 20px' }}>
      <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
        이슈 유형
      </h4>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={2.5}
            dataKey="value"
            animationBegin={0}
            animationDuration={250}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getTypeColor(entry.name).fill} />
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
