import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useUserRole } from './RoleBasedView';
import { useProject } from '../contexts/ProjectContext';

const Layout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userRole = useUserRole();
    const { currentProjectName } = useProject();

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
        retry: false,
    });

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    // Dynamic navigation based on role
    const managerNavItems = [
        { path: '/manager/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/manager/team', label: 'Team', icon: '👥' },
        { path: '/manager/activity', label: 'Activity', icon: '📝' },
        { path: '/repositories', label: 'Repositories', icon: '📚' },
        { path: '/manager/settings', label: 'Settings', icon: '⚙️' },
    ];

    const memberNavItems = [
        { path: '/member/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/member/my-work', label: 'My Work', icon: '✅' },
        { path: '/member/achievements', label: 'Achievements', icon: '🏆' },
        { path: '/repositories', label: 'Repositories', icon: '📚' },
    ];

    const navItems = userRole === 'manager' ? managerNavItems : memberNavItems;

    return (
        <div className="min-h-screen bg-gradient-dark text-white font-sans flex flex-col relative overflow-x-hidden">
            {/* Background grid pattern */}
            <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-primary-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 flex items-center justify-center bg-gradient-blue rounded-xl shadow-lg glow-blue group-hover:scale-105 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">GitArena</span>
                            </Link>

                            {/* Current Project Indicator */}
                            {currentProjectName && (
                                <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10">
                                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-slate-300 font-medium">{currentProjectName}</span>
                                </div>
                            )}

                            {/* Role Badge */}
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${userRole === 'manager'
                                ? 'bg-gradient-orange text-white'
                                : 'bg-blue-500/20 text-blue-300'
                                }`}>
                                {userRole === 'manager' ? '👑 Manager' : '👤 Member'}
                            </span>

                            {/* Navigation Links */}
                            <div className="hidden lg:flex items-center space-x-1">
                                {navItems.slice(0, 5).map((item) => {
                                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                                                ${isActive
                                                    ? 'text-white bg-gradient-blue shadow-lg'
                                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <span>{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* User Menu */}
                            {user && (
                                <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                                    <div className="w-9 h-9 rounded-full bg-gradient-blue flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-blue-500/20">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 pt-16 relative z-10">
                <div className="py-8 px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
