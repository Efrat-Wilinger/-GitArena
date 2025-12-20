import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { githubApi, Commit } from '../api/github';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CommitsPage: React.FC = () => {
    const { repoId } = useParams<{ repoId: string }>();
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(false);
    const [expandedCommitId, setExpandedCommitId] = useState<number | null>(null);

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

                        <div
                            className={`bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-all ${expandedCommitId === commit.id ? 'ring-2 ring-cyan-500/30 border-cyan-500/50' : ''}`}
                            onClick={() => setExpandedCommitId(expandedCommitId === commit.id ? null : commit.id)}
                        >
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

                            {/* Diff Viewer */}
                            {expandedCommitId === commit.id && commit.diff_data && commit.diff_data.length > 0 && (
                                <div className="mt-6 space-y-4 border-t border-gray-700/50 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Changed Files ({commit.diff_data.length})</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {commit.diff_data.map((file, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center justify-between text-[11px] bg-gray-900/50 p-2 rounded border border-gray-700/50">
                                                    <span className="text-gray-300 font-mono truncate">{file.filename}</span>
                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                        <span className="text-emerald-500/80">+{file.additions}</span>
                                                        <span className="text-red-500/80">-{file.deletions}</span>
                                                        <span className={`px-1.5 py-0.5 rounded ${file.status === 'added' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            file.status === 'removed' ? 'bg-red-500/10 text-red-500' :
                                                                'bg-blue-500/10 text-blue-500'
                                                            } text-[10px] capitalize`}>{file.status}</span>
                                                    </div>
                                                </div>
                                                {file.patch && (
                                                    <div className="rounded overflow-hidden text-[10px] border border-gray-700/30">
                                                        <SyntaxHighlighter
                                                            language="diff"
                                                            style={vscDarkPlus}
                                                            customStyle={{
                                                                margin: 0,
                                                                padding: '12px',
                                                                background: '#0d1117',
                                                                fontFamily: 'monospace'
                                                            }}
                                                        >
                                                            {file.patch}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {expandedCommitId === commit.id && (!commit.diff_data || commit.diff_data.length === 0) && (
                                <div className="mt-4 p-4 text-center bg-gray-900/50 rounded-lg border border-gray-700/50">
                                    <p className="text-xs text-gray-500 italic">No detailed diff data available for this commit.</p>
                                    <p className="text-[10px] text-gray-600 mt-1">Try syncing commits if data is missing.</p>
                                </div>
                            )}
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
