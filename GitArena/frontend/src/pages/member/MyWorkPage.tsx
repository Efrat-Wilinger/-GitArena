import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../../api/github';
import { authApi, User } from '../../api/auth';

import CreateIssueModal from '../../components/CreateIssueModal';

const MyWorkPage: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: user } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    const [filter, setFilter] = useState<'all' | 'pr' | 'issue' | 'review'>('all');

    const { data: tasks = [], isLoading: loading } = useQuery({
        queryKey: ['userTasks', user?.id],
        queryFn: () => githubApi.getUserTasks(user!.id),
        enabled: !!user?.id,
    });

    const myPRs = tasks.filter(t => t.type === 'pr');
    const reviewsNeeded = tasks.filter(t => t.type === 'review');
    const assignedIssues = tasks.filter(t => t.type === 'issue');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'closed' || t.status === 'merged').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-4xl">💼</span>
                        My Work
                    </h1>
                    <p className="text-slate-400">Your assigned tasks, PRs, and reviews</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                    {[
                        { id: 'all', label: 'All', icon: '📋' },
                        { id: 'pr', label: 'PRs', icon: '🔀' },
                        { id: 'issue', label: 'Issues', icon: '🐛' },
                        { id: 'review', label: 'Reviews', icon: '👀' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 text-sm
                                ${filter === tab.id
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Open PRs', value: myPRs.length, icon: '🔀', color: 'blue', subtext: 'Active pull requests' },
                    { label: 'Pending Reviews', value: reviewsNeeded.length, icon: '👀', color: 'orange', subtext: 'Awaiting your review' },
                    { label: 'Active Issues', value: assignedIssues.length, icon: '🐛', color: 'red', subtext: 'Assigned to you' },
                    { label: 'Completion', value: `${completionRate}%`, icon: '✅', color: 'green', subtext: 'Task completion rate' },
                ].map((stat, i) => (
                    <div key={i} className="modern-card p-6 text-center hover:scale-105 transition-transform group cursor-default">
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                        <div className={`text-3xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>
                    </div>
                ))}
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column - 8 cols */}
                <div className="xl:col-span-8 space-y-6">
                    {/* My Pull Requests */}
                    {(filter === 'all' || filter === 'pr') && (
                        <div className="modern-card p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                My Pull Requests
                                <span className="ml-auto px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                                    {myPRs.length}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {myPRs.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-5xl mb-3">🎉</div>
                                        <p className="text-slate-400">No active pull requests</p>
                                        <p className="text-slate-500 text-sm mt-1">All caught up!</p>
                                    </div>
                                ) : myPRs.map((task) => (
                                    <a href={task.url} target="_blank" rel="noopener noreferrer" key={task.id}
                                        className="block p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-blue-500/50 group">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {task.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 mt-1">{task.repo} • #{task.number}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-400 whitespace-nowrap">
                                                Open
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assigned Issues */}
                    {(filter === 'all' || filter === 'issue') && (
                        <div className="modern-card p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                                Assigned Issues
                                <span className="ml-auto px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
                                    {assignedIssues.length}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {assignedIssues.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-5xl mb-3">✨</div>
                                        <p className="text-slate-400">No assigned issues</p>
                                        <p className="text-slate-500 text-sm mt-1">You're all clear!</p>
                                    </div>
                                ) : assignedIssues.map((task) => (
                                    <a href={task.url} target="_blank" rel="noopener noreferrer" key={task.id}
                                        className="block p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-red-500/50 group">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {task.priority?.toUpperCase() || 'NORMAL'} Priority
                                                    </span>
                                                    <span className="text-slate-500 text-sm">{task.repo}</span>
                                                </div>
                                                <h4 className="text-white font-medium group-hover:text-red-400 transition-colors">
                                                    {task.title}
                                                </h4>
                                            </div>
                                            <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - 4 cols */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Reviews Needed */}
                    {(filter === 'all' || filter === 'review') && (
                        <div className="modern-card p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                                Reviews Needed
                            </h3>
                            <div className="space-y-3">
                                {reviewsNeeded.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">👍</div>
                                        <p className="text-slate-400 text-sm">No pending reviews</p>
                                        <p className="text-slate-500 text-xs mt-1">All done!</p>
                                    </div>
                                ) : reviewsNeeded.map((task) => (
                                    <a href={task.url} target="_blank" rel="noopener noreferrer" key={task.id}
                                        className="block p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-orange-500/50 group">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
                                                !
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium group-hover:text-orange-400 transition-colors text-sm line-clamp-2">
                                                    {task.title}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1">{task.repo} • #{task.number}</p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="modern-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-cyan-500/50 text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl">
                                        ➕
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm group-hover:text-cyan-400 transition-colors">Create New Task</p>
                                        <p className="text-xs text-slate-500">Create a GitHub Issue</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-blue-500/50 text-left group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">
                                        🔍
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">Browse Issues</p>
                                        <p className="text-xs text-slate-500">Find tasks to work on</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CreateIssueModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default MyWorkPage;
