
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

type LoginType = 'admin' | 'external';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    // Simulate API call
    setTimeout(() => {
      if (loginType === 'admin') {
        if (email === 'error404smj@gmail.com' && password === 'Admin@123') {
          setSuccessMsg(`Access log and security alert dispatched to ${email}`);
          setTimeout(() => onLogin(email), 1800);
        } else {
          setError('Invalid credentials for Internal Admin access.');
          setIsLoading(false);
        }
      } else {
        if (email) {
          setSuccessMsg(`Session established. Verification sent to ${email}`);
          setTimeout(() => onLogin(email), 1800);
        } else {
          setError('Please provide a valid business email.');
          setIsLoading(false);
        }
      }
    }, 1200);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setSuccessMsg(null);
    setTimeout(() => {
      const guestEmail = 'guest@external.io';
      setSuccessMsg(`Guest access trace sent to security monitor.`);
      setTimeout(() => onLogin(guestEmail), 1500);
    }, 800);
  };

  return (
    <div className="login-gradient-bg min-vh-100 d-flex align-items-center justify-content-center p-3 overflow-hidden">
      <div className="w-100" style={{ maxWidth: '420px' }}>
        <div className="card glass-card border-0 p-4 p-md-5 animate-in fade-in zoom-in shadow-2xl">
          
          {/* Tabs Container */}
          <div className="d-flex justify-content-center mb-4">
            <div className="bg-black bg-opacity-60 p-1 rounded-pill d-flex border border-white border-opacity-10">
              <div 
                onClick={() => !isLoading && !successMsg && setLoginType('admin')}
                className={`login-tab-pill d-flex align-items-center gap-2 px-3 py-2 ${loginType === 'admin' ? 'active' : ''}`}
                style={{ fontSize: '0.7rem' }}
              >
                <ShieldCheck size={14} /> Admin
              </div>
              <div 
                onClick={() => !isLoading && !successMsg && setLoginType('external')}
                className={`login-tab-pill d-flex align-items-center gap-2 px-3 py-2 ${loginType === 'external' ? 'active' : ''}`}
                style={{ fontSize: '0.7rem' }}
              >
                <Globe size={14} /> External
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-4 text-white mb-3 shadow-lg" style={{ width: '48px', height: '48px' }}>
              <Sparkles size={24} />
            </div>
            <h1 className="h4 fw-black text-white mb-1 tracking-tighter italic">
              ERROR404 NOTES
            </h1>
            <p className="text-muted small opacity-50 uppercase tracking-widest fw-bold mb-0" style={{ fontSize: '0.6rem' }}>
              {loginType === 'admin' ? 'Internal Access Only' : 'Collaborator Access'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger d-flex align-items-center gap-2 rounded-4 py-2 px-3 mb-4 animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              <span className="small fw-bold" style={{ fontSize: '0.75rem' }}>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success bg-success bg-opacity-10 border-success border-opacity-25 text-success d-flex align-items-center gap-2 rounded-4 py-2 px-3 mb-4 animate-in slide-in-from-top-2">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span className="small fw-bold" style={{ fontSize: '0.75rem' }}>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="text-muted small fw-black text-uppercase tracking-widest mb-2 opacity-50" style={{fontSize: '0.55rem'}}>Identification</label>
              <div className="input-group">
                <span className="input-group-text border-0 bg-black bg-opacity-40 text-white text-opacity-30 px-3 rounded-start-4">
                  <Mail size={16} />
                </span>
                <input
                  required
                  disabled={isLoading || !!successMsg}
                  type="email"
                  className="form-control form-control-custom rounded-end-4 border-0 py-2 text-white bg-black bg-opacity-20"
                  placeholder="Email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {loginType === 'admin' && (
              <div className="form-group mb-4">
                <label className="text-muted small fw-black text-uppercase tracking-widest mb-2 opacity-50" style={{fontSize: '0.55rem'}}>Security Key</label>
                <div className="input-group">
                  <span className="input-group-text border-0 bg-black bg-opacity-40 text-white text-opacity-30 px-3 rounded-start-4">
                    <Lock size={16} />
                  </span>
                  <input
                    required
                    disabled={isLoading || !!successMsg}
                    type="password"
                    className="form-control form-control-custom rounded-end-4 border-0 py-2 text-white bg-black bg-opacity-20"
                    placeholder="Access code..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}

            <button
              disabled={isLoading || !!successMsg}
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-pill fw-black text-uppercase shadow-lg d-flex align-items-center justify-content-center gap-2 mb-3 hover:scale-[1.01] transition-all"
            >
              {isLoading && !successMsg ? (
                <div className="spinner-border spinner-border-sm" role="status" />
              ) : successMsg ? (
                <CheckCircle2 size={16} />
              ) : (
                <>
                  <span style={{ fontSize: '0.85rem' }}>Establish Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {loginType === 'external' && !successMsg && (
              <div className="text-center mt-2">
                <button
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  type="button"
                  className="btn btn-link p-0 text-white text-opacity-40 text-decoration-none small fw-bold hover:text-white transition-colors"
                  style={{ fontSize: '0.75rem' }}
                >
                  Join as Anonymous Guest
                </button>
              </div>
            )}
          </form>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-muted small opacity-30 tracking-widest text-uppercase fw-bold" style={{ fontSize: '0.55rem' }}>
            Powered by Error404 &copy; 2025
          </p>
        </div>
      </div>
    </div>
  );
};
