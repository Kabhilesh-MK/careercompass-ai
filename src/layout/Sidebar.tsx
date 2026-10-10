import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  Briefcase,
  GitCompare,
  Layers,
  ClipboardCheck,
  GitBranch,
  Sparkles,
  BookOpen,
  GraduationCap,
  FolderGit2,
  Building2,
  Map,
  TrendingUp,
  Code2,
  Award,
  Trophy,
  History,
  User,
  Settings,
  FileText,
  Bot,
  ChevronLeft,
  ChevronDown,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title: string;
  collapsible?: boolean;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CAREER INTELLIGENCE',
    items: [
      { to: '/career/prediction', label: 'Career Prediction', icon: Compass },
      { to: '/career/explorer', label: 'Career Explorer', icon: Briefcase },
      { to: '/career/compare', label: 'Career Comparison', icon: GitCompare },
    ],
  },
  {
    title: 'SKILL INTELLIGENCE',
    items: [
      { to: '/skills', label: 'Skill Overview', icon: Layers },
      { to: '/skills/assessment', label: 'Skill Assessment', icon: ClipboardCheck, badge: 'New' },
      { to: '/skills/gap', label: 'Skill Gap', icon: GitBranch },
    ],
  },
  {
    title: 'LEARNING HUB',
    items: [
      { to: '/learning', label: 'Recommended', icon: Sparkles },
      { to: '/learning/courses', label: 'Courses', icon: BookOpen },
      { to: '/learning/paths', label: 'Learning Paths', icon: GraduationCap },
      { to: '/learning/projects', label: 'Projects', icon: FolderGit2 },
      { to: '/learning/experience', label: 'Experience Lab', icon: Building2, badge: 'Labs' },
    ],
  },
  {
    title: 'PROGRESS',
    items: [
      { to: '/roadmap', label: 'My Roadmap', icon: Map },
      { to: '/progress', label: 'Progress Analytics', icon: TrendingUp },
    ],
  },
  {
    title: 'PORTFOLIO',
    items: [
      { to: '/portfolio/projects', label: 'Projects', icon: Code2 },
      { to: '/portfolio/certificates', label: 'Certificates', icon: Award },
      { to: '/portfolio/achievements', label: 'Achievements', icon: Trophy },
    ],
  },
  {
    title: 'ADDITIONAL TOOLS',
    collapsible: true,
    items: [
      { to: '/resume', label: 'Resume Analyzer', icon: FileText },
      { to: '/placement', label: 'Placement Prep', icon: Briefcase },
      { to: '/mentor', label: 'AI Mentor', icon: Bot },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { to: '/predictions/history', label: 'Prediction History', icon: History },
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser } = useAuth();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isItemActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    if (to === '/skills') return location.pathname === '/skills';
    if (to === '/learning') return location.pathname === '/learning';
    if (to === '/roadmap') return location.pathname === '/roadmap';
    if (to === '/progress') return location.pathname === '/progress';
    if (to === '/profile') return location.pathname === '/profile';
    if (to === '/settings') return location.pathname === '/settings';
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-slate-800 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Header */}
        <div
          className={`flex items-center gap-3 h-16 px-4 border-b border-gray-100 dark:border-slate-800 shrink-0 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shrink-0 shadow-glow">
            <Compass size={20} className="animate-spin-slow" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-tight tracking-tight">
                CareerCompass
              </p>
              <span className="text-[9px] font-bold text-primary dark:text-primary-300 uppercase tracking-wider block">
                Career Intelligence
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            aria-label="Close navigation drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
          {navSections.map((section) => {
            const isSectionCollapsed = !!collapsedSections[section.title];

            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div
                    onClick={() => section.collapsible && toggleSection(section.title)}
                    className={`px-2.5 py-1 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between ${
                      section.collapsible ? 'cursor-pointer hover:text-gray-600 dark:hover:text-slate-300' : ''
                    }`}
                  >
                    <span>{section.title}</span>
                    {section.collapsible && (
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          isSectionCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    )}
                  </div>
                )}

                {(!section.collapsible || !isSectionCollapsed) && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isItemActive(item.to);
                      const IconComponent = item.icon;

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`nav-link relative group ${
                            active ? 'nav-link-active' : ''
                          } ${collapsed ? 'justify-center px-0' : 'px-3'}`}
                          title={collapsed ? item.label : undefined}
                        >
                          <IconComponent
                            size={18}
                            className={`shrink-0 transition-colors ${
                              active
                                ? 'text-primary'
                                : 'text-gray-400 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-200'
                            }`}
                          />

                          {!collapsed && (
                            <span className="truncate font-medium flex-1 text-xs">
                              {item.label}
                            </span>
                          )}

                          {!collapsed && item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300">
                              {item.badge}
                            </span>
                          )}

                          {active && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r" />
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User / Logout Footer */}
        <div className="p-2 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              navigate('/login', { replace: true });
            }}
            className={`nav-link text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 w-full ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span className="text-xs font-semibold">Logout</span>}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-700 items-center justify-center text-gray-500 hover:text-primary shadow-soft z-10 transition-transform"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={13}
            className={`transition-transform duration-200 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </aside>
    </>
  );
}
