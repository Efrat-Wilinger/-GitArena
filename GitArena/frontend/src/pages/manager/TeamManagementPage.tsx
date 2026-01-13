import React, { useState, useEffect } from 'react';
import { githubApi } from '../../api/github';
import { useProject } from '../../contexts/ProjectContext';

interface TeamMember {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar_url: string;
    role: 'manager' | 'member';
    joined_at: string;
    stats: {
        commits: number;
        prs: number;
        reviews: number;
    };
    status: 'active' | 'inactive';
}

const TeamManagementPage: React.FC = () => {
    const { currentProjectId } = useProject();
    const [members, setMembers] = useState<TeamMember[]>([]);


    useEffect(() => {
        const fetchMembers = async () => {
            if (!currentProjectId) return;

            try {
                // Fetch project-specific members
                const data = await githubApi.getTeamMembers(currentProjectId.toString());
                // Map API data to component state
                const mappedMembers = data.map((m: any) => ({
                    ...m,
                    avatar: m.avatar_url, // Compatibility with existing JSX
                    joinedAt: m.joined_at,
                    status: 'active' as const
                }));
                setMembers(mappedMembers);
            } catch (error) {
                console.error('Failed to fetch team members:', error);
            }
        };

        fetchMembers();
    }, [currentProjectId]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'member' | 'manager'>('member');

    const handleAddMember = async () => {
        if (!currentProjectId) return;
        try {
            await githubApi.addTeamMember(currentProjectId.toString(), newMemberUsername, newMemberRole);
            setShowAddModal(false);
            setNewMemberUsername('');
            // Re-fetch members
            const data = await githubApi.getTeamMembers(currentProjectId.toString());
            setMembers(data.map((m: any) => ({ ...m, status: 'active' as const })));
        } catch (error) {
            alert('Failed to add member. Make sure the username exists.');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!currentProjectId) return;
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await githubApi.removeTeamMember(currentProjectId.toString(), userId);
                setMembers(prev => prev.filter(m => m.id !== userId));
            } catch (error) {
                alert('Failed to remove member.');
            }
        }
    };

    if (!currentProjectId) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-xl font-bold text-white mb-2">No Project Selected</h3>
                <p className="text-slate-400">Please select a project from the top bar to manage the team.</p>
            </div>
        );
    }


    // Calculate members added this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const membersThisMonth = members.filter(m => {
        const joinedDate = new Date(m.joined_at);
        return joinedDate >= firstDayOfMonth;
    }).length;

    const filteredMembers = members.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="modern-card p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Team Management</h1>
                        <p className="text-slate-400">Manage your team members and permissions</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Member
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mt-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Members', value: members.length, icon: '👥', color: 'blue' },
                    { label: 'Active', value: members.filter(m => m.status === 'active').length, icon: '✅', color: 'green' },
                    { label: 'Managers', value: members.filter(m => m.role === 'manager').length, icon: '👑', color: 'orange' },
                    { label: 'This Month', value: membersThisMonth, icon: '📅', color: 'blue' },
                ].map((stat, i) => (
                    <div key={i} className="modern-card p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">{stat.icon}</span>
                            <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
                        </div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Members List */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Team Members ({filteredMembers.length})
                </h3>

                <div className="space-y-4">
                    {filteredMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-blue-500/20">
                                <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                            </div>


                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-semibold truncate">{member.name}</h4>
                                    {member.role === 'manager' && (
                                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gradient-orange text-white">
                                            Manager
                                        </span>
                                    )}
                                    <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-slate-600'}`}></span>
                                </div>
                                <p className="text-sm text-slate-400 truncate">{member.email}</p>
                            </div>

                            {/* Stats */}
                            <div className="hidden md:flex gap-6 text-sm">
                                <div className="text-center">
                                    <div className="text-blue-400 font-bold">{member.stats.commits}</div>
                                    <div className="text-slate-500 text-xs">Commits</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-blue-400 font-bold">{member.stats.prs}</div>
                                    <div className="text-slate-500 text-xs">PRs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-blue-400 font-bold">{member.stats.reviews}</div>
                                    <div className="text-slate-500 text-xs">Reviews</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                                    title="Remove member"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowAddModal(false)}>
                    <div className="modern-card p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-white mb-6">Add Team Member</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">GitHub Username</label>
                                <input
                                    type="text"
                                    placeholder="username"
                                    value={newMemberUsername}
                                    onChange={(e) => setNewMemberUsername(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                                <select
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="member">Member</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddMember}
                                    className="btn-primary flex-1"
                                    disabled={!newMemberUsername}
                                >
                                    Add Member
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagementPage;
