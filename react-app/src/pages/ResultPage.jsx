import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import { getServiceIcon, parseCostNum } from '../utils/serviceHelpers';

const COST_COLORS = [
  'var(--cyan)', '#80aaff', 'var(--magenta)', 'var(--gold)',
  '#7ddd9a', '#b0b0ff', '#ffaa30', '#ff80cc',
];

import ComparisonMatrix from '../components/ComparisonMatrix';

export default function ResultPage() {
  const [tiersData, setTiersData] = useState(null);
  const [activeTier, setActiveTier] = useState('balanced');
  const [activeTab, setActiveTab] = useState('diagram');
  const [rawVisible, setRawVisible] = useState(false);

  useEffect(() => {
    // Read the search params if they want to jump to a specific tier
    const params = new URLSearchParams(window.location.search);
    if (params.get('tier')) setActiveTier(params.get('tier'));

    const raw = localStorage.getItem('architectureDataTiered');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.tiers) setTiersData(parsed.tiers);
    } catch (e) {
      // invalid data
    }
  }, []);

  // Animate cost bars after render if we are not on compare tab
  useEffect(() => {
    if (!tiersData || activeTier === 'compare') return;
    const timer = setTimeout(() => {
      document.querySelectorAll('.cost-bar-fill[data-pct]').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [tiersData, activeTier]);

  const toggleRaw = () => setRawVisible(prev => !prev);

  const exportJSON = () => {
    if (!tiersData) { alert('No data to export.'); return; }
    const blob = new Blob([JSON.stringify(tiersData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'architectures.json';
    a.click();
  };

  // No data state
  if (!tiersData) {
    return (
      <div className="page">
        <nav>
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>ArchitectAI</Link>
          <div className="nav-mid">
            <span>Architecture Result</span>
          </div>
          <div className="nav-right">
            <Link to="/" className="nbtn primary">← Generate Architecture</Link>
          </div>
        </nav>
        <div className="no-data">
          <div className="no-data-icon">📭</div>
          <div className="no-data-title">NO ARCHITECTURE LOADED</div>
          <div className="no-data-sub">
            Go back to the generator, describe your project, and click Generate Architecture. Results will appear here automatically.
          </div>
          <Link to="/" className="go-back-btn">← Generate Architecture</Link>
        </div>
      </div>
    );
  }

  const isCompare = activeTier === 'compare';
  const data = isCompare ? null : tiersData[activeTier];

  const svcs = data?.aws_services || [];
  const cb = data?.cost_breakdown || {};
  const perSvc = cb.per_service || [];
  const ov = data?.architecture_overview || {};
  const steps = data?.implementation_steps || [];
  const mermaidSrc = (data?.mermaid || '').trim();
  const maxCostNum = perSvc.reduce((m, s) => Math.max(m, parseCostNum(s.cost)), 500);
  const scaleMatch = (data?.scale_analysis || '').match(/free_tier|growth|scale|large_scale|distributed/i);

  const flowDefs = [
    { key: 'read_flow', label: 'Read Flow', cls: 'read' },
    { key: 'write_flow', label: 'Write Flow', cls: 'write' },
    { key: 'realtime_flow', label: 'Realtime Flow', cls: 'realtime' },
    { key: 'async_flow', label: 'Async Flow', cls: 'async' },
  ];

  const activeFlows = flowDefs.filter(f => ov[f.key] && !ov[f.key].startsWith('N/A'));

  return (
    <div className="page">
      {/* Nav */}
      <nav>
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>ArchitectAI</Link>
        <div className="nav-mid">
          <div className="tier-tabs">
             <button className={`tier-tab ${activeTier === 'compare' ? 'active' : ''}`} onClick={() => setActiveTier('compare')}>📊 Comparison</button>
             <button className={`tier-tab ${activeTier === 'cost' ? 'active tcost' : ''}`} onClick={() => setActiveTier('cost')}>Cost-Efficient</button>
             <button className={`tier-tab ${activeTier === 'balanced' ? 'active tbal' : ''}`} onClick={() => setActiveTier('balanced')}>Balanced</button>
             <button className={`tier-tab ${activeTier === 'performance' ? 'active tperf' : ''}`} onClick={() => setActiveTier('performance')}>High-Performance</button>
          </div>
        </div>
        <div className="nav-right">
          {!isCompare && <button className="nbtn" onClick={toggleRaw}>⟨/⟩ Raw Mermaid</button>}
          <button className="nbtn" onClick={exportJSON}>↓ Export JSON</button>
          <Link to="/" className="nbtn primary">← Back to Generator</Link>
        </div>
      </nav>

      {/* Main Layout */}
      {isCompare ? (
         <div className="compare-layout" style={{ maxWidth: 1200, margin: '40px auto' }}>
            <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: 40, letterSpacing: '0.06em' }}>ARCHITECTURE COMPARISON</h2>
            <ComparisonMatrix tiersData={tiersData} />
         </div>
      ) : (
      <div className="layout">
        {/* LEFT SIDEBAR */}
        <div className="sidebar-left">
          <div style={{ paddingTop: 20 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '.6rem',
              color: 'var(--cyan)', letterSpacing: '.14em', textTransform: 'uppercase',
              marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)',
            }}>
              AWS Services
            </div>
            <div>
              {svcs.map((svc, i) => (
                <div key={i} className="svc-item">
                  <div className="svc-head">
                    <span className="svc-icon">{getServiceIcon(svc.name)}</span>
                    <span className="svc-name">{svc.name}</span>
                  </div>
                  <div className="svc-role">{svc.role || ''}</div>
                  <div className="svc-just">{svc.justification || ''}</div>
                  {svc.estimated_monthly_cost && (
                    <div className="svc-cost-tag">💰 {svc.estimated_monthly_cost}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '.6rem',
              color: '#80aaff', letterSpacing: '.14em', textTransform: 'uppercase',
              margin: '20px 0 14px', paddingTop: 16, borderTop: '1px solid var(--border)',
            }}>
              Implementation Plan
            </div>
            <div>
              {steps.map((s, i) => (
                <div key={i} className="impl-item">
                  <div className="impl-item-head">
                    <div className="impl-num">{i + 1}</div>
                    <div className="impl-phase-name">
                      {(s.phase || '').replace(/Phase \d+ — /, '')}
                    </div>
                    <div className="impl-dur-tag">{s.duration || ''}</div>
                  </div>
                  <ul className="impl-tasks">
                    {(s.tasks || []).map((task, j) => (
                      <li key={j}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="main-center">
          {/* Stats Row */}
          <div className="stat-row">
            <div className="stat-pill stat-cyan">
              <div className="stat-pill-val">{svcs.length}</div>
              <div className="stat-pill-key">Services</div>
            </div>
            <div className="stat-pill stat-gold">
              <div className="stat-pill-val">{cb.monthly_estimate || '—'}</div>
              <div className="stat-pill-key">Monthly Est.</div>
            </div>
            <div className="stat-pill stat-blue">
              <div className="stat-pill-val">
                {scaleMatch ? scaleMatch[0].replace('_', ' ').toUpperCase() : '—'}
              </div>
              <div className="stat-pill-key">Scale Tier</div>
            </div>
            <div className="stat-pill stat-mag">
              <div className="stat-pill-val">{steps.length}</div>
              <div className="stat-pill-key">Impl Phases</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'diagram' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagram')}
            >
              Architecture Diagram
            </button>
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              System Overview
            </button>
          </div>

          {/* Diagram Tab */}
          <div className={`tab-panel ${activeTab === 'diagram' ? 'active' : ''}`}>
            <div className="section-block" style={{ marginTop: 20 }}>
              <div className="diagram-wrap">
                <div className="diagram-toolbar">
                  <div className="dtag">
                    <span className="dot"></span>React Flow · Live Render · graph TD
                  </div>
                </div>
                {!rawVisible && (
                  <div key={activeTier} id="diagram-render">
                    <ArchitectureDiagram mermaidString={mermaidSrc} />
                  </div>
                )}
                {rawVisible && (
                  <pre id="raw-mermaid" style={{ display: 'block' }}>
                    {mermaidSrc}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          <div className={`tab-panel ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="section-block" style={{ marginTop: 20 }}>
              <div className="sec-label">Architecture Strategy</div>
              <div className="overview-card">
                <div className="overview-strategy">{ov.strategy || data.scale_analysis || '—'}</div>
                <div className="flows-grid">
                  {activeFlows.length > 0 ? activeFlows.map(f => {
                    const isAlone = activeFlows.length === 1;
                    return (
                      <div key={f.key} className={`flow-item ${f.cls}${isAlone ? ' full' : ''}`}>
                        <div className="flow-label">{f.label}</div>
                        <div className="flow-text">{ov[f.key]}</div>
                      </div>
                    );
                  }) : (
                    <div className="flow-item full read">
                      <div className="flow-label">Read Flow</div>
                      <div className="flow-text">{ov.read_flow || '—'}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="sec-label" style={{ marginTop: 24 }}>Scale Analysis</div>
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 18, fontSize: '.84rem',
                color: 'var(--muted2)', lineHeight: 1.75,
              }}>
                {data.scale_analysis || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="sidebar-right">
          <div className="sr-section">
            <div className="sr-label">Cost Estimate</div>
            <div>
              <div className="cost-total">{cb.monthly_estimate || '—'}</div>
              <div className="cost-sub">estimated / month</div>
              {perSvc.map((s, i) => {
                const v = parseCostNum(s.cost);
                const pct = Math.max(4, Math.min((v / maxCostNum) * 100, 100));
                return (
                  <div key={i} className="cost-row">
                    <div className="cost-name" title={s.service}>{s.service}</div>
                    <div className="cost-bar-wrap">
                      <div
                        className="cost-bar-fill"
                        style={{ width: '0%', background: COST_COLORS[i % COST_COLORS.length] }}
                        data-pct={pct}
                      ></div>
                    </div>
                    <div className="cost-val">{s.cost}</div>
                  </div>
                );
              })}
              {cb.cost_notes && (
                <div className="cost-note">💡 {cb.cost_notes}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
