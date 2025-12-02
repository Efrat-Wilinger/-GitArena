import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileExplorer from '../components/FileExplorer';

const RepositoryCodePage: React.FC = () => {
    const { repoId } = useParams<{ repoId: string }>();
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
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
                    <h1 className="text-xl font-bold text-white">Code Explorer</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gray-800/50 border-b border-gray-800 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="ml-4 text-xs text-gray-500 font-mono">root/</div>
                </div>

                <div className="p-4 min-h-[500px]">
                    {repoId ? (
                        <FileExplorer repoId={Number(repoId)} />
                    ) : (
                        <div className="text-red-400">Invalid Repository ID</div>
                    )}
                </div>
            </div>

            <div className="text-center text-gray-500 text-xs font-mono">
                <p>Hover over files to see the latest commit details ✨</p>
            </div>
        </div>
    );
};

export default RepositoryCodePage;
