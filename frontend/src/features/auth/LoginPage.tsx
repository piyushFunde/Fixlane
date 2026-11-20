import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      await login({ email: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError?.response?.status === 401) {
        setAuthError('Invalid email or password');
      } else {
        setAuthError(axiosError?.response?.data?.message || 'Failed to sign in. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bg">
      {/* Left Panel (Dark Ink) */}
      <div className="lg:col-span-5 bg-ink text-surface p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Top: Logo */}
        <div>
          <Link to="/" className="flex items-center gap-1 font-heading font-bold text-2xl tracking-tight text-white">
            <span>F</span>
            <span className="text-primary font-bold">|</span>
            <span className="text-xs uppercase tracking-widest text-muted font-sans font-medium ml-1">Fixlane</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="my-auto py-12 flex flex-col gap-8 max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Pick up where the board left off.
          </h1>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7BB6A5]">
              RECENT ON PAYMENTS API
            </span>
            <div className="mt-4 flex flex-col gap-4 border-l-2 border-border/20 pl-4">
              <div>
                <p className="text-sm font-medium text-white">
                  <span className="font-mono text-primary font-semibold mr-1.5">PAY-104</span>
                  moved to In Progress
                </p>
                <span className="text-xs text-muted">14 minutes ago by Sarah</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  <span className="font-mono text-primary font-semibold mr-1.5">PAY-98</span>
                  closed and deployed to staging
                </p>
                <span className="text-xs text-muted">1 hour ago by Dev One</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  <span className="font-mono text-primary font-semibold mr-1.5">PAY-112</span>
                  assigned to Alex Vance
                </p>
                <span className="text-xs text-muted">3 hours ago by Sarah</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stack line */}
        <div className="text-xs font-mono text-muted">
          Java 17 · Spring Boot · React
        </div>
      </div>

      {/* Right Panel (Light Form) */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-bold text-ink">Sign in</h2>
            <p className="text-sm text-muted mt-1">Use the email your admin invited.</p>
          </div>

          {authError && (
            <div role="alert" className="p-3.5 rounded-input bg-danger-tint border border-danger/30 text-danger text-sm font-medium animate-fade-up">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Work email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={`w-full min-h-[48px] px-3.5 py-2.5 bg-surface text-ink text-base rounded-input border transition-colors placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  errors.email ? 'border-danger focus:ring-danger' : 'border-input-border focus:border-primary'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-xs font-medium text-danger">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset: Please contact your workspace administrator.')}
                  className="text-xs font-medium text-primary hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full min-h-[48px] px-3.5 py-2.5 pr-12 bg-surface text-ink text-base rounded-input border transition-colors placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    errors.password ? 'border-danger focus:ring-danger' : 'border-input-border focus:border-primary'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ink px-1.5 py-1 focus:outline-none"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs font-medium text-danger">{errors.password.message}</span>
              )}
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary border-input-border accent-primary"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-ink select-none cursor-pointer">
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full min-h-[48px] mt-2 font-semibold"
              isLoading={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          <div className="text-center pt-2">
            <span className="text-sm text-muted">New to Fixlane? </span>
            <Link to="/register" className="text-sm font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
