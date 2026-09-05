import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Boxes, CheckCircle2, ChevronRight, Sparkles, MessageSquare, Compass, Zap } from 'lucide-react';

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
      path: '/map',
      icon: Compass,
      metric: 'NH-6 Landslide (74%)',
    },
    {
      id: 'reroute',
      stage: '02 REROUTE',
      title: 'Action & Bypass',
      path: '/action',
      icon: Zap,
      metric: 'Sonapur Ridge Bypass',
    },
    {
      id: 'redistribute',
      stage: '03 REDISTRIBUTE',
      title: 'District Matching',
      path: '/resources',
      icon: Boxes,
      metric: 'Guwahati → Shillong (2.2k MT)',
    },
    {
      id: 'dispatch',
      stage: '04 DISPATCH',
      title: 'Driver WhatsApp',
      path: '/communications',
      icon: MessageSquare,
      metric: 'Multilingual Dispatch',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 10,
        padding: '10px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.04em' }}>
            OPERATIONAL DECISION PIPELINE
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Predict</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>→</span>
            <span>Reroute</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>→</span>
            <span>Redistribute</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>→</span>
            <span>Dispatch</span>
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
                  borderRadius: 8,
                  backgroundColor: isActive ? '#ECFDF5' : '#F8FAFC',
                  border: `1px solid ${isActive ? '#A7F3D0' : '#E2E8F0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon
                  size={14}
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
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.metric}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight size={14} style={{ color: '#CBD5E1' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
