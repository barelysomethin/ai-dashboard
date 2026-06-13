import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Search, Plus, Filter, Trash2, ExternalLink, X, PlusCircle } from '../components/Icons.jsx';

export default function ProjectListPage() {
  const { fetch, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [selectedEnv, setSelectedEnv] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProvider, setNewProvider] = useState('HuggingFace');
  const [newEnv, setNewEnv] = useState('Staging');
  const [formLoading, setFormLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newName || !newDesc) return;

    setFormLoading(true);
    setError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          modelProvider: newProvider,
          environment: newEnv
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      setSuccessMsg(`Project "${newName}" registered. Initializing deployment...`);
      setNewName('');
      setNewDesc('');
      setNewProvider('HuggingFace');
      setNewEnv('Staging');
      setModalOpen(false);
      
      // Reload list immediately
      await loadProjects();
      
      // Auto dismiss success notification
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the project "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete project');

      setSuccessMsg(`Project "${name}" was deleted successfully.`);
      await loadProjects();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter projects client-side
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'All' || p.modelProvider === selectedProvider;
    const matchesEnv = selectedEnv === 'All' || p.environment === selectedEnv;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesProvider && matchesEnv && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>AI Projects Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deploy and configure individual model containers</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> New AI Model
        </button>
      </div>

      {successMsg && (
        <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--color-success)', background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '1rem' }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--color-error)', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filters Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filter by:</span>
          </div>

          <div>
            <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} style={{ padding: '0.5rem 1rem' }}>
              <option value="All">All Providers</option>
              <option value="HuggingFace">Hugging Face</option>
              <option value="Replicate">Replicate</option>
              <option value="Ollama">Ollama</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Custom">Custom Engine</option>
            </select>
          </div>

          <div>
            <select value={selectedEnv} onChange={(e) => setSelectedEnv(e.target.value)} style={{ padding: '0.5rem 1rem' }}>
              <option value="All">All Environments</option>
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
            </select>
          </div>

          <div>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: '0.5rem 1rem' }}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Deploying">Deploying</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

      </div>

      {/* Projects Grid List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card animate-fade-in" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 2rem' }}>
          No models matched your search criteria. Select "New AI Model" to launch one.
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {filteredProjects.map((project) => {
            const latestDeploy = project.deployments && project.deployments[0];
            return (
              <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${
                        project.status === 'Active' ? 'badge-success' :
                        project.status === 'Deploying' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {project.status}
                      </span>
                      <span className="badge badge-info">{project.environment}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{project.modelProvider}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{project.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {project.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  
                  {/* Resources / Version row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Active Version: <strong style={{ color: 'var(--text-primary)' }}>{latestDeploy ? latestDeploy.version : 'None'}</strong></span>
                    <span>Commit: <strong style={{ color: 'var(--text-primary)' }}>{latestDeploy ? latestDeploy.commitHash : 'N/A'}</strong></span>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <button 
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      Inspect Logs <ExternalLink size={14} />
                    </button>

                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="btn btn-danger" 
                        style={{ padding: '0.45rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Creation Glassmorphism Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(4px)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Deploy New Model Instance</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label htmlFor="proj-name">Model / Project Name</label>
                <input 
                  id="proj-name" 
                  type="text" 
                  placeholder="e.g. Llama 3 70B Quantized" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label htmlFor="proj-desc">Description</label>
                <textarea 
                  id="proj-desc" 
                  placeholder="Provide details of model configuration or cluster tasks..." 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ height: '80px', resize: 'vertical' }}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="proj-provider">Model Provider</label>
                  <select id="proj-provider" value={newProvider} onChange={(e) => setNewProvider(e.target.value)}>
                    <option value="HuggingFace">Hugging Face</option>
                    <option value="Replicate">Replicate</option>
                    <option value="Ollama">Ollama</option>
                    <option value="OpenAI">OpenAI</option>
                    <option value="Custom">Custom Engine</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="proj-env">Target Environment</label>
                  <select id="proj-env" value={newEnv} onChange={(e) => setNewEnv(e.target.value)}>
                    <option value="Staging">Staging</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {formLoading ? <div className="spinner" style={{ width: '1.2rem', height: '1.2rem' }}></div> : (
                    <>
                      <PlusCircle size={16} /> Deploy Now
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
