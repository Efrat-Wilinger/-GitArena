import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

interface ParticleEffectProps {
    trigger?: boolean;
    count?: number;
    colors?: string[];
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
    trigger = false,
    count = 30,
    colors = ['#3b82f6', '#60a5fa', '#93c5fd']
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (!trigger) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create particles
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        particlesRef.current = Array.from({ length: count }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;

            return {
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0,
                maxLife: 60 + Math.random() * 40,
                size: 2 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)]
            };
        });

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravity
                particle.life++;

                const opacity = 1 - (particle.life / particle.maxLife);

                if (particle.life < particle.maxLife) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                    ctx.fill();
                    return true;
                }
                return false;
            });

            if (particlesRef.current.length > 0) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [trigger, count, colors]);

    return (
        <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="absolute inset-0 pointer-events-none"
        />
    );
};

// Achievement unlock animation
export const AchievementUnlockAnimation: React.FC<{ show: boolean; onComplete?: () => void }> = ({
    show,
    onComplete
}) => {
    useEffect(() => {
        if (show && onComplete) {
            const timer = setTimeout(onComplete, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="relative">
                <ParticleEffect trigger={show} count={50} />
                <div className="modern-card p-12 text-center relative z-10"
                    style={{ animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
                    <div className="text-8xl mb-4 animate-bounce">🏆</div>
                    <h2 className="text-3xl font-bold text-white mb-2">Achievement Unlocked!</h2>
                    <p className="text-slate-400">You've earned a new badge</p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes bounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default ParticleEffect;
