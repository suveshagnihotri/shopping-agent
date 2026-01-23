'use client';

import { useState, useEffect } from 'react';
import { FileText, ArrowLeft, RefreshCw, Database, HardDrive, Calendar, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface CSVFile {
    name: string;
    size: number;
    records: number;
    lastModified: string;
}

export default function CSVFilesPage() {
    const [files, setFiles] = useState<CSVFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isUploading, setIsUploading] = useState(false);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/csv');
            const data = await res.json();
            setFiles(data);
        } catch (error) {
            console.error('Failed to fetch CSV files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/csv/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                await fetchFiles();
            } else {
                const data = await res.json();
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDownload = async (filename: string) => {
        try {
            const res = await fetch(`/api/admin/csv/download?filename=${encodeURIComponent(filename)}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const data = await res.json();
                alert(data.error || 'Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('An error occurred during download');
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/csv/delete?filename=${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchFiles();
            } else {
                const data = await res.json();
                alert(data.error || 'Deletion failed');
            }
        } catch (error) {
            console.error('Deletion error:', error);
            alert('An error occurred during deletion');
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CSV Data Management</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">View and manage product data sources</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Database className="h-4 w-4" />
                            {isUploading ? 'Uploading...' : 'Upload New CSV'}
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={isUploading}
                            />
                        </label>
                        <button
                            onClick={fetchFiles}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Files</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{files.length}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Records</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {files.reduce((acc, file) => acc + file.records, 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Size</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {formatSize(files.reduce((acc, file) => acc + file.size, 0))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Records</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Modified</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {files.map((file) => (
                                    <tr key={file.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                                    <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {file.records.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {formatSize(file.size)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(file.lastModified).toLocaleDateString()} {new Date(file.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDownload(file.name)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                                                        title="Download CSV"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(file.name)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                                        title="Delete CSV"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {files.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No CSV files found in the root directory.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
