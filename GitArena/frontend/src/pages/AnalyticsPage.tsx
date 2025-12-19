import React from 'react';

const AnalyticsPage: React.FC = () => {
    // Sample data for charts
    const monthlyCommits = [
        { month: 'Jan', count: 145 },
        { month: 'Feb', count: 168 },
        { month: 'Mar', count: 192 },
        { month: 'Apr', count: 178 },
        { month: 'May', count: 210 },
        { month: 'Jun', count: 195 },
    ];

    const maxCommits = Math.max(...monthlyCommits.map(m => m.count));

    const teamMembers = [
        { name: 'Sarah Chen', commits: 234, prs: 45, reviews: 67, avatar: '👩‍💻' },
        { name: 'Mike Johnson', commits: 189, prs: 38, reviews: 52, avatar: '👨‍💻' },
        { name: 'Alex Rivera', commits: 156, prs: 29, reviews: 41, avatar: '👨‍💻' },
        { name: 'Emma Davis', commits: 142, prs: 31, reviews: 38, avatar: '👩‍💻' },
    ];

    const insights = [
        { icon: '🚀', title: 'Peak Productivity', description: 'Your team commits 40% more on Tuesdays', color: 'blue' },
        { icon: '⚡', title: 'Fast Reviews', description: 'Average PR review time: 2.3 hours', color: 'blue' },
        { icon: '🎯', title: 'Quality Focus', description: '95% of PRs pass CI on first try', color: 'blue' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* Page Header */}
            <div className="modern-card p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
                        <p className="text-slate-400">Insights and metrics for your team</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary text-sm">Export Report</button>
                        <button className="btn-primary text-sm">Share</button>
                    </div>
                </div>
            </div>

            {/* Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, index) => (
                    <div key={index} className="modern-card p-6 hover:border-blue-500/50 transition-all group">
                        <div className="text-4xl mb-4">{insight.icon}</div>
                        <h3 className="text-lg font-bold text-white mb-2">{insight.title}</h3>
                        <p className="text-sm text-slate-400">{insight.description}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Commits Chart */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Commit Trend
                </h3>

                <div className="flex items-end justify-between gap-4 h-64">
                    {monthlyCommits.map((data, index) => {
                        const heightPercentage = (data.count / maxCommits) * 100;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-3">
                                <div className="w-full flex items-end justify-center flex-1">
                                    <div
                                        className="w-full bg-gradient-blue rounded-t-xl transition-all duration-700 hover:opacity-80 cursor-pointer relative group"
                                        style={{ height: `${heightPercentage}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 px-3 py-1.5 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                                            {data.count} commits
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text font-medium text-white">{data.count}</div>
                                    <div className="text-sm text-slate-500 mt-1">{data.month}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Team Leaderboard */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Team Leaderboard
                </h3>

                <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                            {/* Rank */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {index + 1}
                            </div>

                            {/* Avatar & Name */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-3xl">{member.avatar}</div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
                                        {member.name}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6 text-sm flex-shrink-0">
                                <div className="text-center">
                                    <div className="text-blue-400 font-bold">{member.commits}</div>
                                    <div className="text-slate-500 text-xs">Commits</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-blue-400 font-bold">{member.prs}</div>
                                    <div className="text-slate-500 text-xs">PRs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-blue-400 font-bold">{member.reviews}</div>
                                    <div className="text-slate-500 text-xs">Reviews</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Code Quality Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="modern-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Code Health
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Test Coverage', value: 87, color: 'bg-blue-500' },
                            { label: 'Code Quality', value: 92, color: 'bg-blue-600' },
                            { label: 'Documentation', value: 78, color: 'bg-blue-400' },
                        ].map((metric, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-white">{metric.label}</span>
                                    <span className="text-blue-400 font-bold">{metric.value}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                                        style={{ width: `${metric.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modern-card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Velocity Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Avg PR Size', value: '127', unit: 'lines' },
                            { label: 'Review Time', value: '2.3', unit: 'hours' },
                            { label: 'Deploy Freq', value: '8', unit: '/week' },
                            { label: 'Bug Rate', value: '1.2', unit: '%' },
                        ].map((stat, index) => (
                            <div key={index} className="bg-blue-500/10 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-400 mb-1">{stat.value}</div>
                                <div className="text-xs text-slate-400">{stat.label}</div>
                                <div className="text-xs text-slate-500 mt-1">{stat.unit}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AnalyticsPage;
