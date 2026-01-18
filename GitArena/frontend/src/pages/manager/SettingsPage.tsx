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
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'ai', label: 'AI Insights', icon: '🤖' },
        { id: 'security', label: 'Security', icon: '🔒' },
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
            <div className="modern-card p-8">
                <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage configuration for <span className="text-blue-400">{currentProjectName}</span></p>
            </div>

            {/* Tabs & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="modern-card p-4">
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                                        ${activeTab === tab.id
                                            ? 'bg-gradient-blue text-white shadow-lg'
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
                    <div className="modern-card p-8">
                        {isLoading ? (
                            <div className="text-center py-10 text-slate-400">Loading settings...</div>
                        ) : (
                            <>
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-4">Project Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="projectName" className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                                                    <input
                                                        id="projectName"
                                                        name="projectName"
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="projectDescription" className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                                    <textarea
                                                        id="projectDescription"
                                                        name="projectDescription"
                                                        rows={3}
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-800 pt-6">
                                            <h3 className="text-xl font-bold text-white mb-4">Preferences</h3>
                                            <div className="space-y-4">
                                                <label htmlFor="autoSync" className="flex items-center justify-between">
                                                    <span className="text-white">Enable auto-sync</span>
                                                    <input id="autoSync" name="autoSync" type="checkbox" className="toggle" defaultChecked disabled />
                                                </label>
                                                <label htmlFor="publicFeed" className="flex items-center justify-between">
                                                    <span className="text-white">Public activity feed</span>
                                                    <input id="publicFeed" name="publicFeed" type="checkbox" className="toggle" disabled />
                                                </label>
                                                <p className="text-xs text-slate-500 mt-2">* Creating settings for preferences coming soon.</p>
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-6">
                                            <button className="btn-secondary" onClick={() => setActiveTab('general')}>Reset</button>
                                            <button
                                                className="btn-primary"
                                                onClick={handleSave}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Other Tabs Placeholders */}
                                {activeTab !== 'general' && (
                                    <div className="text-center py-10">
                                        <div className="text-4xl mb-4">🚧</div>
                                        <h3 className="text-xl text-white font-bold mb-2">Under Construction</h3>
                                        <p className="text-slate-400">Settings for {tabs.find(t => t.id === activeTab)?.label} are coming soon.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
