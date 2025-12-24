import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
        fontFamily: 'Inter, system-ui, sans-serif',
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
    }
});

interface MermaidProps {
    chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.run({
                nodes: [ref.current],
            });
        }
    }, [chart]);

    return (
        <div className="mermaid overflow-x-auto bg-slate-900/50 p-4 rounded-lg border border-slate-700 my-4 flex justify-center w-full">
            <div ref={ref} className="w-full text-center">
                {chart}
            </div>
        </div>
    );
};

export default Mermaid;
