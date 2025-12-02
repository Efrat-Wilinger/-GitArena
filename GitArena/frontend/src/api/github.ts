import apiClient from './client';

export interface Repository {
    id: number;
    github_id: string;
    name: string;
    full_name: string;
    description?: string;
    url: string;
    is_synced: boolean;
    last_synced_at?: string;
    created_at: string;
}

export interface Commit {
    id: number;
    sha: string;
    message: string;
    author_name: string;
    author_email: string;
    committed_date: string;
    repository_id: number;
    additions: number;
    deletions: number;
    files_changed: number;
    created_at: string;
}

export const githubApi = {
    getRepositories: async (sync: boolean = false): Promise<Repository[]> => {
        const response = await apiClient.get('/github/repos', {
            params: { sync },
        });
        return response.data;
    },

    getCommits: async (repoId: number, sync: boolean = false, limit: number = 50): Promise<Commit[]> => {
        const response = await apiClient.get(`/github/repos/${repoId}/commits`, {
            params: { sync, limit },
        });
        return response.data;
    },

    getRepositoryTree: async (repoId: number, path?: string): Promise<any[]> => {
        const response = await apiClient.get(`/github/repos/${repoId}/tree`, {
            params: { path }
        });
        return response.data;
    },

    getCommitForPath: async (repoId: number, path: string): Promise<any> => {
        const response = await apiClient.get(`/github/repos/${repoId}/commits/path`, {
            params: { path }
        });
        return response.data;
    }
};
