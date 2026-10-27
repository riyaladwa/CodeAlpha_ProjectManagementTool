import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  FileText,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { TaskModal } from '../components/TaskModal';
import { getInitials, getAvatarColor } from '../utils/helpers';

export const MainLayout = () => {
  const { user, currentWorkspace, workspaces, switchWorkspace, createWorkspace, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Global Modals State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newWorkspaceModalOpen, setNewWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Kanban Board', path: '/kanban', icon: CheckSquare },
    { name: 'My Tasks', path: '/my-tasks', icon: CheckSquare },
    { name: 'AI Task Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'Smart' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Reports & PDF', path: '/reports', icon: FileText },
  ];

  const handleCreateWorkspaceSubmit = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    await createWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setNewWorkspaceModalOpen(false);
    setWorkspaceDropdownOpen(false);
  };

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return [{ label: 'Overview' }];
    if (path === '/kanban') return [{ label: 'Kanban Board' }];
    if (path === '/my-tasks') return [{ label: 'My Tasks' }];
    if (path === '/ai-assistant') return [{ label: 'AI Task Assistant' }];
    if (path === '/analytics') return [{ label: 'Analytics' }];
    if (path === '/calendar') return [{ label: 'Calendar' }];
    if (path === '/team') return [{ label: 'Team Members' }];
    if (path === '/reports') return [{ label: 'Reports' }];
    if (path === '/profile') return [{ label: 'Account Settings' }];
    if (path === '/notifications') return [{ label: 'Notifications' }];
    return [];
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top brand header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-[#18181B] flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M7 12L10.5 15.5L17 8.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17.5" cy="6.5" r="2" fill="#71717A" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight">TaskFlow</h1>
                  <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">AI</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">Smart Collaboration</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 py-3 border-b border-slate-100 relative">
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(currentWorkspace?.name || 'WS')}
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {currentWorkspace?.name || 'My Workspace'}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {currentWorkspace?.members?.find((m) => m.user?._id === user?._id)?.role || 'Workspace'}
                  </p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          </button>

          {/* Workspace Dropdown */}
          {workspaceDropdownOpen && (
            <div className="absolute left-3 right-3 top-14 bg-white rounded-xl shadow-dropdown border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    switchWorkspace(ws);
                    setWorkspaceDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                    ws._id === currentWorkspace?._id ? 'text-zinc-900 font-semibold bg-zinc-100/70' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws._id === currentWorkspace?._id && <div className="w-1.5 h-1.5 rounded-full bg-[#18181B] shrink-0" />}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setWorkspaceDropdownOpen(false);
                    setNewWorkspaceModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-900 hover:text-black hover:bg-zinc-100 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#18181B] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
              title={sidebarCollapsed ? item.name : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </div>
              {!sidebarCollapsed && item.badge && (
                <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Strip */}
        <div className="p-3 border-t border-slate-100 relative">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(
                  user?.name
                )}`}
              >
                {getInitials(user?.name)}
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.title || user?.email}</p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Menu Dropdown */}
          {userDropdownOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-white rounded-xl shadow-dropdown border border-slate-200 py-1.5 z-50 animate-fadeIn">
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" /> Account Settings
              </button>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between">
          {/* Left: Hamburger & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{currentWorkspace?.name || 'TaskFlow'}</span>
              {getBreadcrumbs().map((b, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  {b.link ? (
                    <NavLink to={b.link} className="hover:text-slate-900 transition-colors">
                      {b.label}
                    </NavLink>
                  ) : (
                    <span className="text-slate-900 font-medium">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: Search bar, Quick Add Button, Notifications */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 text-slate-500 text-xs border border-slate-200 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Search anything...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* AI Copilot Quick Button */}
            <button
              onClick={() => navigate('/ai-assistant')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-200/70 border border-zinc-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
              AI Assistant
            </button>

            {/* Quick + New Task Button */}
            <button
              onClick={() => setTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all hover:shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet context={{ openNewTaskModal: () => setTaskModalOpen(true) }} />
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onOpenNewTask={() => setTaskModalOpen(true)}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onTaskSaved={() => {
          // If on dashboard or kanban, reload or dispatch
          window.dispatchEvent(new Event('taskflow-data-refresh'));
        }}
      />

      {/* Create Workspace Modal */}
      {newWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Create New Workspace</h3>
              <button
                onClick={() => setNewWorkspaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Product Hub"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:border-zinc-800 focus:outline-hidden"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewWorkspaceModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#18181B] hover:bg-zinc-800 rounded-xl shadow-sm"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
