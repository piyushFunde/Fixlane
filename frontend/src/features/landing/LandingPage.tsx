import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const animatedRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !animatedRefs.current.includes(el)) {
      animatedRefs.current.push(el);
    }
  };

  const sampleCards = {
    todo: [
      { key: 'PAY-104', title: 'Implement Stripe webhook signature verification', priority: 'high' as const, user: 'Dev One', id: '1' },
      { key: 'PAY-108', title: 'Add retry exponential backoff for failed card charges', priority: 'medium' as const, user: 'Sarah Connor', id: '2' },
      { key: 'PAY-112', title: 'Update invoice generation tax bracket logic', priority: 'low' as const, user: 'Alex Vance', id: '3' },
    ],
    inProgress: [
      { key: 'PAY-98', title: 'Migrate card token storage to encrypted KMS vault', priority: 'high' as const, user: 'Sarah Connor', id: '2' },
      { key: 'PAY-101', title: 'Add idempotency key header support to checkout API', priority: 'medium' as const, user: 'Dev One', id: '1' },
    ],
    done: [
      { key: 'PAY-92', title: 'Configure audit log streaming to CloudWatch', priority: 'medium' as const, user: 'Alex Vance', id: '3' },
      { key: 'PAY-89', title: 'Set up Spring Security JWT rotation endpoints', priority: 'high' as const, user: 'Dev One', id: '1' },
    ],
  };

  const features = [
    { label: 'SECURITY', title: 'JWT & Token Rotation', desc: 'Stateless JWT auth with automatic silent refresh and token revocation chains on reuse.' },
    { label: 'COLLABORATION', title: 'Projects & Teams', desc: 'Create projects with custom key prefixes, assign team leads, and manage member permissions.' },
    { label: 'EXECUTION', title: 'Interactive Kanban', desc: 'Smooth drag-and-drop board powered by dnd-kit with instant optimistic UI cache updates.' },
    { label: 'DISCUSSION', title: 'Ticket Comments', desc: 'Real-time issue discussion threads with rich markdown and activity change histories.' },
    { label: 'DISCOVERY', title: 'Filters & Search', desc: 'Debounced search and instant URL-persisted priority and assignee filters.' },
    { label: 'GOVERNANCE', title: 'Role-Based Access', desc: 'Granular permissions enforced at both API controller layer and UI route guards.' },
  ];

  const workflowSteps = [
    { num: '01', title: 'Reported', subtitle: 'To Do', desc: 'Issues are submitted with priority, acceptance checklist, and project assignment.' },
    { num: '02', title: 'Picked Up', subtitle: 'In Progress', desc: 'Developers assign themselves, claim the card, and discuss technical details in the comments.' },
    { num: '03', title: 'Shipped', subtitle: 'Done', desc: 'Drag the card across the board. The sprint burndown and team metrics update instantly.' },
  ];

  const permissions = [
    { action: 'Create & configure projects', admin: 'Yes', manager: 'Yes', dev: 'No' },
    { action: 'Invite and manage team members', admin: 'Yes', manager: 'Yes', dev: 'No' },
    { action: 'Change user roles', admin: 'Yes', manager: 'No', dev: 'No' },
    { action: 'Create issues & comment', admin: 'Yes', manager: 'Yes', dev: 'Yes' },
    { action: 'Move issues on Kanban board', admin: 'Yes', manager: 'Yes', dev: 'Assigned only' },
    { action: 'Delete or re-scope issues', admin: 'Yes', manager: 'Yes', dev: 'Reporter only' },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col selection:bg-primary-tint selection:text-primary-ink">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      {/* Top Navbar */}
      <header className="w-full bg-surface/90 backdrop-blur-md border-b border-border sticky top-0 z-40 px-6 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-1 font-heading font-bold text-2xl tracking-tight text-ink">
            <span>F</span>
            <span className="text-primary">|</span>
            <span className="text-xs uppercase tracking-widest text-muted font-sans font-medium ml-1">Fixlane</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#workflow" className="hover:text-ink transition-colors">Workflow</a>
            <a href="#roles" className="hover:text-ink transition-colors">Roles</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign in
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
            Get started
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="max-w-[1280px] mx-auto px-6 sm:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero */}
            <div ref={addToRefs} className="lg:col-span-6 flex flex-col gap-6 fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint border border-primary/20 text-primary-ink text-xs font-medium w-fit">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>Fixlane 1.0 Enterprise Edition</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-ink">
                Bugs move one way:{' '}
                <span className="text-primary underline decoration-primary/40 underline-offset-8">right.</span>
              </h1>

              <p className="text-lg text-muted max-w-xl leading-relaxed">
                A focused, blazingly fast issue tracking system built for engineering teams that ship daily.
                Strict role-based permissions, zero bloat, and relentless simplicity.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button size="lg" variant="primary" onClick={() => navigate('/register')}>
                  Create your workspace
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
                  See the board
                </Button>
              </div>

              <p className="text-xs text-muted font-mono tracking-wider pt-4">
                Java 17 · Spring Boot · PostgreSQL · React
              </p>
            </div>

            {/* Right Live-looking Board Mockup */}
            <div ref={addToRefs} className="lg:col-span-6 fade-up">
              <div className="bg-[#DFE3DC] p-3 sm:p-4 rounded-[20px] shadow-2xl border border-border">
                <div className="flex items-center justify-between pb-3 px-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#E58D80]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#E5CF80]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#80E5A8]"></span>
                    <span className="ml-2 font-mono text-xs font-semibold text-muted">PAYMENTS-API / SPRINT 14</span>
                  </div>
                  <span className="text-xs font-medium text-subtle">7 active tickets</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  {/* To Do Column */}
                  <div className="bg-column-bg p-2.5 rounded-card flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">To Do</span>
                      <span className="text-xs font-mono font-bold text-muted bg-white px-1.5 py-0.5 rounded-full shadow-xs">3</span>
                    </div>
                    {sampleCards.todo.map((card) => (
                      <div key={card.key} className="bg-surface p-3 rounded-card border border-border shadow-xs flex flex-col gap-2 hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-medium text-muted">{card.key}</span>
                          <Pill variant={card.priority} size="sm" />
                        </div>
                        <p className="text-xs font-medium text-ink line-clamp-2 leading-snug">{card.title}</p>
                        <div className="flex items-center justify-between pt-1">
                          <Avatar name={card.user} userId={card.id} size="sm" />
                          <span className="text-[10px] text-muted">Assignee</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-column-bg p-2.5 rounded-card flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">In Progress</span>
                      <span className="text-xs font-mono font-bold text-muted bg-white px-1.5 py-0.5 rounded-full shadow-xs">2</span>
                    </div>
                    {sampleCards.inProgress.map((card) => (
                      <div key={card.key} className="bg-surface p-3 rounded-card border border-border shadow-xs flex flex-col gap-2 ring-1 ring-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-medium text-muted">{card.key}</span>
                          <Pill variant={card.priority} size="sm" />
                        </div>
                        <p className="text-xs font-medium text-ink line-clamp-2 leading-snug">{card.title}</p>
                        <div className="flex items-center justify-between pt-1">
                          <Avatar name={card.user} userId={card.id} size="sm" />
                          <span className="text-[10px] text-primary font-medium">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Done Column */}
                  <div className="bg-column-bg p-2.5 rounded-card flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Done</span>
                      <span className="text-xs font-mono font-bold text-muted bg-white px-1.5 py-0.5 rounded-full shadow-xs">2</span>
                    </div>
                    {sampleCards.done.map((card) => (
                      <div key={card.key} className="bg-surface/80 p-3 rounded-card border border-border shadow-xs flex flex-col gap-2 opacity-90">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-medium text-muted">{card.key}</span>
                          <Pill variant={card.priority} size="sm" />
                        </div>
                        <p className="text-xs font-medium text-ink/80 line-clamp-2 leading-snug">{card.title}</p>
                        <div className="flex items-center justify-between pt-1">
                          <Avatar name={card.user} userId={card.id} size="sm" />
                          <span className="text-[10px] text-[#0B5A4A] font-semibold">Ready</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-surface border-y border-border py-20">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
            <div ref={addToRefs} className="text-center max-w-2xl mx-auto mb-16 fade-up">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Engineered for Velocity</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Everything your team needs. Nothing it doesn't.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feat, i) => (
                <div
                  key={i}
                  ref={addToRefs}
                  className="bg-bg border border-border rounded-card p-6 flex flex-col gap-3 transition-all hover:border-primary hover:-translate-y-1 fade-up"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{feat.label}</span>
                  <h3 className="text-xl font-bold text-ink">{feat.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section: One ticket, three stops */}
        <section id="workflow" className="max-w-[1280px] mx-auto px-6 sm:px-8 py-24">
          <div ref={addToRefs} className="text-center max-w-xl mx-auto mb-16 fade-up">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Simple Lifecycle</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">One ticket, three stops</h2>
            <p className="text-muted mt-2">No 14-stage workflows. Work enters on the left, finishes on the right.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                ref={addToRefs}
                className="bg-surface border border-border rounded-[16px] p-8 flex flex-col gap-4 relative overflow-hidden shadow-xs fade-up"
              >
                <span className="font-heading text-5xl font-extrabold text-border/70 select-none">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-ink">{step.title}</h3>
                  <span className="text-xs font-medium uppercase tracking-wider text-primary font-mono">{step.subtitle}</span>
                </div>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Permissions Table Section */}
        <section id="roles" className="bg-surface border-y border-border py-20">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
            <div ref={addToRefs} className="text-center max-w-2xl mx-auto mb-14 fade-up">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Role-Based Access Control</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Three roles, enforced by the API</h2>
              <p className="text-muted mt-2">Explicit boundaries keep projects clean, reliable, and auditable.</p>
            </div>

            <div ref={addToRefs} className="overflow-x-auto rounded-card border border-border shadow-xs fade-up">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-bg border-b border-border">
                    <th className="py-4 px-6 font-semibold text-ink">Action</th>
                    <th className="py-4 px-6 font-semibold text-ink text-center">Admin</th>
                    <th className="py-4 px-6 font-semibold text-ink text-center">Manager</th>
                    <th className="py-4 px-6 font-semibold text-ink text-center">Developer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {permissions.map((p, index) => (
                    <tr key={index} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-ink">{p.action}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-tint text-primary-ink">
                          {p.admin}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.manager === 'Yes' ? 'bg-primary-tint text-primary-ink' : 'bg-bg text-muted'}`}>
                          {p.manager}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.dev === 'Yes' ? 'bg-primary-tint text-primary-ink' : p.dev === 'No' ? 'bg-danger-tint text-danger' : 'bg-[#E4ECF5] text-[#2F4F78]'}`}>
                          {p.dev}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Dark CTA Band */}
        <section className="bg-ink text-surface py-20 px-6 sm:px-8">
          <div ref={addToRefs} className="max-w-[1280px] mx-auto text-center flex flex-col items-center gap-6 fade-up">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Open your first board today
            </h2>
            <p className="text-muted text-base max-w-lg">
              Set up your workspace in 30 seconds. No credit card required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button size="lg" variant="primary" onClick={() => navigate('/register')}>
                Get started for free
              </Button>
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/login')}>
                Sign in to existing team
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8 px-6 sm:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-base text-ink">F<span className="text-primary">|</span></span>
            <span>Fixlane Issue Tracker © 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#workflow" className="hover:text-ink">Workflow</a>
            <a href="#roles" className="hover:text-ink">Roles</a>
            <Link to="/login" className="hover:text-ink">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
