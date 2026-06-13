import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Key, Plus, Trash2, Shield, User, Copy, Check, Eye, EyeOff } from '../components/Icons.jsx';

export default function UserProfilePage() {
  const { fetch, user } = useAuth();
  
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Storage for the single-time raw token returned after creation
  const [generatedRawToken, setGeneratedRawToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const loadApiKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/users/keys');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load keys');
      setKeys(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName) return;

    setCreating(true);
    setError('');
    setSuccess('');
    setGeneratedRawToken('');
    setCopied(false);
    try {
      const res = await fetch('/api/users/keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create key');

      setSuccess(`API Key "${newKeyName}" was generated successfully.`);
      setGeneratedRawToken(data.token); // Save the raw token to show
      setNewKeyName('');
      await loadApiKeys();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently revoke the API key "${name}"? Apps using it will immediately lose access.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/keys/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke key');

      setSuccess(`API key "${name}" was revoked.`);
      await loadApiKeys();
      // Clear generated token displays if it was revoked
      setGeneratedRawToken('');
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = () => {
    if (!generatedRawToken) return;
    navigator.clipboard.writeText(generatedRawToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Access Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Secure external deployments and integrations using client API keys</p>
      </div>

      {success && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-success)', background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '1rem' }}>
          {success}
        </div>
      )}

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-error)', background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Grid: Profile info / API keys list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        
        {/* User Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <User size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', justifyContent: 'center' }}>
              <Shield size={14} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                System {user?.role} Access
              </span>
            </div>
          </div>
        </div>

        {/* API Keys List and Creation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Generated raw token alert (shown only once) */}
          {generatedRawToken && (
            <div className="card animate-fade-in" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                ⚠️ Save your API Key now!
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                For security reasons, this key will only be displayed <strong>once</strong>. Copy and store it securely in a safe place. You will not be able to retrieve it again.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    type={showKey ? 'text' : 'password'} 
                    value={generatedRawToken} 
                    readOnly 
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem', paddingRight: '2.5rem', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)} 
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button 
                  onClick={copyToClipboard} 
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.75rem 1rem' }}
                >
                  {copied ? (
                    <>
                      <Check size={14} style={{ color: 'var(--text-primary)' }} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Key list */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active API Keys</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Client credentials authorized to communicate with system API endpoints</p>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <div className="spinner"></div>
              </div>
            ) : keys.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem' }}>
                No active API keys found. Register a key below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {keys.map((apiKey) => (
                  <div key={apiKey.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem 1rem', transition: 'var(--transition-smooth)' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{apiKey.name}</strong>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{apiKey.hint}</span>
                        <span>•</span>
                        <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRevokeKey(apiKey.id, apiKey.name)} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid transparent' }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                        e.target.style.background = 'var(--color-error-bg)';
                        e.target.style.color = 'var(--color-error)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'transparent';
                        e.target.style.background = 'var(--bg-tertiary)';
                        e.target.style.color = 'var(--text-primary)';
                      }}
                      title="Revoke Key"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Creation Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Generate a New API Key</h3>
            
            <form onSubmit={handleGenerateKey} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="key-name" style={{ fontSize: '0.8rem' }}>Key Label / Name</label>
                <input 
                  id="key-name" 
                  type="text" 
                  placeholder="e.g. Production CLI client" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '0.55rem 0.75rem' }}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', height: '40px' }}
                disabled={creating}
              >
                {creating ? <div className="spinner" style={{ width: '1.1rem', height: '1.1rem' }}></div> : (
                  <>
                    <Plus size={16} /> Generate Key
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
