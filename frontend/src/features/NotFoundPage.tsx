import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-[8rem] font-heading font-extrabold text-border leading-none select-none">
        404
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink">Page not found</h1>
        <p className="text-muted text-sm max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input bg-primary text-white font-semibold text-sm hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Return to dashboard
      </Link>
    </div>
  );
};

