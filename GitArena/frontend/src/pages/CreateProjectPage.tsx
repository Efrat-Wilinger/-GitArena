import React, { useState } from 'react';
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

    const { data: repositories, isLoading: isLoadingRepos } = useQuery<Repository[]>({
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

    const createSpaceMutation = useMutation({
        mutationFn: async (data: { name: string; description: string; repository_id: number }) => {
            const response = await apiClient.post('/spaces/', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spaces'] });
            navigate('/projects');
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
                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        placeholder="e.g. GitArena 2.0"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                    <textarea
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

                    {isLoadingRepos ? (
                        <div className="animate-pulse h-10 bg-gray-700 rounded-lg"></div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
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
