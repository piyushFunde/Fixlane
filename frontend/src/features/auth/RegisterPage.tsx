import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['DEVELOPER', 'MANAGER', 'ADMIN']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'DEVELOPER' | 'MANAGER' | 'ADMIN'>('DEVELOPER');
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'DEVELOPER',
    },
  });

  const passwordValue = watch('password') || '';
  const isPasswordLongEnough = passwordValue.length >= 8;

  const handleRoleSelect = (role: 'DEVELOPER' | 'MANAGER' | 'ADMIN') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setAuthError(null);
    try {
      await registerAuth({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setAuthError(axiosError?.response?.data?.message || 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bg">
      {/* Left Panel (Dark Ink) */}
      <div className="lg:col-span-5 bg-ink text-surface p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative">
        <div>
          <Link to="/" className="flex items-center gap-1 font-heading font-bold text-2xl tracking-tight text-white">
            <span>F</span>
            <span className="text-primary font-bold">|</span>
            <span className="text-xs uppercase tracking-widest text-muted font-sans font-medium ml-1">Fixlane</span>
          </Link>
        </div>

        <div className="my-auto py-12 flex flex-col gap-10 max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Set up a board for your team.
          </h1>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-white/10 text-[#7BB6A5]">01</span>
              <div>
                <h4 className="text-sm font-semibold text-white">Create your account</h4>
                <p className="text-xs text-muted mt-0.5">Name, email and a password. Your token is issued when you sign in.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-white/10 text-[#7BB6A5]">02</span>
              <div>
                <h4 className="text-sm font-semibold text-white">Start a project</h4>
                <p className="text-xs text-muted mt-0.5">Give it a name and a short key such as PAY. Tickets are numbered from that key.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-white/10 text-[#7BB6A5]">03</span>
              <div>
                <h4 className="text-sm font-semibold text-white">Add your team</h4>
                <p className="text-xs text-muted mt-0.5">Invite developers and managers, then assign the first tickets.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-muted">
          Java 17 · Spring Boot · React
        </div>
      </div>

      {/* Right Panel (Registration Form) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-bold text-ink">Create your account</h2>
            <Link to="/login" className="text-xs font-medium text-primary hover:underline">
              Already have one? Sign in
            </Link>
          </div>

          {authError && (
            <div role="alert" className="p-3.5 rounded-input bg-danger-tint border border-danger/30 text-danger text-sm font-medium animate-fade-up">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Sarah Connor"
                className={`w-full min-h-[48px] px-3.5 py-2.5 bg-surface text-ink text-base rounded-input border transition-colors placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  errors.fullName ? 'border-danger focus:ring-danger' : 'border-input-border focus:border-primary'
                }`}
                {...register('fullName')}
              />
              {errors.fullName && (
                <span className="text-xs font-medium text-danger">{errors.fullName.message}</span>
              )}
            </div>

            {/* Work email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="sarah@skynet.com"
                className={`w-full min-h-[48px] px-3.5 py-2.5 bg-surface text-ink text-base rounded-input border transition-colors placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  errors.email ? 'border-danger focus:ring-danger' : 'border-input-border focus:border-primary'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-xs font-medium text-danger">{errors.email.message}</span>
              )}
            </div>

            {/* Password with live rule */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={`w-full min-h-[48px] px-3.5 py-2.5 bg-surface text-ink text-base rounded-input border transition-colors placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  errors.password ? 'border-danger focus:ring-danger' : 'border-input-border focus:border-primary'
                }`}
                {...register('password')}
              />
              <div className="flex items-center gap-1.5 mt-0.5">
                {isPasswordLongEnough ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Long enough
                  </span>
                ) : (
                  <span className="text-xs text-muted">Minimum 8 characters</span>
                )}
              </div>
              {errors.password && (
                <span className="text-xs font-medium text-danger">{errors.password.message}</span>
              )}
            </div>

            {/* Role selector: 3 cards */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-sm font-medium text-ink">Your role</span>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Developer */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('DEVELOPER')}
                  className={`p-3 rounded-card text-left border transition-all flex flex-col justify-between ${
                    selectedRole === 'DEVELOPER'
                      ? 'border-primary bg-primary-tint/30 ring-2 ring-primary ring-offset-1'
                      : 'border-border bg-surface hover:border-input-border'
                  }`}
                >
                  <span className="text-sm font-bold text-ink">Developer</span>
                  <span className="text-[11px] text-muted mt-1 leading-tight">Works tickets and comments</span>
                </button>

                {/* Manager */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('MANAGER')}
                  className={`p-3 rounded-card text-left border transition-all flex flex-col justify-between ${
                    selectedRole === 'MANAGER'
                      ? 'border-primary bg-primary-tint/30 ring-2 ring-primary ring-offset-1'
                      : 'border-border bg-surface hover:border-input-border'
                  }`}
                >
                  <span className="text-sm font-bold text-ink">Manager</span>
                  <span className="text-[11px] text-muted mt-1 leading-tight">Runs projects and teams</span>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`p-3 rounded-card text-left border transition-all flex flex-col justify-between ${
                    selectedRole === 'ADMIN'
                      ? 'border-primary bg-primary-tint/30 ring-2 ring-primary ring-offset-1'
                      : 'border-border bg-surface hover:border-input-border'
                  }`}
                >
                  <span className="text-sm font-bold text-ink">Admin</span>
                  <span className="text-[11px] text-muted mt-1 leading-tight">Controls roles and access</span>
                </button>
              </div>
              <span className="text-xs text-muted italic">An admin can change your role later.</span>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full min-h-[48px] mt-2 font-semibold"
              isLoading={isSubmitting}
            >
              Create account
            </Button>

            <p className="text-center text-xs text-muted">
              By registering, you agree to Fixlane's Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
