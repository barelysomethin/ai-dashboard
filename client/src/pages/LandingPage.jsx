import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Cpu, Server, Play } from '../components/Icons.jsx';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      <header style={{ height: '64px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
            <Server size={20} />
            <span>AI DASHBOARD</span>
          </div>
          <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Sign In
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '5rem' }}>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', letterSpacing: '-0.04em', background: 'linear-gradient(to bottom, #ffffff 60%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Deploy & Monitor AI Models Instantly
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            A premium full-stack orchestrator for loading, scaling, and managing machine learning weights. Trace real-time logs, verify CPU/memory loads, and secure APIs with role-based policies.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.9rem' }}>
              Launch Console <Play size={14} fill="currentColor" stroke="currentColor" />
            </button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.9rem' }}>
              View Github Repository
            </a>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="container">
          <div className="grid grid-cols-3">
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '40px', height: '40px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Real-time Log Streams</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Track model compilations and weights downloads directly within interactive logs terminal.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '40px', height: '40px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Role-Based Access</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Admins hold full control over key revocations and project deployments, while Developers retain read access.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.75rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '40px', height: '40px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hardware Monitoring</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Observe CPU and GPU memory loads directly on live telemetry widgets updating in near-real-time.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>© {new Date().getFullYear()} AI Dashboard. All rights reserved. Built for technical assessment.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>SQLite 3</span>
            <span style={{ color: 'var(--text-muted)' }}>Prisma ORM</span>
            <span style={{ color: 'var(--text-muted)' }}>Docker Compose</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
