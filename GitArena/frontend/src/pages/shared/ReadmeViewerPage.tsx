import React, { useState, useEffect } from 'react';
import { githubApi } from '../../api/github';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ReadmeViewerProps {
    repoId?: string;
    canEdit?: boolean;
}

const ReadmeViewerPage: React.FC<ReadmeViewerProps> = ({ repoId, canEdit = false }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchReadme = async () => {
            if (!repoId) return;
            setLoading(true);
            try {
                const data = await githubApi.getReadme(parseInt(repoId));
                setContent(data.content);
                setEditContent(data.content);
            } catch (error) {
                console.error('Failed to fetch README:', error);
                setContent('# Error\nFailed to load README. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchReadme();
    }, [repoId]);


    const handleSave = async () => {
        if (!repoId) return;
        try {
            await githubApi.updateReadme(parseInt(repoId), editContent);
            setContent(editContent);
            setIsEditing(false);
        } catch (error) {
            alert('Failed to save README.');
        }
    };


    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
                <div className="modern-card p-8 flex items-center justify-center h-96">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="modern-card p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">README</h1>
                        <p className="text-slate-400">Project documentation and getting started guide</p>
                    </div>
                    <div className="flex gap-3">
                        {!isEditing && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                                <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        )}
                        {canEdit && (
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={isEditing ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
                            >
                                {isEditing ? 'Save Changes' : 'Edit'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="modern-card p-8">
                {isEditing ? (
                    <div className="space-y-4">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-96 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Write your README in Markdown..."
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(content);
                                }}
                                className="btn-secondary text-sm"
                            >
                                Cancel
                            </button>
                            <button onClick={handleSave} className="btn-primary text-sm">
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-blue max-w-none">
                        <ReactMarkdown
                            components={{
                                code({ node, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const inline = !match;
                                    return !inline ? (
                                        <SyntaxHighlighter
                                            style={vscDarkPlus as any}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                h1: ({ node, ...props }: any) => <h1 className="text-4xl font-bold text-white mb-4 mt-8" {...props} />,
                                h2: ({ node, ...props }: any) => <h2 className="text-3xl font-bold text-white mb-3 mt-6" {...props} />,
                                h3: ({ node, ...props }: any) => <h3 className="text-2xl font-bold text-white mb-2 mt-4" {...props} />,
                                p: ({ node, ...props }: any) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
                                a: ({ node, ...props }: any) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                                ul: ({ node, ...props }: any) => <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4" {...props} />,
                                ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside text-slate-300 space-y-2 mb-4" {...props} />,
                                blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 my-4" {...props} />,
                            }}
                        >

                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Table of Contents */}
            {!isEditing && (
                <div className="modern-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Table of Contents
                    </h3>
                    <nav className="space-y-2">
                        {['Features', 'Quick Start', 'Tech Stack', 'Documentation', 'Contributing', 'License'].map((section) => (
                            <button
                                key={section}
                                className="block text-blue-400 hover:text-blue-300 text-sm transition-colors"
                            >
                                {section}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
};

export default ReadmeViewerPage;
