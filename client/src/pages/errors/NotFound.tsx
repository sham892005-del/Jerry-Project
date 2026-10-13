import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-24 w-24 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
          <Compass className="h-12 w-12 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="text-6xl font-black text-slate-900 tracking-tight">404</div>
          <h1 className="text-xl font-bold text-slate-800">Page Not Found</h1>
          <p className="text-slate-500 text-sm">
            The page or opportunity track you are looking for has moved, expired, or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition text-sm"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};
