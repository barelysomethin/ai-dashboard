import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Terminal as TerminalIcon, Play, Plus, Trash2, Cpu, HardDrive, RefreshCw, Clock, ArrowLeft } from '../components/Icons.jsx';

export default function DeploymentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetch, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeploying, setRedeploying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Local state for env vars mockup
  const [envVars, setEnvVars] = useState([
    { key: 'MODEL_ID', value: 'meta-llama/Meta-Llama-3-8B-Instruct' },
    { key: 'HF_TOKEN', value: 'hf_••••••••••••••••••••••••' },
    { key: 'MAX_NEW_TOKENS', value: '512' },
    { key: 'TEMPERATURE', value: '0.7' }
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const terminalEndRef = useRef(null);

  // Fetch project and deployment list
  const loadProjectDetails = useCallback(async (selectLatest = false) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load project');

      setProject(data);
      setDeployments(data.deployments || []);
      
      if (data.deployments && data.deployments.length > 0) {
        // Automatically select the top (latest) deployment if we are initializing or explicitly requested
        if (selectLatest || !selectedDeployment) {
          setSelectedDeployment(data.deployments[0]);
        } else {
          // Keep selection synchronized with updated data
          const updatedSelect = data.deployments.find(d => d.id === selectedDeployment.id);
          if (updatedSelect) {
            setSelectedDeployment(updatedSelect);
          }
        }
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, fetch, selectedDeployment]);

  // Fetch logs of the selected deployment
  const loadDeploymentLogs = useCallback(async () => {
    if (!selectedDeployment) return;
    try {
      const res = await fetch(`/api/deployments/${selectedDeployment.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load logs');
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    }
  }, [selectedDeployment, fetch]);

  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  useEffect(() => {
    loadDeploymentLogs();
  }, [loadDeploymentLogs]);

  // Set up polling while the selected deployment is actively deploying
  useEffect(() => {
    if (!selectedDeployment || selectedDeployment.status !== 'Deploying') return;

    const interval = setInterval(() => {
      loadProjectDetails();
      loadDeploymentLogs();
    }, 1500); // Poll fast for logs

    return () => clearInterval(interval);
  }, [selectedDeployment, loadProjectDetails, loadDeploymentLogs]);

  // Scroll to bottom of terminal when logs update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleTriggerRedeploy = async () => {
    if (!isAdmin) return;
    setRedeploying(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/deployments/${id}/redeploy`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger redeployment');
      
      setSuccess(`Deployment ${data.version} has been queued successfully.`);
      setSelectedDeployment(data);
      // Reload project details
      await loadProjectDetails(true);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRedeploying(false);
    }
  };

  const handleAddEnv = (e) => {
    e.preventDefault();
    if (!newKey || !newValue) return;
    if (envVars.some(ev => ev.key === newKey.toUpperCase())) {
      return alert('Environment key already exists.');
    }
    setEnvVars([...envVars, { key: newKey.toUpperCase(), value: newValue }]);
    setNewKey('');
    setNewValue('');
  };

  const handleRemoveEnv = (key) => {
    setEnvVars(envVars.filter(ev => ev.key !== key));
  };

  if (loading && !project) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        Project not found.
      </div>
    );
  }

  const activeDeploy = deployments[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/projects')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{project.name}</h2>
              <span className="badge badge-info">{project.environment}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deployments inspector & live container configurations</p>
          </div>
        </div>

        {/* Redeploy Button */}
        <div>
          {isAdmin ? (
            <button 
              onClick={handleTriggerRedeploy} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={redeploying || (activeDeploy && activeDeploy.status === 'Deploying')}
            >
              {redeploying || (activeDeploy && activeDeploy.status === 'Deploying') ? (
                <>
                  <RefreshCw size={14} className="spinner" />
                  Running Build...
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" stroke="currentColor" /> Redeploy Code
                </>
              )}
            </button>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <RefreshCw size={12} /> Redeployment restricted to Administrators
            </div>
          )}
        </div>
      </div>

      {success && (
        <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--color-success)', background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '1rem' }}>
          {success}
        </div>
      )}

      {error && (
        <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--color-error)', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4">
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>TELEMETRY STATUS</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: project.status === 'Active' ? 'var(--color-success)' : project.status === 'Deploying' ? 'var(--color-warning)' : 'var(--color-error)', marginTop: '0.25rem' }}>
            {project.status}
          </div>
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>CPU ALLOCATION</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={16} />
            {project.cpuUsage}%
          </div>
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>MEMORY ALLOCATION</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HardDrive size={16} />
            {project.memoryUsage >= 1024 ? `${(project.memoryUsage / 1024).toFixed(1)} GB` : `${project.memoryUsage} MB`}
          </div>
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>TOTAL NETWORK HITS</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
            {project.apiCalls.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline / Right Console logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        
        {/* Left Col: Deployment Timeline and Env Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* History */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Deployment History</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Timeline of system repository compilations</p>
            </div>

            {deployments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No builds registered yet.</div>
            ) : (
              <div className="timeline">
                {deployments.map((deploy) => {
                  const isSelected = selectedDeployment && selectedDeployment.id === deploy.id;
                  const dateLabel = new Date(deploy.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div 
                      key={deploy.id} 
                      className={`timeline-item ${deploy.status}`}
                      onClick={() => setSelectedDeployment(deploy)}
                      style={{ 
                        cursor: 'pointer',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                        border: isSelected ? '1px solid var(--border-color)' : '1px solid transparent',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {deploy.version}
                        </strong>
                        <span className={`badge ${
                          deploy.status === 'Success' ? 'badge-success' :
                          deploy.status === 'Deploying' ? 'badge-warning' : 'badge-danger'
                        }`} style={{ padding: '0.1rem 0.35rem', fontSize: '0.6rem' }}>
                          {deploy.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {dateLabel}</span>
                        <span>SHA: {deploy.commitHash}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Environment Variables Editor */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Environment Variables</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Set configurations injected into container runtime</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* Variable Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {envVars.map((env) => (
                  <div key={env.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{env.key}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{env.value}</span>
                      <button 
                        onClick={() => handleRemoveEnv(env.key)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--color-error)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                        title="Remove variable"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <form onSubmit={handleAddEnv} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 0.4fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="KEY" 
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="VALUE" 
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }} 
                  required 
                />
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Add variable"
                >
                  <Plus size={14} />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Right Col: Console terminal */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '450px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TerminalIcon size={18} /> Live Deployment Logs
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Displaying terminal feed for active version: <strong>{selectedDeployment ? selectedDeployment.version : 'None'}</strong>
              </p>
            </div>
            
            <button 
              onClick={loadDeploymentLogs} 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              disabled={!selectedDeployment}
            >
              <RefreshCw size={12} /> Reload Logs
            </button>
          </div>

          <div className="terminal" style={{ flex: 1, minHeight: '380px' }}>
            {logs.length === 0 ? (
              <div className="terminal-line" style={{ color: 'var(--text-muted)' }}>
                {selectedDeployment?.status === 'Deploying' 
                  ? 'Compiling workspace and loading dependencies...' 
                  : 'No logs recorded for this build.'}
              </div>
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
            
            {/* Target element to auto scroll */}
            <div ref={terminalEndRef} />
          </div>

        </div>

      </div>

    </div>
  );
}
