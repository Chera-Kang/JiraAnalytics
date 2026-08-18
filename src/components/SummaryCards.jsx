import React from 'react';
import { Layers, CheckCircle, Clock } from 'lucide-react';

const Card = ({ title, value, icon: Icon, color, delay }) => (
  <div className="glass-panel flex-row gap-4 animate-fade-in" style={{ flex: 1, animationDelay: delay }}>
    <div className="flex-row" style={{ 
      background: `rgba(${color}, 0.15)`, 
      padding: '16px', 
      borderRadius: '16px',
      color: `rgb(${color})`
    }}>
      <Icon size={32} />
    </div>
    <div className="flex-col">
      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </span>
      <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </span>
    </div>
  </div>
);

const SummaryCards = ({ data }) => {
  const totalCreated = data.reduce((sum, item) => sum + (item.created || 0), 0);
  const totalResolved = data.reduce((sum, item) => sum + (item.resolved || 0), 0);
  const totalInProgress = data.reduce((sum, item) => sum + (item.inProgress || 0), 0);

  return (
    <div className="flex-row gap-6 w-full" style={{ flexWrap: 'wrap' }}>
      <Card title="Total Created" value={totalCreated} icon={Layers} color="59, 130, 246" delay="0.3s" />
      <Card title="Total Resolved" value={totalResolved} icon={CheckCircle} color="16, 185, 129" delay="0.4s" />
      <Card title="In Progress" value={totalInProgress} icon={Clock} color="245, 158, 11" delay="0.5s" />
    </div>
  );
};

export default SummaryCards;
