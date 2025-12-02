import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { githubApi, Repository } from '../api/github';

// Language colors mapping
const LANGUAGE_COLORS: Record<string, string> = {
    'Python': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'TypeScript': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'JavaScript': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Java': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Go': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Rust': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'C++': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Ruby': 'bg-red-500/20 text-red-400 border-red-500/30',
    'PHP': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Swift': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Kotlin': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'default': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const RepositoriesPage: React.FC = () => {
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredRepos = repositories?.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div></div>;
    if (error) return <div className="text-center text-red-400 p-8">Failed to load repositories</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2">
                        Your Repositories
                    </h1>
                    <p className="text-gray-400 text-sm">Manage and sync your GitHub projects</p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="group inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02]"
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
                            <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sync Now
                        </>
                    )}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
                />
            </div>

            {/* Grid */}
            {filteredRepos && filteredRepos.length === 0 ? (
                <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed backdrop-blur-xl">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-gray-400 text-lg">No repositories found.</p>
                    <p className="text-gray-500 text-sm mt-2">Click "Sync Now" to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRepos?.map((repo) => {
                        // Mock language data (in real app, this would come from API)
                        const language = ['Python', 'TypeScript', 'JavaScript', 'Java', 'Go'][Math.floor(Math.random() * 5)];
                        const stars = Math.floor(Math.random() * 500);
                        const forks = Math.floor(Math.random() * 100);

                        return (
                            <div
                                key={repo.id}
                                className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:scale-[1.02] backdrop-blur-xl cursor-pointer"
                                onClick={() => navigate(`/repositories/${repo.id}/commits`)}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                                            {repo.name}
                                        </h3>
                                    </div>
                                    {repo.is_synced && (
                                        <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            ✓ Synced
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                                    {repo.description || 'No description available'}
                                </p>

                                {/* Language Badge */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${LANGUAGE_COLORS[language] || LANGUAGE_COLORS.default}`}>
                                        <span className="w-2 h-2 rounded-full bg-current mr-1.5"></span>
                                        {language}
                                    </span>
                                </div>

                                {/* Footer - Stats and Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span>{stars}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>{forks}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs font-medium text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                        </svg>
                                        View
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RepositoriesPage;
