"use client";

import { useState } from "react";
import { upsertVenues } from "../actions";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Navigation } from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";

export default function AdminVenuesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a CSV file first.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as any[];
                // Expected format: Category, Title, Venue Detail, Google Map Link
                const venues = data.map(row => ({
                    category: row['Category'] || row['category'] || '',
                    title: row['Title'] || row['title'] || '',
                    venueDetail: row['Venue Detail'] || row['venueDetail'] || row['Venue'] || '',
                    googleMapLink: row['Google Map Link'] || row['googleMapLink'] || row['Map Link'] || '',
                })).filter(v => v.category && v.title);

                if (venues.length === 0) {
                    setMessage({ type: 'error', text: 'No valid venues found. Ensure headers are: Category, Title, Venue Detail, Google Map Link.' });
                    setLoading(false);
                    return;
                }

                try {
                    const res = await upsertVenues(venues);
                    if (res?.error) {
                        setMessage({ type: 'error', text: res.error });
                    } else if (res?.success) {
                        setMessage({ type: 'success', text: res.message || 'Venues uploaded successfully!' });
                        setFile(null);
                    }
                } catch (err) {
                    setMessage({ type: 'error', text: 'An unexpected error occurred during upload.' });
                }
                setLoading(false);
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                setMessage({ type: 'error', text: 'Failed to parse the CSV file.' });
                setLoading(false);
            }
        });
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Venue Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload and manage event venues via CSV.</p>
                </div>
                <Link href="/admin" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">CSV Upload</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Upload a CSV file containing your venue details. The first row must be headers:<br />
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">Category</code>,
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono ml-1">Title</code>,
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono ml-1">Venue Detail</code>,
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono ml-1">Google Map Link</code>
                        </p>
                    </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                    />
                    <label
                        htmlFor="csv-upload"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                    >
                        <Upload className={`w-10 h-10 ${file ? 'text-indigo-500' : 'text-slate-400'}`} />
                        <div className="text-sm font-medium text-slate-700">
                            {file ? file.name : 'Click to select a CSV file'}
                        </div>
                        {!file && <div className="text-xs text-slate-500">Only .csv files are supported</div>}
                    </label>
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all
                            ${!file || loading
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow active:scale-[0.98]'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        {loading ? 'Uploading...' : 'Upload Venues'}
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <Navigation className="w-4 h-4 text-slate-500" />
                    How it works
                </h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                    <li>The system will match existing venues by <strong>Category + Title</strong>.</li>
                    <li>If a match is found, it will safely <strong>update</strong> the venue details and map link.</li>
                    <li>If no match is found, it will neatly <strong>create</strong> a new venue record.</li>
                    <li>This ensures you can safely re-upload edited spreadsheets without creating duplicates.</li>
                </ul>
            </div>
        </div>
    );
}
