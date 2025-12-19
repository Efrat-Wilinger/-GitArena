import React, { useEffect, useState, useRef } from 'react';

interface TeamMember {
    id: string;
    name: string;
    avatar: string;
    contributions: number;
}

interface Collaboration {
    from: string;
    to: string;
    strength: number; // 1-10
}

export const TeamCollaborationNetwork: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [members] = useState<TeamMember[]>([
        { id: '1', name: 'You', avatar: '👤', contributions: 234 },
        { id: '2', name: 'Sarah', avatar: '👩‍💻', contributions: 189 },
        { id: '3', name: 'Mike', avatar: '👨‍💻', contributions: 156 },
        { id: '4', name: 'Alex', avatar: '👨‍💻', contributions: 142 },
        { id: '5', name: 'Emma', avatar: '👩‍💻', contributions: 128 },
    ]);

    const [collaborations] = useState<Collaboration[]>([
        { from: '1', to: '2', strength: 8 },
        { from: '1', to: '3', strength: 6 },
        { from: '2', to: '3', strength: 9 },
        { from: '2', to: '4', strength: 5 },
        { from: '3', to: '5', strength: 7 },
        { from: '4', to: '5', strength: 6 },
    ]);

    const [hoveredMember, setHoveredMember] = useState<string | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 120;

        // Position members in a circle
        const positions = members.map((_, index) => ({
            x: centerX + radius * Math.cos((index * 2 * Math.PI) / members.length - Math.PI / 2),
            y: centerY + radius * Math.sin((index * 2 * Math.PI) / members.length - Math.PI / 2),
        }));

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            collaborations.forEach((collab) => {
                const fromIndex = members.findIndex(m => m.id === collab.from);
                const toIndex = members.findIndex(m => m.id === collab.to);

                if (fromIndex === -1 || toIndex === -1) return;

                const from = positions[fromIndex];
                const to = positions[toIndex];

                const isHighlighted = hoveredMember === collab.from || hoveredMember === collab.to;

                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = isHighlighted
                    ? `rgba(59, 130, 246, ${collab.strength / 10})`
                    : `rgba(100, 116, 139, ${collab.strength / 20})`;
                ctx.lineWidth = isHighlighted ? 3 : 2;
                ctx.stroke();

                // Draw strength indicator (animated pulse)
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                const pulseSize = 3 + Math.sin(Date.now() / 500) * 2;

                if (isHighlighted) {
                    ctx.beginPath();
                    ctx.arc(midX, midY, pulseSize, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
                    ctx.fill();
                }
            });

            // Draw members
            members.forEach((member, index) => {
                const pos = positions[index];
                const isHovered = hoveredMember === member.id;
                const nodeSize = isHovered ? 35 : 30;

                // Glow effect
                if (isHovered) {
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, nodeSize + 5, 0, Math.PI * 2);
                    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeSize + 5);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }

                // Node circle
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? '#3b82f6' : '#1e3a8a';
                ctx.fill();
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Name label
                ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(member.name, pos.x, pos.y + nodeSize + 20);

                // Contribution count
                if (isHovered) {
                    ctx.font = '10px Inter, sans-serif';
                    ctx.fillStyle = '#60a5fa';
                    ctx.fillText(`${member.contributions} commits`, pos.x, pos.y + nodeSize + 35);
                }
            });

            requestAnimationFrame(animate);
        };

        animate();
    }, [members, collaborations, hoveredMember]);

    const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 120;

        const positions = members.map((_, index) => ({
            x: centerX + radius * Math.cos((index * 2 * Math.PI) / members.length - Math.PI / 2),
            y: centerY + radius * Math.sin((index * 2 * Math.PI) / members.length - Math.PI / 2),
        }));

        let found = null;
        positions.forEach((pos, index) => {
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            if (distance < 35) {
                found = members[index].id;
            }
        });

        setHoveredMember(found);
    };

    return (
        <div className="modern-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Team Collaboration
            </h3>

            <div className="flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="cursor-pointer"
                    onMouseMove={handleCanvasHover}
                    onMouseLeave={() => setHoveredMember(null)}
                />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <div className="text-2xl font-bold text-blue-400">{members.length}</div>
                    <div className="text-xs text-slate-400">Team Members</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <div className="text-2xl font-bold text-blue-400">{collaborations.length}</div>
                    <div className="text-xs text-slate-400">Active Collaborations</div>
                </div>
            </div>
        </div>
    );
};

export default TeamCollaborationNetwork;
