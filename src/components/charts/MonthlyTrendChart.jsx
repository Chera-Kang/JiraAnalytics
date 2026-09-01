import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * [월별 이슈 트렌드 커스텀 툴팁]
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: entry.color }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {entry.name}: <strong style={{ color: 'var(--text-primary)' }}>{entry.value}</strong>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * [월별 이슈 트렌드 콤보 차트]
 * - 생성/해결 이슈: 막대 그래프 (Bar)
 * - 잔여 이슈: 꺾은선 그래프 (Line)
 */
const MonthlyTrendChart = ({ data }) => {
  return (
    <div className="glass-panel" style={{ width: '100%', height: '400px', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
        월별 이슈 트렌드
      </h3>
      
      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.7} vertical={false} />
              
              <XAxis 
                dataKey="name" 
                stroke="var(--text-muted)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: '0.85rem' }} 
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
                dy={10}
              />
              
              <YAxis 
                yAxisId="left"
                stroke="var(--text-muted)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: '0.85rem' }} 
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="var(--text-muted)" 
                tick={{ fill: 'var(--text-secondary)', fontSize: '0.85rem' }} 
                axisLine={false}
                tickLine={false}
                dx={10}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              <Bar 
                yAxisId="left" 
                dataKey="created" 
                name="생성 이슈" 
                fill="url(#colorCreated)" 
                radius={[4, 4, 0, 0]} 
                barSize={24} 
                animationBegin={0}
                animationDuration={250}
                animationEasing="ease-out"
              />
              <Bar 
                yAxisId="left" 
                dataKey="resolved" 
                name="해결 이슈" 
                fill="url(#colorResolved)" 
                radius={[4, 4, 0, 0]} 
                barSize={24} 
                animationBegin={0}
                animationDuration={250}
                animationEasing="ease-out"
              />
              
              <Line 
                yAxisId="right"
                type="linear" 
                dataKey="remaining" 
                name="잔여 이슈" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-secondary)' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                animationBegin={0}
                animationDuration={250}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
