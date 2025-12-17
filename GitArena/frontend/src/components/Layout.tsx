import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-cyan-500/30 flex flex-col">
            {/* Enhanced Navbar */}
            <nav className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link to="/profile" className="flex items-center gap-3 group">
                                <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-105 transition-all duration-300">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-gradient-cyan-purple">GitArena</span>
                                    <span className="text-[10px] text-gray-500 font-mono -mt-1">Analytics Platform</span>
                                </div>
                            </Link>

                            {/* Nav Links - Desktop */}
                            <div className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/profile"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/profile')
                                            ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profile
                                </Link>
                                <Link
                                    to="/projects"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/projects')
                                            ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    Projects
                                </Link>
                                <Link
                                    to="/repositories"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/repositories')
                                            ? 'bg-gradient-to-r from-cyan-600/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                    </svg>
                                    Repositories
                                </Link>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search Button */}
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 text-sm transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="hidden lg:inline">Search</span>
                                <kbd className="hidden lg:inline px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">⌘K</kbd>
                            </button>

                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors group">
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                            </button>

                            {/* User Menu */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    U
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-800 animate-slide-in-left">
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/profile') ? 'bg-cyan-600/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/projects"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/projects') ? 'bg-cyan-600/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    Projects
                                </Link>
                                <Link
                                    to="/repositories"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isActive('/repositories') ? 'bg-cyan-600/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    Repositories
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-left text-gray-400 hover:text-white hover:bg-gray-800"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Enhanced Footer */}
            <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl mt-auto">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="font-bold text-lg text-gradient-cyan-purple">GitArena</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                Your ultimate GitHub analytics platform for tracking, analyzing, and optimizing your development workflow.
                            </p>
                            {/* Social Links */}
                            <div className="flex gap-3">
                                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all hover-lift">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all hover-lift">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-200 mb-4">Product</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Integrations</a></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-200 mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-200 mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookies</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-600 font-mono">
                            GitArena © {new Date().getFullYear()} • Built with ❤️ for developers
                        </p>
                        <div className="flex items-center gap-6 text-xs text-gray-600">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                All systems operational
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
