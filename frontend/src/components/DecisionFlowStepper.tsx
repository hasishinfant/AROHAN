import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, GitCompare, Boxes, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface StepItem {
  id: string;
  stage: string;
  title: string;
  path: string;
  icon: React.ElementType;
  metric: string;
}

export function DecisionFlowStepper() {
  const navigate = useNavigate();
  const location = useLocation();

  const steps: StepItem[] = [
    {
      id: 'predict',
      stage: '01 PREDICT',
      title: 'Terrain Risk',
      path: '/risk',
      icon: ShieldAlert,
      metric: 'NH-6 Landslide 74%',
    },
    {
      id: 'reroute',
      stage: '02 REROUTE',
      title: 'Corridor Bypass',
      path: '/replan',
      icon: GitCompare,
      metric: 'Route B (Ridge Road)',
    },
    {
      id: 'redistribute',
      stage: '03 REDISTRIBUTE',
      title: 'District Matching',
      path: '/resources',
      icon: Boxes,
      metric: 'Kamrup → Shillong (2.2k MT)',
    },
    {
      id: 'act',
      stage: '04 ACT',
      title: 'Formal Approval',
      path: '/action',
      icon: CheckCircle2,
      metric: 'Action Card #102 Active',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        padding: '10px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#064E3B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#064E3B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            OPERATIONAL DECISION PIPELINE
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
            Closed-loop governance: Predict $\rightarrow$ Reroute $\rightarrow$ Redistribute $\rightarrow$ Act
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {steps.map((s, idx) => {
          const isActive = location.pathname === s.path;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div
                onClick={() => navigate(s.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 10,
                  backgroundColor: isActive ? '#ECFDF5' : '#F8FAFC',
                  border: `1px solid ${isActive ? '#059669' : '#E2E8F0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon
                  size={15}
                  style={{ color: isActive ? '#059669' : '#64748B' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isActive ? '#059669' : '#64748B', letterSpacing: '0.04em' }}>
                    {s.stage}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                    {s.title}
                  </span>
                </div>
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    backgroundColor: isActive ? '#059669' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#475569',
                    padding: '2px 6px',
                    borderRadius: 9999,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.metric}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight size={14} style={{ color: '#94A3B8' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
