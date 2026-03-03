"use client";

import { useState, useEffect } from "react";
import { upsertVenues } from "../actions";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Navigation } from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";

export default function AdminVenuesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [overwrite, setOverwrite] = useState(false);
    const [adminVenues, setAdminVenues] = useState<any[]>([]);
    const [loadingVenues, setLoadingVenues] = useState(true);

    const loadAdminVenues = async () => {
        setLoadingVenues(true);
        import('../actions').then(m => m.getAdminVenues()).then(res => {
            setAdminVenues(res || []);
            setLoadingVenues(false);
        }).catch(() => setLoadingVenues(false));
    };

    useEffect(() => {
        loadAdminVenues();
    }, []);

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
                // Expected format: Category, Date, Title, Venue Detail, Contact Information, Google Map Link
                const venues = data.map(row => ({
                    category: row['Category'] || row['category'] || '',
                    date: row['Date'] || row['date'] || '',
                    title: row['Title'] || row['title'] || '',
                    venueDetail: row['Venue Detail'] || row['venueDetail'] || row['Venue'] || '',
                    contactInfo: row['Contact Information'] || row['contactInfo'] || row['Contact'] || '',
                    googleMapLink: row['Google Map Link'] || row['googleMapLink'] || row['Map Link'] || '',
                })).filter(v => v.category && v.title);

                if (venues.length === 0) {
                    setMessage({ type: 'error', text: 'No valid venues found. Ensure headers are: Category, Date, Title, Venue Detail, Contact Information, Google Map Link.' });
                    setLoading(false);
                    return;
                }

                try {
                    const res = await upsertVenues(venues, overwrite);
                    if (res?.error) {
                        setMessage({ type: 'error', text: res.error });
                    } else if (res?.success) {
                        setMessage({ type: 'success', text: res.message || 'Venues uploaded successfully!' });
                        setFile(null);
                        loadAdminVenues();
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
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Venue Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload and manage event venues via CSV.</p>
                </div>
                <Link href="/admin" className="text-sm px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 font-medium transition-colors">
                    &larr; Back to Admin Dashboard
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
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono ml-1">Date</code>,
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono ml-1">Title</code>,
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono ml-1">Venue Detail</code>,
                            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono ml-1">Contact Information</code>,
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

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                        <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className="rounded border-slate-300 w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                        Overwrite empty fields with blank data? (Default: Check existing fields)
                    </label>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-all
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
                    <li>The system will match existing venues by <strong>Category + Title + Date</strong> (or Category + Title if Date is empty).</li>
                    <li>If a match is found and "Overwrite" is off, it updates only if the CSV has data. If "Overwrite" is on, blank CSV cells will completely erase existing records for that row.</li>
                    <li>If no match is found, it will safely <strong>create</strong> a new venue record.</li>
                </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Current Venues Directory</h2>
                    <p className="text-sm text-slate-500">View and seamlessly delete obsolete venue entries below.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Category & Date</th>
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold">Venue Detail</th>
                                <th className="px-6 py-4 font-semibold">Contact / Map Link</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingVenues ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Loading stored venues...
                                    </td>
                                </tr>
                            ) : adminVenues.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No venues have been uploaded yet. Upload a CSV to get started.
                                    </td>
                                </tr>
                            ) : (
                                adminVenues.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{v.category}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{v.date || 'No specific date'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal min-w-[200px] text-slate-700 font-medium">
                                            {v.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal min-w-[200px] text-slate-600">
                                            {v.venueDetail || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-600 mb-1 flex items-center gap-1.5 line-clamp-1 max-w-[200px]">
                                                {v.contactInfo ? v.contactInfo : <span className="text-slate-400 italic">No contact</span>}
                                            </div>
                                            <div>
                                                {v.googleMapLink && v.googleMapLink.trim() !== "" ? (
                                                    <a href={v.googleMapLink.startsWith('http') ? v.googleMapLink : `https://${v.googleMapLink}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-emerald-600 hover:underline">
                                                        Open Map Link ↗
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No Map</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to completely erase this venue?")) {
                                                        import('../actions').then(m => m.deleteVenue(v.id)).then(() => loadAdminVenues());
                                                    }
                                                }}
                                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
