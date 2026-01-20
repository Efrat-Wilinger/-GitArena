import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { githubApi, Repository } from '../api/github';
import apiClient from '../api/client';

const CreateProjectPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);

    const { data: repositories, isLoading: isLoadingRepos, isError: isErrorRepos, refetch: refetchRepos } = useQuery<Repository[]>({
        queryKey: ['repositories'],
        queryFn: () => githubApi.getRepositories(false),
    });

    const { data: existingSpaces } = useQuery<any[]>({
        queryKey: ['spaces'],
        queryFn: async () => {
            const response = await apiClient.get('/spaces/');
            return response.data;
        }
    });

    // Filter out repositories that are already linked to a space
    const availableRepositories = repositories?.filter(repo => {
        // Check if this repo ID exists in any of the existing spaces' repositories
        const isAlreadyImported = existingSpaces?.some(space =>
            space.repositories?.some((r: any) => r.github_id === String(repo.id) || r.id === repo.id)
        );
        return !isAlreadyImported;
    });

    // Auto-sync on mount if no unlinked repositories are found
    useEffect(() => {
        if (repositories && availableRepositories?.length === 0) {
            syncMutation.mutate();
        }
    }, [repositories?.length, availableRepositories?.length]);

    const syncMutation = useMutation({
        mutationFn: () => githubApi.getRepositories(true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['repositories'] });
        },
    });

    const createSpaceMutation = useMutation({
        mutationFn: async (data: { name: string; description: string; repository_id: number }) => {
            const response = await apiClient.post('/spaces/', data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['spaces'] });
            navigate(`/projects/${data.id}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRepoId) return;

        createSpaceMutation.mutate({
            name,
            description,
            repository_id: selectedRepoId,
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Create New Project</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                    <input
                        id="projectName"
                        name="projectName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        placeholder="e.g. GitArena 2.0"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none h-24"
                        placeholder="Project description..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Link Repository</label>
                    <p className="text-xs text-gray-500 mb-3">
                        Select a GitHub repository. Contributors will be automatically invited as team members.
                    </p>

                    {isErrorRepos ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                            <p className="text-red-400 text-sm mb-2">Failed to load repositories</p>
                            <button
                                onClick={() => refetchRepos()}
                                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded transition"
                            >
                                Retry
                            </button>
                        </div>
                    ) : isLoadingRepos ? (
                        <div className="animate-pulse h-10 bg-gray-700 rounded-lg"></div>
                    ) : (repositories?.length === 0) ? (
                        <div className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-sm mb-2">No repositories found on GitHub.</p>
                            <p className="text-xs text-gray-500 mb-3">Sync your account if you just added a new repo.</p>
                            <button
                                type="button"
                                disabled={syncMutation.isPending}
                                onClick={() => syncMutation.mutate()}
                                className="text-cyan-400 hover:text-cyan-300 text-xs disabled:opacity-50"
                            >
                                {syncMutation.isPending ? 'Syncing...' : 'Sync from GitHub'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {availableRepositories?.map((repo) => (
                                    <div
                                        key={repo.id}
                                        onClick={() => setSelectedRepoId(repo.id)}
                                        className={`
                                            p-3 rounded-lg border cursor-pointer transition-all
                                            ${selectedRepoId === repo.id
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{repo.name}</span>
                                            {selectedRepoId === repo.id && (
                                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Show Linked Repositories */}
                            {repositories && repositories.length > availableRepositories?.length! && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Already Project-Linked</p>
                                    <div className="grid grid-cols-1 gap-2 opacity-60">
                                        {repositories.filter(repo => !availableRepositories?.some(a => a.id === repo.id)).map(repo => (
                                            <div key={repo.id} className="p-3 rounded-lg border border-gray-800 bg-black/20 flex items-center justify-between text-gray-500 text-sm">
                                                <span>{repo.name}</span>
                                                <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded uppercase">In Project</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={syncMutation.isPending}
                                onClick={() => syncMutation.mutate()}
                                className="w-full py-2 text-xs text-cyan-400 hover:text-cyan-300 transition border border-dashed border-cyan-500/30 rounded-lg mt-2"
                            >
                                {syncMutation.isPending ? 'Refreshing...' : 'Not seeing a repo? Refresh GitHub data'}
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!selectedRepoId || createSpaceMutation.isPending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {createSpaceMutation.isPending ? 'Creating Project & Inviting Team...' : 'Create Project'}
                </button>
            </form>
        </div>
    );
};

export default CreateProjectPage;
