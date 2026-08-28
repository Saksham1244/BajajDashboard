import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Cpu, Database, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/production/report';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const res = await login(username, password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickFill = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark flex flex-col justify-center items-center p-4 selection:bg-brand-primary selection:text-white">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Header with Logo */}
          <div className="bg-slate-50/80 p-6 border-b border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-52 mb-2 flex items-center justify-center">
              <img 
                src="/bajaj-logo.png" 
                alt="Bajaj Auto" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2 mt-1">
              Manufacturing Command Center
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Production Performance Management System (PPMS)
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(null); }}
                    placeholder="e.g. coolsuper, admin, or email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-brand-primary hover:bg-brand-secondary text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Command Center</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials for Fast Testing */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-brand-primary" /> Live Config_User Quick-Fill
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  MSSQL Connected
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickFill('coolsuper', '1234')}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-primary/5 hover:border-brand-primary text-left transition group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-brand-primary flex items-center justify-between">
                    <span>coolsuper</span>
                    <span className="text-[10px] font-normal text-slate-400">#1</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Role: Supervisor (1234)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', '12345')}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-primary/5 hover:border-brand-primary text-left transition group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-brand-primary flex items-center justify-between">
                    <span>admin</span>
                    <span className="text-[10px] font-normal text-slate-400">#2</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Role: Admin (12345)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('Rahul Sharma', 'Pass@123')}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-primary/5 hover:border-brand-primary text-left transition group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-brand-primary flex items-center justify-between">
                    <span>Rahul Sharma</span>
                    <span className="text-[10px] font-normal text-slate-400">#3</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Role: Operator (Pass@123)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('Priya Singh', 'Pass@123')}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-primary/5 hover:border-brand-primary text-left transition group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-brand-primary flex items-center justify-between">
                    <span>Priya Singh</span>
                    <span className="text-[10px] font-normal text-slate-400">#4</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Role: Quality (Pass@123)</div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <span>Bajaj Auto Pantnagar Plant</span>
          <span>•</span>
          <span>Database: PPMS_BajajPant</span>
          <span>•</span>
          <span>v2.0.0</span>
        </div>
      </div>
    </div>
  );
}
