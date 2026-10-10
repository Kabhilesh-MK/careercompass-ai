import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Moon,
  Sun,
  ChevronDown,
  Search,
  LogOut,
  Settings,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import NotificationCenter from '@/components/NotificationCenter';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const name = user?.full_name || 'Alex Johnson';
  const firstName = name.split(' ')[0];
  const email = user?.email || 'alex.johnson@example.edu';

  // Compute breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const getBreadcrumbs = () => {
    if (pathParts.length === 0 || pathParts[0] === 'dashboard') {
      return [{ label: 'Dashboard', path: '/dashboard' }];
    }
    return pathParts.map((part, index) => {
      const path = '/' + pathParts.slice(0, index + 1).join('/');
      const label = part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, path };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/career/explorer?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 px-4 lg:px-6 shrink-0">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-slate-100 p-1"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={22} />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
          <Link
            to="/dashboard"
            className="hover:text-primary transition-colors font-medium text-gray-600 dark:text-slate-400"
          >
            CareerCompass
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-gray-400 dark:text-slate-600" />
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-gray-900 dark:text-slate-100 truncate max-w-[180px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-primary transition-colors truncate max-w-[120px]"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Center: Global Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex-1 max-w-sm hidden md:block"
      >
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none"
          size={15}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search careers, skills, courses, projects..."
          className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        />
      </form>

      {/* Right: Actions, Notifications, Theme, User */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Action: Skill Assessment */}
        <Link
          to="/skills/assessment"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 hover:bg-primary/20 transition-colors"
        >
          <Sparkles size={13} />
          <span>Skill Check</span>
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle visual theme"
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.span
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <Moon size={17} />
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Sun size={17} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            aria-expanded={profileOpen}
            aria-label="User account menu"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {firstName[0]}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-gray-900 dark:text-slate-100 block leading-tight">
                {firstName}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 block leading-none">
                Student
              </span>
            </div>
            <ChevronDown size={13} className="text-gray-400 dark:text-slate-500" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                className="absolute right-0 mt-2 w-56 card p-0 overflow-hidden shadow-elevated z-50 border border-gray-100 dark:border-slate-800"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="font-bold text-sm text-gray-900 dark:text-slate-100 truncate">
                    {name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {email}
                  </p>
                </div>
                <div className="p-1 space-y-0.5">
                  <MenuItem
                    icon={<User size={15} />}
                    label="My Profile"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/profile');
                    }}
                  />
                  <MenuItem
                    icon={<Settings size={15} />}
                    label="Settings"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/settings');
                    }}
                  />
                  <MenuItem
                    icon={<LogOut size={15} />}
                    label="Logout"
                    danger
                    onClick={async () => {
                      setProfileOpen(false);
                      await logoutUser();
                      navigate('/login', { replace: true });
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
        danger
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-gray-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
