import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { authApi, User } from '../../api/auth';
import { githubApi } from '../../api/github';
import apiClient from '../../api/client';
import { LanguageDistribution, RecentCommits, PullRequestStatus, WeeklyActivity } from '../../components/DashboardWidgets';
import AIInsights from '../../components/AIInsights';
import AnimatedCommitGraph from '../../components/AnimatedCommitGraph';
import ContributionHeatmap from '../../components/ContributionHeatmap';
import { AchievementsSection } from '../../components/AchievementBadge';
import { useProject } from '../../contexts/ProjectContext';
import MyTasksWidget from '../../components/MyTasksWidget';
import { QuestsWidget } from '../../components/QuestsWidget';

const MemberDashboardPage: React.FC = () => {
    const { currentProjectId: contextProjectId, currentProjectName } = useProject();
    const currentProjectId = contextProjectId ?? undefined;

    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    const { data: gamificationStats } = useQuery({
        queryKey: ['gamificationStats'],
        queryFn: () => githubApi.getGamificationStats(),
    });

    const { data: dashboardStats } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: authApi.getUserDashboard,
    });

    const queryClient = useQueryClient();
    const [isSyncing, setIsSyncing] = useState(false);

    // Sync mutation
    const syncMutation = useMutation({
        mutationFn: async () => {
            if (contextProjectId) {
                await apiClient.post(`/spaces/${contextProjectId}/sync`);
            } else {
                await apiClient.post('/github/sync');
            }
        },
        onMutate: () => setIsSyncing(true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
        onError: (err) => {
            console.error("Sync failed:", err);
            alert("Sync failed. Check console for details.");
        },
        onSettled: () => setIsSyncing(false)
    });

    const [counters, setCounters] = useState({
        repos: 0,
        commits: 0,
        prs: 0,
        reviews: 0,
    });

    // Animated counters
    useEffect(() => {
        if (user && user.stats) {
            const targetValues = {
                repos: user.stats.total_repositories,
                commits: user.stats.total_commits,
                prs: user.stats.total_prs,
                reviews: user.stats.total_issues
            };
            const stepTime = 20;

            const timer = setInterval(() => {
                setCounters(prev => {
                    const next = { ...prev };
                    let complete = true;

                    (['repos', 'commits', 'prs', 'reviews'] as const).forEach(key => {
                        if (prev[key] < targetValues[key]) {
                            complete = false;
                            next[key] = Math.min(prev[key] + Math.max(1, Math.ceil((targetValues[key] - prev[key]) / 10)), targetValues[key]);
                        }
                    });

                    if (complete) clearInterval(timer);
                    return next;
                });
            }, stepTime);

            return () => clearInterval(timer);
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                <div className="modern-card p-8 border-red-500/20 bg-red-500/5 max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Sync Error</h2>
                    <p className="text-slate-400 mb-4">Could not retrieve profile data. Please try again.</p>
                    <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Retry Connection</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {currentProjectName || 'Project'} | Developer Hub
                        </h1>
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold flex items-center gap-1">
                            <span>👤</span> Member
                        </div>
                    </div>
                    <p className="text-slate-400 max-w-xl">
                        Your personal workspace and contribution analytics.
                    </p>
                </div>

                <button
                    onClick={() => syncMutation.mutate()}
                    disabled={isSyncing}
                    className="btn-secondary flex items-center gap-2 shadow-lg"
                >
                    {isSyncing ? (
                        <>
                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                            <span>Syncing...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Sync Data</span>
                        </>
                    )}
                </button>
            </div>

            {/* Personal Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Commits', value: counters.commits, icon: '💻', color: 'blue' },
                    { label: 'Repositories', value: counters.repos, icon: '📂', color: 'purple' },
                    { label: 'Pull Requests', value: counters.prs, icon: '🔀', color: 'green' },
                    { label: 'Code Reviews', value: counters.reviews, icon: '👁️', color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="modern-card p-6 flex items-center justify-between hover:scale-102 transition-transform cursor-default group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl text-${stat.color}-500`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
                            <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center text-2xl shadow-lg shadow-${stat.color}-500/10`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Bento Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column - 8 cols */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Personal Profile Card */}
                    <div className="modern-card p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-2 ring-blue-500/20 shadow-xl">
                                    <img src={user?.avatar_url} alt={user?.username} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gradient-blue rounded-lg p-1.5 shadow-lg">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                                        {user?.name}
                                    </h2>
                                    <div className="flex items-center gap-3 text-lg text-slate-400 font-medium">
                                        <span className="text-blue-400">@{user?.username}</span>
                                        <span>•</span>
                                        <span>{user?.company || 'Developer'}</span>
                                    </div>
                                </div>

                                <p className="text-slate-400 leading-relaxed">
                                    {user?.bio || "No bio provided."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Personal AI Insights */}
                    <ErrorBoundary name="Personal Insights">
                        <AIInsights userId={user?.id} projectId={currentProjectId} />
                    </ErrorBoundary>

                    {/* Personal Commit Graph */}
                    <ErrorBoundary name="Personal Commit Graph">
                        <AnimatedCommitGraph data={dashboardStats?.heatmap_data?.slice(-30).map(d => ({ date: d.date, count: d.count }))} />
                    </ErrorBoundary>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PullRequestStatus data={dashboardStats?.pr_status} />
                        <LanguageDistribution data={dashboardStats?.languages} />
                    </div>
                    <WeeklyActivity data={dashboardStats?.weekly_activity} />
                </div>

                {/* Right Column - 4 cols */}
                <div className="xl:col-span-4 space-y-6">
                    {/* My Active Tasks */}
                    <MyTasksWidget projectId={currentProjectId} userId={user?.id} />

                    {/* Quests Widget */}
                    <QuestsWidget
                        stats={{
                            commits: counters.commits,
                            prs: counters.prs,
                            issues: 0,
                            reviews: counters.reviews
                        }}
                        isManager={false}
                        projectId={currentProjectId}
                    />
                </div>

                {/* Full Width Sections */}
                <div className="xl:col-span-12 space-y-6">
                    {/* Contribution Heatmap */}
                    <div className="modern-card p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                Contribution Matrix
                            </h3>
                        </div>
                        <ContributionHeatmap data={dashboardStats?.heatmap_data} />
                    </div>

                    {/* Recent Activity */}
                    <RecentCommits data={dashboardStats?.recent_commits} />

                    {/* Achievements */}
                    <AchievementsSection achievements={gamificationStats?.achievements} />
                </div>
            </div>
        </div >
    );
};

export default MemberDashboardPage;
