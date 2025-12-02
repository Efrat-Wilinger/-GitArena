import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { githubApi, Repository } from '../api/github';

const RepositoriesPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false);

    const { data: repositories, isLoading, error, refetch } = useQuery<Repository[]>({
        queryKey: ['repositories'],
        queryFn: () => githubApi.getRepositories(false),
    });

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await githubApi.getRepositories(true);
            await refetch();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div></div>;
    if (error) return <div className="text-center text-red-400 p-8">Failed to load repositories</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Repositories</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage and sync your GitHub projects</p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSyncing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Syncing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sync Now
                        </>
                    )}
                </button>
            </div>

            {/* Grid */}
            {repositories && repositories.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
                    <p className="text-gray-400">No repositories found. Click "Sync Now" to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repositories?.map((repo) => (
                        <div
                            key={repo.id}
                            className="group bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-cyan-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-base font-semibold text-white truncate pr-4 group-hover:text-cyan-400 transition-colors">
                                    {repo.name}
                                </h3>
                                {repo.is_synced && (
                                    <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Synced
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                                {repo.description || 'No description available'}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    GitHub
                                </a>
                                <button
                                    onClick={() => navigate(`/repositories/${repo.id}/commits`)}
                                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    View Commits →
                                </button>
                                <button
                                    onClick={() => navigate(`/repositories/${repo.id}/code`)}
                                    className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    View Code →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RepositoriesPage;
