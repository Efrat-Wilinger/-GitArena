import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, User } from '../../api/auth';
import { githubApi } from '../../api/github';

import AIInsights from '../../components/AIInsights';
import AIPerformanceDashboard from '../../components/AIPerformanceDashboard';
import AnimatedCommitGraph from '../../components/AnimatedCommitGraph';
import { WeeklyActivity, PullRequestStatus, LanguageDistribution } from '../../components/DashboardWidgets';
import ContributionHeatmap from '../../components/ContributionHeatmap';
import { AchievementsSection } from '../../components/AchievementBadge';

const MemberDashboardPage: React.FC = () => {
    const { data: user } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    const { data: gamification } = useQuery({
        queryKey: ['gamificationStats'],
        queryFn: () => githubApi.getGamificationStats(),
    });

    const { data: dashboard } = useQuery({
        queryKey: ['userDashboard'],
        queryFn: () => authApi.getUserDashboard(),
    });


    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Welcome Header */}
            <div className="modern-card p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-blue-500/20">
                        <img src={user?.avatar_url} alt={user?.username} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Welcome back, {user?.name || user?.username}! 👋
                        </h1>
                        <p className="text-slate-400">Here's your personal productivity overview</p>
                    </div>

                    {/* Level Badge */}
                    <div className="text-center px-6 py-4 rounded-xl bg-gradient-blue shadow-lg shadow-blue-500/20">
                        <div className="text-3xl font-bold text-white">{gamification?.level || 1}</div>
                        <div className="text-xs text-blue-100 uppercase tracking-wide">Level</div>
                    </div>

                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total XP', value: gamification?.totalXp || 0, subtext: 'lifetime', icon: '📝' },
                    { label: 'Current XP', value: gamification?.xp || 0, subtext: 'this level', icon: '📅' },
                    { label: 'Streak', value: gamification?.streak || 0, subtext: 'days', icon: '🔥' },
                    { label: 'Achievements', value: gamification?.achievements?.length || 0, subtext: 'unlocked', icon: '⭐' },
                ].map((stat, i) => (
                    <div key={i} className="modern-card p-6 text-center hover:scale-105 transition-transform group">
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-400 uppercase">{stat.label}</div>
                        <div className="text-xs text-slate-500">{stat.subtext}</div>
                    </div>
                ))}
            </div>


            {/* AI Personal Insights */}
            <AIInsights userId={user?.id} />

            {/* AI Performance Dashboard - NEW! */}
            <AIPerformanceDashboard userId={user?.id} />

            {/* Personal Activity - Real Data */}
            <AnimatedCommitGraph />

            {/* Weekly Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WeeklyActivity data={dashboard?.weekly_activity} />
                <PullRequestStatus data={dashboard?.pr_status} />
                <LanguageDistribution data={dashboard?.languages} />
            </div>

            {/* Contribution Matrix */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Your Contributions
                </h3>
                <ContributionHeatmap data={dashboard?.heatmap_data} />
            </div>

            {/* Achievements */}
            <AchievementsSection />
        </div>
    );
};

export default MemberDashboardPage;
