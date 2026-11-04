import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, BookOpen, AlertCircle, CheckCircle2, Loader2, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Role = 'employee' | 'admin';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState<Role>('employee');
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = 'Full name is required';
    if (!form.username.trim()) errors.username = 'Username is required';
    else if (form.username.length < 3) errors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errors.username = 'Username can only contain letters, numbers, underscores';

    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email';

    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (role === 'admin' && !form.adminCode.trim()) {
      errors.adminCode = 'Admin code is required for admin registration';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role,
        adminCode: role === 'admin' ? form.adminCode : undefined,
      });
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    id, label, type = 'text', value, placeholder, onChange, error: fieldError, autoComplete,
    rightElement,
  }: {
    id: string; label: string; type?: string; value: string; placeholder: string;
    onChange: (v: string) => void; error?: string; autoComplete?: string;
    rightElement?: React.ReactNode;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input-field ${rightElement ? 'pr-12' : ''} ${fieldError ? 'input-field-error' : ''}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {fieldError && (
        <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {fieldError}
        </p>
      )}
    </div>
  );

  const EyeButton = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      className="text-slate-400 hover:text-slate-600 transition-colors p-1"
    >
      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-5/12 auth-bg flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">CEA Exam Portal</span>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-black leading-tight">
            Start Your<br />
            <span className="text-blue-200">Journey</span><br />
            Today
          </h1>
          <p className="text-blue-100 text-lg">
            Create a free account and begin practicing for the Maharashtra PWD Civil Engineering Assistant departmental exam.
          </p>
          <div className="space-y-3 pt-4">
            {[
              'Access 500+ verified exam questions',
              'Track your progress over time',
              'Practice any time, anywhere',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} CEA Exam Portal.
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">CEA Exam Portal</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create account</h2>
              <p className="text-slate-500 mt-1">Fill in the details below to get started</p>
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">I am registering as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    role === 'employee'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <User className="w-6 h-6" />
                  <span className="font-semibold text-sm">Employee</span>
                  <span className="text-xs text-center opacity-70">Take exams & track progress</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    role === 'admin'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Shield className="w-6 h-6" />
                  <span className="font-semibold text-sm">Admin</span>
                  <span className="text-xs text-center opacity-70">Manage questions & portal</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="name"
                  label="Full Name"
                  value={form.name}
                  placeholder="e.g. Rahul Sharma"
                  onChange={(v) => update('name', v)}
                  error={fieldErrors.name}
                  autoComplete="name"
                />
                <InputField
                  id="username"
                  label="Username"
                  value={form.username}
                  placeholder="e.g. rahul_sharma"
                  onChange={(v) => update('username', v)}
                  error={fieldErrors.username}
                  autoComplete="username"
                />
              </div>

              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                placeholder="e.g. rahul@example.com"
                onChange={(v) => update('email', v)}
                error={fieldErrors.email}
                autoComplete="email"
              />

              <InputField
                id="phone"
                label="Phone Number (optional)"
                type="tel"
                value={form.phone}
                placeholder="e.g. 9876543210"
                onChange={(v) => update('phone', v)}
                autoComplete="tel"
              />

              <InputField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                placeholder="At least 6 characters"
                onChange={(v) => update('password', v)}
                error={fieldErrors.password}
                autoComplete="new-password"
                rightElement={<EyeButton show={showPassword} toggle={() => setShowPassword(!showPassword)} />}
              />

              <InputField
                id="confirmPassword"
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                placeholder="Re-enter your password"
                onChange={(v) => update('confirmPassword', v)}
                error={fieldErrors.confirmPassword}
                autoComplete="new-password"
                rightElement={<EyeButton show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />}
              />

              {role === 'admin' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <label htmlFor="adminCode" className="block text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin Secret Code
                  </label>
                  <div className="relative">
                    <input
                      id="adminCode"
                      type={showAdminCode ? 'text' : 'password'}
                      value={form.adminCode}
                      onChange={(e) => update('adminCode', e.target.value)}
                      placeholder="Enter the admin secret code"
                      className={`input-field pr-12 ${fieldErrors.adminCode ? 'input-field-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminCode(!showAdminCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showAdminCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.adminCode && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{fieldErrors.adminCode}</p>
                  )}
                  <p className="mt-2 text-xs text-amber-600">Contact your system administrator for the admin code.</p>
                </div>
              )}

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
