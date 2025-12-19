import React, { useState, useEffect } from 'react';
import { githubApi } from '../../api/github';



const MyWorkPage: React.FC = () => {

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pr' | 'issue' | 'review'>('all');

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                // TODO: Get real userId from auth context
                const data = await githubApi.getUserTasks(1);
                setTasks(data);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const myPRs = tasks.filter(t => t.type === 'pr');
    const reviewsNeeded = tasks.filter(t => t.type === 'review');
    const assignedIssues = tasks.filter(t => t.type === 'issue');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="modern-card p-8">
                <h1 className="text-4xl font-bold text-white mb-2">My Work</h1>
                <p className="text-slate-400">Your assigned tasks, PRs, and reviews</p>

                {/* Filters */}
                <div className="mt-6 flex gap-3">
                    {[
                        { id: 'all', label: 'All', icon: '📋' },
                        { id: 'pr', label: 'Pull Requests', icon: '🔀' },
                        { id: 'issue', label: 'Issues', icon: '🐛' },
                        { id: 'review', label: 'Reviews', icon: '👀' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                                ${filter === tab.id
                                    ? 'bg-gradient-blue text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Open PRs', value: myPRs.length, color: 'blue' },
                    { label: 'Pending Reviews', value: reviewsNeeded.length, color: 'orange' },
                    { label: 'Active Issues', value: assignedIssues.length, color: 'red' },
                    { label: 'Task Completion', value: '85%', color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="modern-card p-6 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tasks List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Pull Requests */}
                <div className="modern-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        My Pull Requests ({myPRs.length})
                    </h3>
                    <div className="space-y-3">
                        {myPRs.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4">No active pull requests.</p>
                        ) : myPRs.map((task) => (
                            <a href={task.url} target="_blank" rel="noopener noreferrer" key={task.id} className="block p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium truncate">
                                            {task.title}
                                        </h4>
                                        <p className="text-sm text-slate-500">{task.repo} • #{task.number}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-400`}>
                                        Open
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Reviews Needed */}
                <div className="modern-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                        Reviews Needed ({reviewsNeeded.length})
                    </h3>
                    <div className="space-y-3">
                        {reviewsNeeded.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4">No pending reviews.</p>
                        ) : reviewsNeeded.map((task) => (
                            <a href={task.url} target="_blank" rel="noopener noreferrer" key={task.id} className="block p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-orange flex-shrink-0 flex items-center justify-center text-white font-bold">!</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium truncate">
                                            {task.title}
                                        </h4>
                                        <p className="text-sm text-slate-500">{task.repo} • #{task.number}</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Assigned Issues */}
            <div className="modern-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                    Assigned Issues ({assignedIssues.length})
                </h3>
                <div className="space-y-3">
                    {assignedIssues.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4">No assigned issues.</p>
                    ) : assignedIssues.map((task) => (
                        <a href={task.url} target="_blank" rel="noopener noreferrer" key={task.id} className="block p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {task.priority.toUpperCase()} Priority
                                        </span>
                                        <span className="text-slate-500 text-sm">{task.repo}</span>
                                    </div>
                                    <h4 className="text-white font-medium mb-1">
                                        {task.title}
                                    </h4>
                                </div>
                                <button className="btn-primary text-sm flex-shrink-0">
                                    View on GitHub
                                </button>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default MyWorkPage;
