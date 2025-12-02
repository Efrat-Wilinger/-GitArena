import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Navbar */}
            <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link to="/profile" className="flex items-center gap-3 group">
                                <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    GitArena
                                </span>
                            </Link>

                            {/* Nav Links */}
                            <div className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/profile"
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/profile')
                                            ? 'bg-gray-800 text-cyan-400'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/projects"
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/projects') || location.pathname.includes('/projects/')
                                            ? 'bg-gray-800 text-cyan-400'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    Projects
                                </Link>
                                <Link
                                    to="/repositories"
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/repositories') || location.pathname.includes('/repositories/')
                                            ? 'bg-gray-800 text-cyan-400'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    Repositories
                                </Link>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-auto bg-gray-900">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-xs text-gray-600 font-mono">
                        GitArena &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
