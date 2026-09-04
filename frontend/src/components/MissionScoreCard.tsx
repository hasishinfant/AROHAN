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
    { label: 'Expected Delay Penalty', value: score.delay_penalty, color: '#d97706' },
    { label: 'Urgency Risk Penalty', value: score.urgency_risk_penalty, color: '#dc2626' },
  ];

  const borderColor =
    highlight === 'winner' ? 'var(--status-success-border)'
    : highlight === 'loser' ? 'var(--status-critical-border)'
    : 'var(--border-subtle)';

  const bg =
    highlight === 'winner' ? 'var(--status-success-bg)'
    : highlight === 'loser' ? 'var(--status-critical-bg)'
    : 'var(--bg-surface)';

  const scoreColor =
    highlight === 'winner' ? 'var(--status-success-text)'
    : highlight === 'loser' ? 'var(--status-critical-text)'
    : 'var(--primary-navy)';

  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ROUTE {score.route_label} SCORE
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
            {score.travel_time_h}h base duration · {(score.disruption_probability * 100).toFixed(0)}% disruption probability
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            TOTAL LOSS SCORE
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {score.mission_score.toFixed(0)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
            <div style={{ width: 140, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-subtle)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min((item.value / maxScore) * 100, 100)}%`,
                  backgroundColor: item.color,
                  height: '100%',
                  borderRadius: 4,
                }}
              />
            </div>
            <div style={{ width: 36, textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
              {item.value.toFixed(1)}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-light)', marginTop: 4 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expected Delay Impact:</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: scoreColor, marginLeft: 'auto' }}>
            +{score.expected_delay_h.toFixed(1)} hours
          </span>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '4px 8px', backgroundColor: 'var(--bg-panel)', borderRadius: 4, fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>score = base({score.base_time_penalty.toFixed(1)}) + delay({score.delay_penalty.toFixed(1)}) + urgency({score.urgency_risk_penalty.toFixed(1)})</span>
        <span className="data-tag data-tag-derived">DERIVED</span>
      </div>
    </div>
  );
}
