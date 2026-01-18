import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import apiClient from '@/api/client';
import { toast } from 'react-hot-toast';

interface SpaceDetails {
    id: number;
    name: string;
    description: string;
    owner_id: number;
}

const SettingsPage: React.FC = () => {
    const { currentProjectId, currentProjectName } = useProject();
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // Fetch space details on mount or project change
    const [settings, setSettings] = useState({
        ai: {
            burnoutMonitor: true,
            codeReviewBot: true,
            mentorPersonality: 'mentor', // mentor, strict, friendly
            analysisFrequency: 'daily',
            autoSuggestions: false
        },
        gamification: {
            enableLeaderboard: true,
            xpMultiplier: 1.5,
            showAchievements: true,
            teamQuests: true
        },
        notifications: {
            weeklyDigest: true,
            realTimeAlerts: true,
            securityAlerts: true
        }
    });

    const handleSettingChange = (category: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [key]: value
            }
        }));
    };

    useEffect(() => {
        const fetchSettings = async () => {
            if (!currentProjectId) return;

            setIsLoading(true);
            try {
                const response = await apiClient.get<SpaceDetails>(`/spaces/${currentProjectId}`);
                setFormData({
                    name: response.data.name,
                    description: response.data.description || ''
                });
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast.error("Failed to load project settings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [currentProjectId]);

    const handleSave = async () => {
        if (!currentProjectId) return;

        setIsSaving(true);
        try {
            await apiClient.put(`/spaces/${currentProjectId}`, {
                name: formData.name,
                description: formData.description
            });
            toast.success("Settings saved successfully!");
            // Optionally update context name if it changed, though context usually handles this via other means or requires a refresh
            // window.location.reload(); // Simple refresh to propagate name changes
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'team', label: 'Team', icon: '👥' },
        { id: 'integrations', label: 'Integrations', icon: '🔌' },
        { id: 'ai', label: 'AI Insights', icon: '🤖' },
    ];

    if (!currentProjectId) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                Please select a project to view settings.
            </div>
        );
    }



    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="modern-card p-8 bg-gradient-to-r from-slate-900 to-slate-800 border-none relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        Settings <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">Manager</span>
                    </h1>
                    <p className="text-slate-400">Manage configuration for <span className="text-blue-400">{currentProjectName}</span></p>
                </div>
                <div className="absolute top-0 right-0 p-8 text-9xl opacity-5 text-white pointer-events-none">⚙️</div>
            </div>

            {/* Tabs & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="modern-card p-4 sticky top-6">
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-1'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="modern-card p-8 min-h-[600px]">
                        {isLoading ? (
                            <div className="text-center py-10 text-slate-400 animate-pulse">Loading configuration...</div>
                        ) : (
                            <>
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                                <span>📝</span> Project Identity
                                            </h3>
                                            <div className="grid gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                                    <textarea
                                                        rows={3}
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* AI Insights Settings */}
                                {activeTab === 'ai' && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                                <span>🧠</span> AI Brain Configuration
                                            </h3>
                                            <p className="text-slate-400 text-sm mb-6">Customize how the AI analyzes your team's code and behavior.</p>

                                            <div className="space-y-6">
                                                {/* Mentor Personality */}
                                                <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                                                    <label className="block text-sm font-medium text-white mb-4">🤖 Mentor Personality</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {[
                                                            { id: 'mentor', label: 'Balanced Mentor', desc: 'Constructive & guiding', icon: '🎓' },
                                                            { id: 'strict', label: 'Strict Reviewer', desc: 'High standards only', icon: '👮' },
                                                            { id: 'friendly', label: 'Cheerleader', desc: 'Motivating & fun', icon: '🥳' }
                                                        ].map(p => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => handleSettingChange('ai', 'mentorPersonality', p.id)}
                                                                className={`p-4 rounded-xl border text-left transition-all ${settings.ai.mentorPersonality === p.id
                                                                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                                                                    : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800'
                                                                    }`}
                                                            >
                                                                <div className="text-2xl mb-2">{p.icon}</div>
                                                                <div className="font-bold">{p.label}</div>
                                                                <div className="text-xs opacity-70">{p.desc}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Features Toggles */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                                        <div>
                                                            <div className="text-white font-medium">🔥 Burnout Monitor</div>
                                                            <div className="text-sm text-slate-500">Detects uneven workloads and late-night commits</div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-primary"
                                                            checked={settings.ai.burnoutMonitor}
                                                            onChange={(e) => handleSettingChange('ai', 'burnoutMonitor', e.target.checked)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center items-stretch justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                                        <div>
                                                            <div className="text-white font-medium">💡 Auto Suggestions</div>
                                                            <div className="text-sm text-slate-500">Proactively suggests refactors on PRs</div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-primary"
                                                            checked={settings.ai.autoSuggestions}
                                                            onChange={(e) => handleSettingChange('ai', 'autoSuggestions', e.target.checked)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Team & Gamification */}
                                {(activeTab === 'team' || activeTab === 'gamification') && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                                <span>🎮</span> Gamification & Culture
                                            </h3>

                                            <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 mb-6">
                                                <div className="flex justify-between items-center mb-6">
                                                    <label className="text-white font-medium">✨ XP Multiplier</label>
                                                    <span className="text-blue-400 font-bold font-mono">{settings.gamification.xpMultiplier}x</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="3.0"
                                                    step="0.1"
                                                    value={settings.gamification.xpMultiplier}
                                                    onChange={(e) => handleSettingChange('gamification', 'xpMultiplier', parseFloat(e.target.value))}
                                                    className="range range-primary w-full"
                                                />
                                                <div className="flex justify-between text-xs text-slate-500 mt-2">
                                                    <span>Hardcore (0.5x)</span>
                                                    <span>Standard (1.0x)</span>
                                                    <span>Bonus Event (3.0x)</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                                    <div>
                                                        <div className="text-white font-medium">🏆 Public Leaderboard</div>
                                                        <div className="text-sm text-slate-500">Visible to all members</div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="toggle toggle-success"
                                                        checked={settings.gamification.enableLeaderboard}
                                                        onChange={(e) => handleSettingChange('gamification', 'enableLeaderboard', e.target.checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                                    <div>
                                                        <div className="text-white font-medium">⚔️ Team Quests</div>
                                                        <div className="text-sm text-slate-500">Enable cooperative events</div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="toggle toggle-warning"
                                                        checked={settings.gamification.teamQuests}
                                                        onChange={(e) => handleSettingChange('gamification', 'teamQuests', e.target.checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Integrations Placeholder */}
                                {activeTab === 'integrations' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <h3 className="text-xl font-bold text-white mb-6">Connected Tools</h3>
                                        <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-xl border border-green-500/30">
                                            <div className="flex items-center gap-4">
                                                <div className="text-4xl">🐱</div>
                                                <div>
                                                    <div className="text-white font-bold text-lg">GitHub</div>
                                                    <div className="text-green-400 text-sm flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Connected and Syncing
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn-secondary text-xs">Re-authenticate</button>
                                        </div>
                                        <div className="flex items-center justify-between p-5 bg-slate-800/20 rounded-xl border border-slate-700/50 opacity-60">
                                            <div className="flex items-center gap-4">
                                                <div className="text-4xl grayscale">💬</div>
                                                <div>
                                                    <div className="text-slate-300 font-bold text-lg">Slack / Discord</div>
                                                    <div className="text-slate-500 text-sm">Coming soon</div>
                                                </div>
                                            </div>
                                            <button className="btn-secondary text-xs" disabled>Connect</button>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button Sticky Footer */}
                                <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-end gap-3 sticky bottom-0 bg-slate-900/90 backdrop-blur pb-2">
                                    <button
                                        className="px-6 py-2.5 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                        onClick={() => window.location.reload()}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <span className="animate-spin">⏳</span> : '💾'}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SettingsPage;
