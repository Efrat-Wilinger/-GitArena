import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'team', label: 'Team', icon: '👥' },
        { id: 'integrations', label: 'Integrations', icon: '🔌' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'ai', label: 'AI Insights', icon: '🤖' },
        { id: 'security', label: 'Security', icon: '🔒' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="modern-card p-8">
                <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage your project configuration and preferences</p>
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
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Project Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                                            <input
                                                type="text"
                                                defaultValue="GitArena"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                            <textarea
                                                rows={3}
                                                defaultValue="Team collaboration and productivity platform"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-6">
                                    <h3 className="text-xl font-bold text-white mb-4">Preferences</h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between">
                                            <span className="text-white">Enable auto-sync</span>
                                            <input type="checkbox" className="toggle" defaultChecked />
                                        </label>
                                        <label className="flex items-center justify-between">
                                            <span className="text-white">Public activity feed</span>
                                            <input type="checkbox" className="toggle" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Team Settings */}
                        {activeTab === 'team' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">Team Permissions</h3>
                                <div className="space-y-4">
                                    {[
                                        { permission: 'Create repositories', manager: true, member: false },
                                        { permission: 'Merge pull requests', manager: true, member: true },
                                        { permission: 'Delete branches', manager: true, member: false },
                                        { permission: 'View analytics', manager: true, member: true },
                                    ].map((perm, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                            <span className="text-white">{perm.permission}</span>
                                            <div className="flex gap-6">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input type="checkbox" defaultChecked={perm.manager} />
                                                    <span className="text-slate-400">Manager</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input type="checkbox" defaultChecked={perm.member} />
                                                    <span className="text-slate-400">Member</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Integrations */}
                        {activeTab === 'integrations' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">Connected Services</h3>
                                <div className="space-y-4">
                                    {[
                                        { name: 'GitHub', icon: '🐙', connected: true, status: 'Active' },
                                    ].map((service) => (
                                        <div key={service.name} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{service.icon}</span>
                                                <div>
                                                    <span className="text-white font-medium block">{service.name}</span>
                                                    <span className="text-xs text-green-400">{service.status}</span>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-sm font-medium">
                                                Connected
                                            </span>
                                        </div>
                                    ))}
                                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <p className="text-sm text-blue-300">
                                            <strong>Note:</strong> Additional integrations (Slack, Jira, Discord) are planned for future releases.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Settings */}
                        {activeTab === 'ai' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4">AI Configuration</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-medium">Enable AI Insights</div>
                                            <div className="text-sm text-slate-400">Get intelligent recommendations</div>
                                        </div>
                                        <input type="checkbox" className="toggle" defaultChecked />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-medium">Code Quality Analysis</div>
                                            <div className="text-sm text-slate-400">Automatically analyze code quality</div>
                                        </div>
                                        <input type="checkbox" className="toggle" defaultChecked />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-medium">Productivity Insights</div>
                                            <div className="text-sm text-slate-400">Track team productivity patterns</div>
                                        </div>
                                        <input type="checkbox" className="toggle" defaultChecked />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Save Button with Warning */}
                        <div className="mt-8 space-y-4">
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                <p className="text-sm text-orange-300">
                                    <strong>⚠️ Note:</strong> Settings functionality is currently in development. Changes will not be saved until backend integration is complete.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button className="btn-secondary" disabled>Cancel</button>
                                <button className="btn-primary opacity-50 cursor-not-allowed" disabled>Save Changes (Coming Soon)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
