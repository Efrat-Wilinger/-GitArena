import React, { useState, useEffect } from 'react';
import { githubApi, ActivityItem } from '../../api/github';
import { useProject } from '../../contexts/ProjectContext';

const ActivityJournalPage: React.FC = () => {
    const { currentProjectId } = useProject();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('7days');


    useEffect(() => {
        const fetchActivity = async () => {
            if (!currentProjectId) return;

            setLoading(true);
            try {
                // Fetch project-specific activity
                const data = await githubApi.getActivityLog(currentProjectId.toString(), {
                    type: filter === 'all' ? undefined : filter,
                    dateRange
                });
                setActivities(data);
            } catch (error) {
                console.error('Failed to fetch activity log:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [currentProjectId, filter, dateRange]);


    const getTypeIcon = (type: ActivityItem['type']) => {
        const icons = {
            commit: '📝',
            pr: '🔀',
            review: '👀',
            issue: '🐛',
            merge: '✅',
            deploy: '🚀'
        };
        return icons[type];
    };

    const getTypeColor = (type: ActivityItem['type']) => {
        const colors = {
            commit: 'blue',
            pr: 'indigo',
            review: 'purple',
            issue: 'red',
            merge: 'green',
            deploy: 'orange'
        };
        return colors[type];
    };

    if (!currentProjectId) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-xl font-bold text-white mb-2">No Project Selected</h3>
                <p className="text-slate-400">Please select a project from the top bar to view activity.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="modern-card p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Activity Journal</h1>
                        <p className="text-slate-400">Complete timeline of project activity</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="commit">Commits</option>
                        <option value="pr">Pull Requests</option>
                        <option value="review">Reviews</option>
                        <option value="issue">Issues</option>
                        <option value="merge">Merges</option>
                        <option value="deploy">Deploys</option>
                    </select>

                    {/* Date Range */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                    { type: 'commit', label: 'Commits', count: activities.filter(a => a.type === 'commit').length },
                    { type: 'pr', label: 'Pull Requests', count: activities.filter(a => a.type === 'pr').length },
                    { type: 'review', label: 'Reviews', count: activities.filter(a => a.type === 'review').length },
                    { type: 'issue', label: 'Issues', count: activities.filter(a => a.type === 'issue').length },
                    { type: 'merge', label: 'Merges', count: activities.filter(a => a.type === 'merge').length },
                    { type: 'deploy', label: 'Deploys', count: activities.filter(a => a.type === 'deploy').length },
                ].map((stat) => (
                    <div key={stat.type} className="modern-card p-4 text-center">
                        <div className="text-3xl mb-2">{getTypeIcon(stat.type as ActivityItem['type'])}</div>
                        <div className="text-2xl font-bold text-blue-400 mb-1">{stat.count}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full animate-pulse"></span>
                    Activity Timeline
                </h3>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800"></div>

                    {/* Timeline Items */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-12 text-slate-500">Loading activity...</div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No activities found for this period.</div>
                        ) : activities
                            .filter(act => act.target.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((activity) => (
                                <div key={activity.id} className="relative pl-16 group">
                                    {/* Dot */}
                                    <div className={`absolute left-4 top-2 w-4 h-4 rounded-full bg-${getTypeColor(activity.type)}-500 ring-4 ring-primary-900 group-hover:scale-125 transition-transform`}></div>

                                    {/* Content */}
                                    <div className="modern-card p-4 hover:border-blue-500/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500/20 flex-shrink-0">
                                                    {activity.actor.avatar ? (
                                                        <img src={activity.actor.avatar} alt={activity.actor.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-blue flex items-center justify-center text-white font-bold">
                                                            {activity.actor.name[0]}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-white">{activity.actor.name}</span>
                                                        <span className="text-slate-400 text-sm">{activity.action}</span>
                                                        <span className="text-blue-400 font-mono text-sm truncate">{activity.target}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mb-2">
                                                        {activity.metadata?.description || "Acted on " + activity.target}
                                                    </p>
                                                    {activity.metadata && (activity.metadata.additions || activity.metadata.deletions) && (
                                                        <div className="flex gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <span className="text-green-400">+{activity.metadata.additions || 0}</span>
                                                                <span className="text-red-400">-{activity.metadata.deletions || 0}</span>
                                                            </span>
                                                            {activity.metadata.files && <span>{activity.metadata.files} files changed</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-500 flex-shrink-0">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
export default ActivityJournalPage;
