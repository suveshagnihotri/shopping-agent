'use client';

import { useState, useEffect } from 'react';
import { Save, History, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPanel() {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const res = await fetch('/api/admin/prompt');
            const data = await res.json();
            setPrompts(data);
            if (data.length > 0) {
                setContent(data[0].content);
            }
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Prompt updated successfully!' });
                fetchPrompts();
            } else {
                setMessage({ type: 'error', text: 'Failed to update prompt.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Peeq Admin Panel</h1>
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        Prompt Management
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">System Prompt Editor</span>
                                {prompts[0]?.isActive && (
                                    <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        Version {prompts[0].version} Active
                                    </span>
                                )}
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-[400px] p-4 text-sm font-mono bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none dark:text-gray-300"
                                    placeholder="Enter system prompt here..."
                                />
                                <div className="mt-6 flex items-center justify-between">
                                    {message && (
                                        <div className={`flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            {message.text}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isLoading ? 'Saving...' : 'Save New Version'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                                <History className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Version History</span>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
                                {prompts.map((p) => (
                                    <div key={p._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors cursor-pointer" onClick={() => setContent(p.content)}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">v{p.version}</span>
                                            {p.isActive && (
                                                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">Active</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {new Date(p.createdAt).toLocaleString()}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-500 line-clamp-2 italic">
                                            "{p.content.substring(0, 100)}..."
                                        </div>
                                    </div>
                                ))}
                                {prompts.length === 0 && (
                                    <div className="p-8 text-center text-sm text-gray-500">No history yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
