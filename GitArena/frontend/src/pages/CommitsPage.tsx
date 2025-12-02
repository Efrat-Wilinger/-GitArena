import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { githubApi, Commit } from '../api/github';

const CommitsPage: React.FC = () => {
    const { repoId } = useParams<{ repoId: string }>();
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false);

    const { data: commits, isLoading, error, refetch } = useQuery<Commit[]>({
        queryKey: ['commits', repoId],
        queryFn: () => githubApi.getCommits(Number(repoId), false, 50),
        enabled: !!repoId,
    });

    const handleSync = async () => {
        if (!repoId) return;
        setIsSyncing(true);
        try {
            await githubApi.getCommits(Number(repoId), true, 50);
            await refetch();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div></div>;
    if (error) return <div className="text-center text-red-400 p-8">Failed to load commits</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/repositories')}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-white">Commits</h1>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                >
                    {isSyncing ? 'Syncing...' : 'Sync Commits'}
                </button>
            </div>

            {/* Timeline */}
            <div className="relative border-l border-gray-800 ml-3 space-y-6">
                {commits?.map((commit) => (
                    <div key={commit.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-gray-700 border-2 border-gray-900 ring-2 ring-gray-900"></div>

                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <p className="text-sm font-medium text-white line-clamp-1">{commit.message.split('\n')[0]}</p>
                                <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
                                    {new Date(commit.committed_date).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                                            {commit.author_name.charAt(0).toUpperCase()}
                                        </span>
                                        {commit.author_name}
                                    </span>
                                    <span className="font-mono text-gray-600">{commit.sha.substring(0, 7)}</span>
                                </div>

                                <div className="flex items-center gap-2 font-mono">
                                    <span className="text-emerald-500">+{commit.additions}</span>
                                    <span className="text-red-500">-{commit.deletions}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {commits?.length === 0 && (
                    <div className="pl-8 text-gray-500 text-sm">No commits found.</div>
                )}
            </div>
        </div>
    );
};

export default CommitsPage;
