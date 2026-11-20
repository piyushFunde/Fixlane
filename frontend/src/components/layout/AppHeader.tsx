import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Projects', path: '/projects' },
    ...(user?.role === 'ADMIN' || user?.role === 'MANAGER' ? [{ name: 'Team', path: '/team' }] : []),
  ];

  return (
    <header className="bg-surface border-b border-border h-14 px-8 sticky top-0 z-40 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-1 font-heading font-bold text-xl tracking-tight text-ink">
          <span>F</span>
          <span className="text-primary font-bold">|</span>
          <span className="text-xs uppercase tracking-widest text-muted font-sans font-medium ml-1">Fixlane</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 h-14">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'h-full inline-flex items-center text-sm font-medium transition-colors border-b-2 border-transparent px-1 pt-0.5',
                  isActive
                    ? 'border-primary text-ink font-semibold'
                    : 'text-muted hover:text-ink hover:border-border'
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate('/issues/new')}
          className="text-xs sm:text-sm font-medium flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create issue</span>
        </Button>

        {/* User Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-expanded={dropdownOpen}
              aria-label="User profile menu"
            >
              <Avatar name={user.fullName} userId={user.id} size="sm" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-card shadow-lg py-1 z-50 animate-pop-in"
                role="menu"
              >
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-sm font-semibold text-ink truncate">{user.fullName}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider rounded-full bg-primary-tint text-primary-ink">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-tint/50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-input text-muted hover:text-ink hover:bg-bg focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-surface border-b border-border px-6 py-4 flex flex-col gap-3 shadow-md z-40">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-ink hover:text-primary py-2"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
