import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
    topSkill: string;
    aiSuperpower: string;
    efficiency: number;
}

const mockTeamMembers: TeamMember[] = [
    { id: 1, name: 'Efrat Wilinger', role: 'Full Stack', avatar: 'https://ui-avatars.com/api/?name=EW&background=0D8ABC&color=fff', topSkill: 'Frontend Architecture', aiSuperpower: 'Rapid Resolver 🚀', efficiency: 95 },
    { id: 2, name: 'Tzur Deke', role: 'Backend Lead', avatar: 'https://ui-avatars.com/api/?name=TD&background=eb4034&color=fff', topSkill: 'microservices', aiSuperpower: 'System Architect 🏗️', efficiency: 92 },
    { id: 3, name: 'Adi Toubin', role: 'DevOps', avatar: 'https://ui-avatars.com/api/?name=AT&background=10b981&color=fff', topSkill: 'CI/CD Pipelines', aiSuperpower: 'Automation Wizard ⚡', efficiency: 88 },
];

const skillsData = [
    { subject: 'Frontend', A: 120, fullMark: 150 },
    { subject: 'Backend', A: 98, fullMark: 150 },
    { subject: 'DevOps', A: 86, fullMark: 150 },
    { subject: 'Testing', A: 99, fullMark: 150 },
    { subject: 'Design', A: 85, fullMark: 150 },
    { subject: 'Security', A: 65, fullMark: 150 },
];

const workDistributionData = [
    { name: 'Feature Work', value: 45 },
    { name: 'Bug Fixes', value: 25 },
    { name: 'Refactoring', value: 20 },
    { name: 'Reviews', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TeamAIAnalytics: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">🔮</span> Team AI Intelligence
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills Radar Chart */}
                <div className="modern-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Team Skill Matrix</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#374151' }} />
                                <Radar
                                    name="Team Capabilities"
                                    dataKey="A"
                                    stroke="#8884d8"
                                    strokeWidth={3}
                                    fill="#8884d8"
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Work Distribution Pie Chart */}
                <div className="modern-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Workload Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={workDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {workDistributionData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Team Heroes Table */}
            <div className="modern-card p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>🦸‍♀️</span> Team Heroes Analysis
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-slate-400">
                                <th className="pb-4 pl-4">Member</th>
                                <th className="pb-4">Role</th>
                                <th className="pb-4">Top Skill</th>
                                <th className="pb-4">AI Superpower</th>
                                <th className="pb-4 text-center">Efficiency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {mockTeamMembers.map((member) => (
                                <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4 flex items-center gap-3">
                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                        <span className="font-medium text-white">{member.name}</span>
                                    </td>
                                    <td className="py-4 text-slate-300">{member.role}</td>
                                    <td className="py-4">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm border border-blue-500/30">
                                            {member.topSkill}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                            {member.aiSuperpower}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center text-white">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${member.efficiency}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm">{member.efficiency}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamAIAnalytics;
