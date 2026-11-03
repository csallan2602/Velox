import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { 
  Bike, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  KeyRound
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onCancel: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState<string>('allan.singh@example.com');
  const [password, setPassword] = useState<string>('pass123');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'customer' | 'operator'>('customer');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Status
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickFill = (demoEmail: string, demoPass: string, demoRole: 'customer' | 'operator') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('login');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { user, token } = await api.login({ email, password });
        onLoginSuccess(user, token);
      } else {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        const { user, token } = await api.register({
          name,
          email,
          password,
          phone,
          role
        });
        onLoginSuccess(user, token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-xl border border-base-200/90 overflow-hidden">
        
        {/* Top Header Card */}
        <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            {mode === 'login' ? 'Welcome to Velox' : 'Create an Account'}
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Sign in to access your bicycle bookings, active ride PINs, or operator controls.'
              : 'Join the zero-emission cycling community across city docking hubs.'}
          </p>

          {/* Tab Switcher inside Header */}
          <div className="flex items-center justify-center gap-2 mt-5 p-1 bg-black/20 rounded-xl max-w-xs mx-auto backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Demo Fast-Login Section */}
        <div className="px-6 pt-4 pb-1 bg-base-200/50 border-b border-base-200">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-base-content/50 block mb-2">
            One-Click Demo Credentials
          </span>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => handleQuickFill('allan.singh@example.com', 'pass123', 'customer')}
              className="btn btn-xs btn-outline btn-success text-[11px] gap-1 font-mono"
            >
              <UserIcon className="w-3 h-3" />
              <span>Customer (Allan S.)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('operator@velox.com', 'admin123', 'operator')}
              className="btn btn-xs btn-outline btn-info text-[11px] gap-1 font-mono"
            >
              <Shield className="w-3 h-3" />
              <span>Operator (Staff)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('priya.s@example.com', 'pass123', 'customer')}
              className="btn btn-xs btn-outline text-[11px] gap-1 font-mono text-base-content/70"
            >
              <UserIcon className="w-3 h-3" />
              <span>Student (Priya)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Extra Registration Fields */}
          {mode === 'register' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-base-content/80">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Allan Singh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-sm input-bordered w-full pl-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input input-sm input-bordered w-full pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Account Type</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="select select-sm select-bordered w-full text-xs"
                  >
                    <option value="customer">Customer / Rider</option>
                    <option value="operator">Station Operator</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-base-content/80">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                type="email"
                placeholder="allan.singh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-base-content/80">Password</label>
              {mode === 'login' && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Default: pass123
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 pr-9 text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-base-content/40 hover:text-base-content"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-base-content/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox checkbox-xs checkbox-success"
              />
              <span>Remember this session</span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-white w-full shadow-md shadow-emerald-500/20 text-xs font-bold gap-2"
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Cancel button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-base-content/50 hover:text-base-content transition-colors"
            >
              Return to Previous Page
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
