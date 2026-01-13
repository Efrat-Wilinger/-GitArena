import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi, Quest } from '../api/github';

interface QuestsWidgetProps {
    stats: {
        commits: number;
        prs: number;
        issues: number;
        reviews: number;
    };
    isManager: boolean;
    projectId?: number;
}

export const QuestsWidget: React.FC<QuestsWidgetProps> = ({ stats, isManager, projectId }) => {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newQuest, setNewQuest] = useState<Partial<Quest>>({ metric: 'commits', target: 10 });
    const [error, setError] = useState<string | null>(null);

    // Fetch quests from backend
    const { data: quests = [], isLoading } = useQuery({
        queryKey: ['quests', projectId],
        queryFn: () => githubApi.getQuests(projectId),
    });

    // Create quest mutation
    const createMutation = useMutation({
        mutationFn: (quest: Partial<Quest>) => githubApi.createQuest(quest, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quests', projectId] });
            setIsCreating(false);
            setNewQuest({ metric: 'commits', target: 10 });
            setError(null);
            alert('Quest published successfully! 🚀');
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Failed to publish quest. Please try again.');
        }
    });

    // Delete quest mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => githubApi.deleteQuest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quests', projectId] });
        }
    });

    const handleCreate = () => {
        // Validation
        if (!newQuest.title || newQuest.title.trim().length === 0) {
            setError('Please enter a quest title');
            return;
        }
        if (!newQuest.target || newQuest.target <= 0) {
            setError('Target must be greater than 0');
            return;
        }

        setError(null);
        createMutation.mutate(newQuest);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this quest?')) {
            deleteMutation.mutate(id);
        }
    };

    const getProgress = (quest: Quest) => {
        let current = 0;
        switch (quest.metric) {
            case 'commits': current = stats.commits; break;
            case 'prs': current = stats.prs; break;
            case 'issues': current = stats.issues; break;
            case 'reviews': current = stats.reviews; break;
        }
        return Math.min(100, (current / quest.target) * 100);
    };

    const metricIcons: Record<string, string> = {
        commits: '📝',
        prs: '🔀',
        issues: '🐛',
        reviews: '👀'
    };

    return (
        <div className="modern-card p-6 h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>⚔️</span> Team Quests
                    </h2>
                    <p className="text-sm text-slate-400">Active missions & goals</p>
                </div>
                {isManager && (
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setError(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-lg shadow-blue-500/20"
                    >
                        <span>+</span> New Quest
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : quests.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 italic">No active quests. Start an adventure!</div>
                ) : (
                    quests.map(quest => {
                        const progress = getProgress(quest);
                        const isCompleted = progress >= 100;

                        return (
                            <div
                                key={quest.id}
                                className={`p-4 rounded-xl border transition-all duration-300 relative group ${isCompleted
                                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                                    : 'bg-slate-800/50 border-slate-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white">{quest.title}</h3>
                                    {isManager && (
                                        <button
                                            onClick={() => handleDelete(quest.id)}
                                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Delete quest"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{quest.description}</p>

                                <div className="flex justify-between text-xs mb-1 font-mono text-slate-300">
                                    <span className="flex items-center gap-1">
                                        {metricIcons[quest.metric]} {quest.metric.toUpperCase()}
                                    </span>
                                    <span>{Math.round(progress)}%</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-blue-500'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                {isCompleted && (
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                                        <span>🎁 Reward Unlocked:</span>
                                        <span>{quest.reward}</span>
                                    </div>
                                )}
                                {!isCompleted && (
                                    <div className="text-xs text-slate-500 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <span>Target:</span>
                                            <span className="text-white font-bold">{quest.target}</span>
                                        </div>
                                        {quest.reward && (
                                            <div className="truncate italic">Reward: {quest.reward}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create Modal Overlay */}
            {isCreating && (
                <div
                    className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Create New Quest</h3>
                        <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pb-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Quest Title</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="e.g. Clean Code Sprint"
                                value={newQuest.title || ''}
                                onChange={e => {
                                    setNewQuest({ ...newQuest, title: e.target.value });
                                    if (error) setError(null);
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                            <textarea
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 min-h-[80px]"
                                placeholder="What is this quest about?"
                                value={newQuest.description || ''}
                                onChange={e => setNewQuest({ ...newQuest, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Metric</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                    value={newQuest.metric}
                                    onChange={e => setNewQuest({ ...newQuest, metric: e.target.value as any })}
                                >
                                    <option value="commits">Total Commits</option>
                                    <option value="prs">Merged PRs</option>
                                    <option value="issues">Closed Issues</option>
                                    <option value="reviews">Code Reviews</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Target</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 outline-none"
                                    value={newQuest.target}
                                    onChange={e => {
                                        setNewQuest({ ...newQuest, target: Number(e.target.value) });
                                        if (error) setError(null);
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Reward</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 outline-none placeholder:text-slate-600"
                                placeholder="e.g. 🏆 Bug Hunter Trophy"
                                value={newQuest.reward || ''}
                                onChange={e => setNewQuest({ ...newQuest, reward: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25"
                        >
                            {createMutation.isPending ? 'Publishing...' : 'Publish Quest'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
