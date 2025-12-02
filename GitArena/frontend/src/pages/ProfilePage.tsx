import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, User } from '../api/auth';

const ProfilePage: React.FC = () => {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                Failed to load profile data
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 sm:p-8">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-cyan-500 to-purple-600">
                            <img
                                src={user?.avatar_url}
                                alt={user?.username}
                                className="w-full h-full rounded-full object-cover border-4 border-gray-800 bg-gray-800"
                            />
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-gray-800 rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                            {user?.name || user?.username}
                        </h1>
                        <p className="text-gray-400 font-mono text-sm mb-4">@{user?.username}</p>

                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                            {user?.email && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600">
                                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user.email}
                                </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600">
                                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Joined {new Date(user?.created_at || '').toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">GitHub ID</div>
                    <div className="text-xl font-mono font-semibold text-white">{user?.github_id}</div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Repositories</div>
                    <div className="text-xl font-mono font-semibold text-white">--</div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-colors">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Status</div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xl font-mono font-semibold text-emerald-400">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
