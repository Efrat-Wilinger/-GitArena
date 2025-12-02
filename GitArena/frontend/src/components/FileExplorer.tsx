import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../api/github';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'dir';
    sha: string;
    size: number;
    url: string;
}

interface FileExplorerProps {
    repoId: number;
    path?: string;
    level?: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ repoId, path = '', level = 0 }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [hoveredFile, setHoveredFile] = useState<string | null>(null);

    const { data: files, isLoading } = useQuery<FileNode[]>({
        queryKey: ['repoTree', repoId, path],
        queryFn: () => githubApi.getRepositoryTree(repoId, path),
    });

    const toggleFolder = (folderPath: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderPath)) {
            newExpanded.delete(folderPath);
        } else {
            newExpanded.add(folderPath);
        }
        setExpandedFolders(newExpanded);
    };

    if (isLoading) {
        return <div className="pl-4 py-1 text-gray-500 text-xs animate-pulse">Loading...</div>;
    }

    // Sort: Directories first, then files
    const sortedFiles = files?.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
    });

    return (
        <div className="font-mono text-sm select-none">
            {sortedFiles?.map((file) => (
                <div key={file.sha}>
                    <div
                        className={`
              relative group flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200
              ${hoveredFile === file.path ? 'bg-gray-800/80' : 'hover:bg-gray-800/50'}
            `}
                        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                        onClick={() => file.type === 'dir' && toggleFolder(file.path)}
                        onMouseEnter={() => file.type === 'file' && setHoveredFile(file.path)}
                        onMouseLeave={() => setHoveredFile(null)}
                    >
                        {/* Icon */}
                        <span className="mr-2 text-gray-400 group-hover:text-cyan-400 transition-colors">
                            {file.type === 'dir' ? (
                                expandedFolders.has(file.path) ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                )
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            )}
                        </span>

                        {/* Name */}
                        <span className={`
              ${file.type === 'dir' ? 'font-bold text-gray-300' : 'text-gray-400'}
              group-hover:text-cyan-300 transition-colors
            `}>
                            {file.name}
                        </span>

                        {/* Hover Card for Files */}
                        {hoveredFile === file.path && file.type === 'file' && (
                            <CommitHoverCard repoId={repoId} path={file.path} />
                        )}
                    </div>

                    {/* Recursive Children */}
                    {file.type === 'dir' && expandedFolders.has(file.path) && (
                        <FileExplorer repoId={repoId} path={file.path} level={level + 1} />
                    )}
                </div>
            ))}
        </div>
    );
};

const CommitHoverCard: React.FC<{ repoId: number; path: string }> = ({ repoId, path }) => {
    const { data: commit, isLoading } = useQuery({
        queryKey: ['lastCommit', repoId, path],
        queryFn: () => githubApi.getCommitForPath(repoId, path),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    if (isLoading) return null;

    return (
        <div className="absolute left-full top-0 ml-4 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 p-4 animate-fade-in-up">
            <div className="absolute left-0 top-4 -ml-2 w-4 h-4 bg-gray-900 border-l border-b border-cyan-500/30 transform rotate-45"></div>

            <div className="flex items-start gap-3 mb-3">
                {commit?.avatar_url ? (
                    <img src={commit.avatar_url} alt={commit.author_name} className="w-10 h-10 rounded-full border-2 border-cyan-500/50" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-400 font-bold">
                        {commit?.author_name?.charAt(0)}
                    </div>
                )}
                <div>
                    <h4 className="text-white font-bold text-sm">{commit?.author_name}</h4>
                    <p className="text-cyan-400 text-xs font-mono">{new Date(commit?.date).toLocaleDateString()}</p>
                </div>
            </div>

            <p className="text-gray-300 text-xs italic border-l-2 border-gray-700 pl-3 py-1 mb-3">
                "{commit?.message}"
            </p>

            <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                <span>SHA: {commit?.sha.substring(0, 7)}</span>
                <span className="text-cyan-500">Latest Commit</span>
            </div>
        </div>
    );
};

export default FileExplorer;
