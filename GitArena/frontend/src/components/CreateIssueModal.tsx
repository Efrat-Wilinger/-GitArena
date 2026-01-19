import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi } from '../api/github';

interface CreateIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [repoId, setRepoId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: repos = [] } = useQuery({
        queryKey: ['repositories'],
        queryFn: () => githubApi.getRepositories(),
    });

    const mutation = useMutation({
        mutationFn: async () => {
            if (!repoId) throw new Error("Please select a repository");
            return githubApi.createIssue(repoId, title, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userTasks'] }); // Refresh tasks on MyWorkPage
            onClose();
            setTitle('');
            setBody('');
            setRepoId(null);
            setError(null);
            alert('Task created successfully! 🚀');
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to create task';
            setError(errorMessage);
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">Create New Task</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Repository</label>
                        <select
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            value={repoId || ''}
                            onChange={e => setRepoId(Number(e.target.value))}
                            required
                        >
                            <option value="">Select Repository...</option>
                            {repos.map(r => (
                                <option key={r.id} value={r.id}>{r.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                        <textarea
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                            placeholder="Add more details..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {mutation.isPending ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIssueModal;
