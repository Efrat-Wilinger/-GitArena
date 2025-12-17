import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient' | 'glow';
    hover?: boolean;
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
    variant = 'default',
    hover = true,
    children,
    className = '',
    ...props
}) => {
    const baseClasses = 'rounded-xl p-6 transition-all duration-300';

    const variantClasses = {
        default: 'bg-gray-800 border border-gray-700',
        glass: 'card-glass',
        gradient: 'card-gradient-border',
        glow: 'bg-gray-800 border border-gray-700',
    };

    const hoverClasses = hover ? 'card-hover-lift cursor-pointer' : '';

    const glowClass = variant === 'glow' ? 'hover:glow-cyan' : '';

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${glowClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
