import React from 'react';
import { MissionScore } from '../types';

interface MissionScoreCardProps {
  score: MissionScore;
  highlight?: 'winner' | 'loser' | 'neutral';
}

export function MissionScoreCard({ score, highlight = 'neutral' }: MissionScoreCardProps) {
  const maxScore = 120;
  const items = [
    { label: 'Base Travel Time Penalty', value: score.base_time_penalty, color: '#1d4ed8' },
    { label: 'Expected Delay Penalty', value: score.delay_penalty, color: '#ca8a04' },
    { label: 'Urgency Risk Penalty', value: score.urgency_risk_penalty, color: '#dc2626' },
  ];

  const borderColor =
    highlight === 'winner' ? 'var(--status-success-border)'
    : highlight === 'loser' ? 'var(--status-critical-border)'
    : 'var(--border-medium)';

  const bg =
    highlight === 'winner' ? 'var(--status-success-bg)'
    : highlight === 'loser' ? 'var(--status-critical-bg)'
    : 'var(--bg-surface)';

  const scoreColor =
    highlight === 'winner' ? 'var(--status-success-text)'
    : highlight === 'loser' ? 'var(--status-critical-text)'
    : 'var(--primary-navy)';

  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)', padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px solid var(--border-medium)', paddingBottom: 6 }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ROUTE {score.route_label} LOSS ANALYSIS
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 1 }}>
            Duration: {score.travel_time_h}h · Disruption Probability: {(score.disruption_probability * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            TOTAL LOSS SCORE
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {score.mission_score.toFixed(0)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
            <div style={{ width: 140, color: 'var(--text-secondary)', fontWeight: 700 }}>{item.label}</div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-subtle)', height: 6, borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min((item.value / maxScore) * 100, 100)}%`,
                  backgroundColor: item.color,
                  height: '100%',
                  borderRadius: 'var(--radius-pill)',
                }}
              />
            </div>
            <div style={{ width: 36, textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>
              {item.value.toFixed(1)}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-subtle)', marginTop: 2 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Expected Delay Impact:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: scoreColor, marginLeft: 'auto' }}>
            +{score.expected_delay_h.toFixed(1)} hrs
          </span>
        </div>
      </div>
    </div>
  );
}
