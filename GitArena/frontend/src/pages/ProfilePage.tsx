import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, User } from '../api/auth';
import apiClient from '../api/client';
import ContributionHeatmap from '../components/ContributionHeatmap';
import { AchievementsSection } from '../components/AchievementBadge';
import AIInsights from '../components/AIInsights';
import AnimatedCommitGraph from '../components/AnimatedCommitGraph';
import TeamCollaborationNetwork, { TeamMember, Collaboration } from '../components/TeamCollaborationNetwork';
import { LanguageDistribution, RecentCommits, PullRequestStatus, TopRepositories, WeeklyActivity } from '../components/DashboardWidgets';
import RoleBasedView, { useUserRole } from '../components/RoleBasedView';

const ProfilePage: React.FC = () => {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    const { data: collaborationData } = useQuery<{ members: TeamMember[], collaborations: Collaboration[] }>({
        queryKey: ['teamCollaboration', user?.id],
        queryFn: async () => {
            const response = await apiClient.get('/analytics/collaboration');
            return response.data;
        },
        enabled: !!user?.id
    });

    const userRole = useUserRole();

    const { data: managerStats } = useQuery({
        queryKey: ['managerStats', user?.id],
        queryFn: async () => {
            const response = await apiClient.get('/analytics/manager-stats');
            return response.data;
        },
        enabled: !!user?.id && userRole === 'manager'
    });

    const queryClient = useQueryClient();
    const [isSyncing, setIsSyncing] = useState(false);

    // Sync mutation
    const syncMutation = useMutation({
        mutationFn: async () => {
            // For manager view, we sync ALL projects
            const response = await apiClient.post('/users/sync-projects');
            return response.data;
        },
        onMutate: () => setIsSyncing(true),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            // Refresh team collaboration too
            queryClient.invalidateQueries({ queryKey: ['teamCollaboration'] });

            if (data.failed > 0) {
                alert(`Sync completed with ${data.failed} errors:\n${data.errors.join('\n')}\nSynced: ${data.total_synced}`);
            } else {
                alert(`Successfully synced ${data.total_synced} projects!`);
            }
        },
        onError: (err) => {
            console.error("Sync failed:", err);
            alert("Sync failed. Check console for details.");
        },
        onSettled: () => setIsSyncing(false)
    });

    const handleSync = () => {
        if (isSyncing) return;
        syncMutation.mutate();
    };


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

    // Manager Dashboard
    const ManagerDashboard = (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Role Badge */}
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-gradient-orange text-white font-semibold text-sm flex items-center gap-2">
                    <span>👑</span>
                    Manager View
                </div>
            </div>

            {/* Header with Team Stats */}
            <div className="modern-card p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                            Team Dashboard
                        </h1>
                        <p className="text-slate-400">
                            Manage your team's performance and insights
                        </p>
                    </div>

                    {/* Sync Button */}
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border self-center ${isSyncing
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20'
                            }`}
                        title="Force sync all projects from GitHub"
                    >
                        <span className={`text-lg ${isSyncing ? 'animate-spin' : ''}`}>
                            {isSyncing ? '↻' : '⚡'}
                        </span>
                        {isSyncing ? 'Syncing...' : 'Sync All Stats'}
                    </button>
                </div>

                {/* Quick Team Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {(() => {
                        // Calculate Team Stats Aggregation
                        const teamCommits = collaborationData?.members?.reduce((acc, member) => acc + (member.contributions || 0), 0) || counters.commits;
                        const activeRepos = collaborationData?.collaborations?.length ? Math.ceil(collaborationData.collaborations.length / 2) : counters.repos; // Approx from edges or use counters.repos as fallback

                        return [
                            { label: 'Total Commits', value: teamCommits, color: 'blue' },
                            { label: 'Team PRs', value: counters.prs, color: 'blue' }, // TODO: Aggregate PRs in backend
                            { label: 'Active Repos', value: counters.repos, color: 'blue' }, // Use user's total repos for now
                            { label: 'Team Size', value: collaborationData?.members?.length || 1, color: 'blue' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
                                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                            </div>
                        ));
                    })()}
                </div>
            </div>



            {/* AI Insights */}
            <ErrorBoundary name="AI Insights">
                <AIInsights userId={user?.id} />
            </ErrorBoundary>

            {/* Team Collaboration */}
            <ErrorBoundary name="Team Collaboration">
                <TeamCollaborationNetwork
                    members={collaborationData?.members || []}
                    collaborations={collaborationData?.collaborations || []}
                />
            </ErrorBoundary>

            {/* Animated Commit Graph */}
            <ErrorBoundary name="Commit Graph">
                <AnimatedCommitGraph />
            </ErrorBoundary>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WeeklyActivity data={managerStats?.activity} />
                <PullRequestStatus data={managerStats?.prStats} />
                <LanguageDistribution data={managerStats?.languages} />
            </div>

            {/* Activity & Repositories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentCommits data={managerStats?.recentCommits} />
                <TopRepositories data={managerStats?.topRepos} />
            </div>
        </div>
    );

    // Member Dashboard
    const MemberDashboard = (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Role Badge */}
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 font-semibold text-sm flex items-center gap-2">
                    <span>👤</span>
                    Member View
                </div>
            </div>

            {/* Personal Header */}
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

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                                {user?.name}
                            </h1>
                            <div className="flex items-center gap-3 text-lg text-slate-400 font-medium">
                                <span className="text-blue-400">@{user?.username}</span>
                                <span>•</span>
                                <span>{user?.company || 'Developer'}</span>
                            </div>
                        </div>

                        <p className="text-slate-400 leading-relaxed max-w-2xl">
                            {user?.bio || "No bio provided."}
                        </p>
                    </div>

                    {/* Personal Quick Stats */}
                    <div className="flex md:flex-col gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{counters.commits.toLocaleString()}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Commits</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{counters.repos}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Repos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{counters.prs}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">PRs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal AI Insights */}
            <ErrorBoundary name="Personal Insights">
                <AIInsights userId={user?.id} />
            </ErrorBoundary>

            {/* Personal Commit Graph */}
            <ErrorBoundary name="Personal Commit Graph">
                <AnimatedCommitGraph />
            </ErrorBoundary>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WeeklyActivity />
                <PullRequestStatus />
                <LanguageDistribution />
            </div>

            {/* Contribution Heatmap */}
            <div className="modern-card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Contribution Matrix
                    </h3>
                </div>
                <ContributionHeatmap />
            </div>

            {/* Activity & Repositories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentCommits />
                <TopRepositories />
            </div>

            {/* Achievements */}
            <AchievementsSection />
        </div>
    );

    return (
        <RoleBasedView
            role={userRole}
            managerView={ManagerDashboard}
            memberView={MemberDashboard}
        />
    );
};

export default ProfilePage;
