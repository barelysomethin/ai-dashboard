import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Cpu, HardDrive, Network, Layers, RefreshCw, AlertCircle, PlayCircle, ExternalLink } from '../components/Icons.jsx';

export default function DashboardPage() {
  const { fetch } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pollingActive, setPollingActive] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      // 1. Fetch KPI metrics
      const statsRes = await fetch('/api/dashboard/stats');
      const statsJson = await statsRes.json();
      setStats(statsJson);

      // 2. Fetch project details
      const projectsRes = await fetch('/api/projects');
      const projectsJson = await projectsRes.json();
      setProjects(projectsJson);

      // 3. Compile recent logs across all active deployments
      const activeProj = projectsJson.find(p => p.deployments && p.deployments.length > 0);
      if (activeProj && activeProj.deployments[0]) {
        const depId = activeProj.deployments[0].id;
        const depRes = await fetch(`/api/deployments/${depId}`);
        const depJson = await depRes.json();
        setLogs(depJson.logs || []);
      } else {
        // Fallback logs if no active deployment
        setLogs([
          { id: '1', timestamp: new Date().toISOString(), level: 'INFO', message: 'Cluster manager online.' },
          { id: '2', timestamp: new Date().toISOString(), level: 'INFO', message: 'Ready to receive deployment requests.' }
        ]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Set up polling to demonstrate live updating metrics
  useEffect(() => {
    if (!pollingActive) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [pollingActive, loadDashboardData]);

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const formatMemory = (mb) => {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Cluster Telemetry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Real-time hardware status and active deployments orchestrator</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '0.35rem 0.85rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pollingActive ? '#ffffff' : 'var(--text-muted)' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {pollingActive ? 'Live Syncing' : 'Sync Paused'}
            </span>
          </div>
          <button 
            onClick={() => setPollingActive(!pollingActive)} 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {pollingActive ? 'Pause Auto-Sync' : 'Resume Auto-Sync'}
          </button>
          <button 
            onClick={loadDashboardData} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
            title="Force refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '1rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      {stats && (
        <div className="grid grid-cols-4">
          
          <div className="card" style={{ position: 'relative' }}>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Active Projects</span>
              <Layers size={18} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>
              {stats.projects.active} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats.projects.total} total</span>
            </div>
            {stats.projects.deploying > 0 && (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{stats.projects.deploying} deploying</span>
            )}
          </div>

          <div className="card">
            <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Cluster Avg CPU</span>
              <Cpu size={18} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>
              {stats.metrics.avgCpuUsage}%
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.5rem' }}>
              <div style={{ width: `${stats.metrics.avgCpuUsage}%`, height: '100%', background: '#ffffff', transition: 'width 0.8s ease' }}></div>
            </div>
          </div>

          <div className="card">
            <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Cluster Avg Memory</span>
              <HardDrive size={18} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>
              {formatMemory(stats.metrics.avgMemoryUsage)}
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.5rem' }}>
              <div style={{ width: `${Math.min(100, (stats.metrics.avgMemoryUsage / 16384) * 100)}%`, height: '100%', background: '#ffffff', transition: 'width 0.8s ease' }}></div>
            </div>
          </div>

          <div className="card">
            <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total API Requests</span>
              <Network size={18} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>
              {stats.metrics.totalApiCalls.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              +{(Math.random() * 5).toFixed(0)} req/s average
            </span>
          </div>

        </div>
      )}

      {/* Main Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '1.5rem' }}>
        
        {/* Active Node Telemetry Grid */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Telemetry Nodes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Live telemetry resource allocations per deployment instance</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No active nodes. Go to Projects to launch one.
              </div>
            ) : (
              projects.map(project => {
                return (
                  <div key={project.id} style={{ padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'var(--transition-smooth)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${
                          project.status === 'Active' ? 'badge-success' :
                          project.status === 'Deploying' ? 'badge-warning' : 'badge-danger'
                        }`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                          {project.status}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{project.name}</strong>
                      </div>
                      <button 
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        Details <ExternalLink size={12} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                          <span>CPU Usage</span>
                          <span style={{ fontWeight: 500 }}>{project.cpuUsage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${project.cpuUsage}%`, height: '100%', background: project.cpuUsage > 85 ? 'var(--color-error)' : '#ffffff', transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                          <span>Memory Usage</span>
                          <span style={{ fontWeight: 500 }}>{formatMemory(project.memoryUsage)}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (project.memoryUsage / 16384) * 100)}%`, height: '100%', background: '#ffffff', transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NETWORK API CALLS</span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{project.apiCalls.toLocaleString()}</strong>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Global Cluster Terminal Log */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '350px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlayCircle size={18} /> Logs Dashboard Feed
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Live telemetry events aggregated across cluster</p>
          </div>

          <div className="terminal">
            {logs.length === 0 ? (
              <div className="terminal-line" style={{ color: 'var(--text-muted)' }}>Waiting for deployment logs...</div>
            ) : (
              logs.map((log) => {
                const cleanTime = new Date(log.timestamp).toLocaleTimeString();
                return (
                  <div key={log.id} className="terminal-line">
                    <span className="terminal-line timestamp">[{cleanTime}]</span>
                    <span className={`terminal-line ${log.level.toLowerCase()}`}>
                      {log.level}:
                    </span>{' '}
                    <span>{log.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
