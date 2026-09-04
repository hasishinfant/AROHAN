import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { TopBar } from './components/Layout/TopBar';
import { LandingPage } from './pages/LandingPage';
import { CommandCenter } from './pages/CommandCenter';
import { MissionDetail } from './pages/MissionDetail';
import { ActionCenter } from './pages/ActionCenter';
import { DriverInterface } from './pages/DriverInterface';
import { ReplanningView } from './pages/ReplanningView';
import { DecisionHistory } from './pages/DecisionHistory';
import { DemoController } from './pages/DemoController';
import { BaselineComparison } from './pages/BaselineComparison';
import { SystemHealth } from './pages/SystemHealth';
import { LoginPage } from './pages/LoginPage';
import { useArohanStore } from './stores/arohanStore';
import { useWebSocket } from './hooks/useWebSocket';
import './styles/globals.css';

function AppShell() {
  const { fetchState, isLoading } = useArohanStore();

  // Connect WebSocket
  useWebSocket();

  // Load initial state
  React.useEffect(() => {
    fetchState();
  }, []);

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f2', color: '#0f172a' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-teal)' }}>AROHAN LOGISTICS ORCHESTRATION</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>Initializing system state & telemetry...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Routes>
            <Route path="/command" element={<CommandCenter />} />
            <Route path="/mission" element={<MissionDetail />} />
            <Route path="/action" element={<ActionCenter />} />
            <Route path="/replan" element={<ReplanningView />} />
            <Route path="/history" element={<DecisionHistory />} />
            <Route path="/baseline" element={<BaselineComparison />} />
            <Route path="/demo" element={<DemoController />} />
            <Route path="/health" element={<SystemHealth />} />
            <Route path="*" element={<Navigate to="/command" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Driver interface has standalone mobile-first layout
function DriverApp() {
  useWebSocket();
  React.useEffect(() => {
    useArohanStore.getState().fetchState();
  }, []);
  return <DriverInterface />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/driver" element={<DriverApp />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
