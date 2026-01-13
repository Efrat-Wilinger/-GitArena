import { apiClient } from './client';

export interface AIFeedbackQuery {
    userId?: number;
    repositoryId?: number;
    limit?: number;
}

export interface AIAnalysisResult {
    success: boolean;
    insight?: string;
    metrics?: {
        code_quality_score: number;
        code_volume: number;
        effort_score: number;
        velocity_score: number;
        consistency_score: number;
    };
}

export const aiApi = {
    /**
     * Get AI-generated insights for a user
     */
    getInsights: async (userId?: number) => {
        const url = userId ? `/ai/insights?user_id=${userId}` : '/ai/insights';
        const response = await apiClient.get(url);
        return response.data;
    },

    /**
     * Get code review feedback from AI
     */
    getCodeReview: async (content: string, context?: string) => {
        const response = await apiClient.post('/ai/code-review', {
            content,
            context
        });
        return response.data;
    },

    /**
     * Get team analysis for a repository
     */
    getRepositoryTeamAnalysis: async (repositoryId: number) => {
        const response = await apiClient.get(`/ai/repository/${repositoryId}/team-analysis`);
        return response.data;
    },

    /**
     * Get feedback history with performance metrics
     */
    getFeedbackHistory: async (params: AIFeedbackQuery) => {
        const queryParams = new URLSearchParams();
        if (params.userId) queryParams.append('user_id', params.userId.toString());
        if (params.repositoryId) queryParams.append('repository_id', params.repositoryId.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/ai/feedback/history?${queryParams.toString()}`);
        return response.data;
    },

    /**
     * Auto-analyze repository team
     */
    autoAnalyzeRepository: async (repositoryId: number, force: boolean = false) => {
        const response = await apiClient.post(
            `/ai/repository/${repositoryId}/auto-analyze?force=${force}`
        );
        return response.data;
    },

    /**
     * Analyze a specific activity (commit, PR, review)
     */
    analyzeActivity: async (
        userId: number,
        repositoryId: number,
        activityType: string,
        activityData: any
    ): Promise<AIAnalysisResult> => {
        const response = await apiClient.post('/ai/activity/analyze', {
            user_id: userId,
            repository_id: repositoryId,
            activity_type: activityType,
            activity_data: activityData
        });
        return response.data;
    }
};
