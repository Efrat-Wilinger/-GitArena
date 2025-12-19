import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { githubApi, Repository } from '../api/github';

// Language colors mapping - Subdued/Professional
const LANGUAGE_COLORS: Record<string, string> = {
    'Python': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'TypeScript': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'JavaScript': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Java': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Go': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Rust': 'bg-red-500/10 text-red-400 border-red-500/20',
    'C++': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'default': 'bg-slate-700/30 text-slate-400 border-slate-700/50'
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

    if (isLoading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
        </div>
    );

    if (error) return (
        <div className="text-center p-12 bg-red-500/5 border border-red-500/10 rounded-xl">
            <h3 className="text-red-400 font-medium mb-2">Unable to load repositories</h3>
            <p className="text-red-400/70 text-sm">Please check your connection and try again.</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-2">
                        Repositories
                    </h1>
                    <p className="text-slate-400 text-sm">Synchronized from your GitHub account</p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="group inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
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
                            <svg className="w-4 h-4 mr-2 text-indigo-200 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Sync Repositories
                        </>
                    )}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Filter repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
            </div>

            {/* Grid */}
            {filteredRepos && filteredRepos.length === 0 ? (
                <div className="text-center py-24 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">No repositories found</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                        Try adjusting your search or click "Sync Repositories" to fetch the latest data from GitHub.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRepos?.map((repo) => {
                        // Mock language data (would come from API normally)
                        const language = ['Python', 'TypeScript', 'JavaScript', 'Java', 'Go'][Math.floor(Math.random() * 5)];
                        const stars = Math.floor(Math.random() * 500);
                        const forks = Math.floor(Math.random() * 100);

                        return (
                            <div
                                key={repo.id}
                                className="group modern-card p-5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/10 hover:-translate-y-1 cursor-pointer"
                                onClick={() => navigate(`/repositories/${repo.id}/commits`)}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-700">
                                            <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                                            {repo.name}
                                        </h3>
                                    </div>
                                    {repo.is_synced && (
                                        <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                                            Synced
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10 leading-relaxed">
                                    {repo.description || 'No description provided.'}
                                </p>

                                {/* Footer Info */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${LANGUAGE_COLORS[language] || LANGUAGE_COLORS.default}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
                                            {language}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                        <div className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {stars}
                                        </div>
                                        <div className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {forks}
                                        </div>
                                    </div>
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
