"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { searchParticipant, markAttended, getCounterStats } from "./actions";
import { Loader2, Search, CheckCircle, Ticket, LogOut, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import QrScanner from "@/components/QrScanner";

type Participant = {
    id: string;
    registerNumber: string;
    name: string;
    college: string;
    eventType: string;
    eventName: string;
    attended?: boolean;
    paymentType?: string;
    amount?: number;
    receiptNo?: string | null;
};

type Stats = {
    spotCashAmount: number;
    spotDigitalAmount: number;
    alreadyPaidAmount: number;
    nonAlreadyPaidCount: number;
};

type SearchResult =
    | { error: string; participant?: never; warning?: never }
    | { participant: Participant; warning?: string; error?: never };

export default function CounterDashboard() {
    const router = useRouter();
    const [registerNumber, setRegisterNumber] = useState("");
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [isPendingSearch, startSearchTransition] = useTransition();
    const [isPendingSubmit, startSubmitTransition] = useTransition();
    const [stats, setStats] = useState<Stats | null>(null);

    const fetchStats = useCallback(async () => {
        const res = await getCounterStats();
        if (res.success) setStats(res.stats as Stats);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStats();
    }, [fetchStats]);

    const startSearch = (regNo: string) => {
        if (!regNo) return;
        setError(null);
        setWarning(null);
        setParticipant(null);
        setSuccess(false);

        startSearchTransition(async () => {
            const res = await searchParticipant(regNo) as SearchResult;
            if (res.error) {
                setError(res.error);
            } else if (res.participant) {
                setParticipant(res.participant as Participant);
                if (res.warning) {
                    setWarning(res.warning);
                }
            }
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        startSearch(registerNumber);
    };

    const handleAttended = (formData: FormData) => {
        if (!participant) return;
        formData.append("id", participant.id);
        setError(null);
        setWarning(null);

        startSubmitTransition(async () => {
            const res = await markAttended(formData);
            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(true);
                setParticipant(null);
                setRegisterNumber("");
                fetchStats();
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <header className="bg-white shadow relative z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-tight text-indigo-700 flex items-center gap-2">
                        <Ticket className="w-6 h-6" /> Counter Dashboard
                    </h1>
                    <button
                        onClick={() => router.push("/auth/login")}
                        className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium text-sm transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </header>

            {stats && (
                <div className="bg-indigo-50 border-b border-indigo-100 py-3">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-4 items-center justify-between text-sm">
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-medium text-xs">Spot Cash</span>
                                <span className="text-emerald-700 font-bold">₹{stats.spotCashAmount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-medium text-xs">Spot Digital</span>
                                <span className="text-emerald-700 font-bold">₹{stats.spotDigitalAmount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-medium text-xs">Total Spot Coll</span>
                                <span className="text-indigo-700 font-bold">₹{stats.spotCashAmount + stats.spotDigitalAmount}</span>
                            </div>
                            <div className="flex flex-col pl-4 border-l border-indigo-200">
                                <span className="text-slate-500 font-medium text-xs">Already Paid Total</span>
                                <span className="text-slate-700 font-bold">₹{stats.alreadyPaidAmount}</span>
                            </div>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm flex items-center gap-2">
                            <span className="text-slate-600 font-medium">New Spot Registrations (Excl. Already Paid):</span>
                            <span className="text-indigo-600 font-bold text-base">{stats.nonAlreadyPaidCount}</span>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-lg font-semibold text-slate-800">Scan or Enter Register Number</h2>
                    </div>
                    <div className="p-6">
                        {showScanner ? (
                            <div className="space-y-4">
                                <QrScanner onResult={(res) => {
                                    setRegisterNumber(res);
                                    setShowScanner(false);
                                    startSearch(res);
                                }} />
                                <button type="button" onClick={() => setShowScanner(false)} className="w-full py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors">
                                    Cancel Scanning
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <input
                                    type="text"
                                    value={registerNumber}
                                    onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                                    placeholder="e.g. 8000"
                                    className="flex-grow px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono text-lg uppercase transition-shadow bg-slate-50 focus:bg-white"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="px-4 py-3 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                                    title="Scan QR Code"
                                >
                                    <QrCode className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPendingSearch || !registerNumber}
                                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                                >
                                    {isPendingSearch ? <Loader2 className="animate-spin w-5 h-5" /> : <><Search className="w-5 h-5 mr-2" /> Search</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm font-medium">
                        {error}
                    </div>
                )}

                {warning && (
                    <div className="mb-8 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 shadow-sm font-medium">
                        {warning}
                    </div>
                )}

                {success && (
                    <div className="mb-8 p-6 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                        <h3 className="text-xl font-bold mb-1">Successfully Marked as Attended!</h3>
                        <p className="opacity-90">The participant&apos;s payment status has been recorded securely.</p>
                    </div>
                )}

                {participant && (
                    <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden transform transition-all duration-300">
                        <div className="bg-indigo-600 p-6 text-white text-center">
                            <h2 className="text-2xl font-bold">{participant.name}</h2>
                            <p className="text-indigo-100 mt-1">{participant.college}</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Event Category</span>
                                    <span className="font-medium text-slate-800">{participant.eventType}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Event Name</span>
                                    <span className="font-medium text-slate-800">{participant.eventName}</span>
                                </div>
                            </div>

                            <form key={participant.id} action={handleAttended} className="space-y-5" autoComplete="off">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Payment Type</label>
                                    <select
                                        required
                                        name="paymentType"
                                        defaultValue={participant.paymentType || ""}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-900 focus:ring-indigo-500 bg-slate-50 focus:bg-white appearance-none"
                                    >
                                        <option value="">Select Payment Method...</option>
                                        <option value="Already Paid">Already Paid</option>
                                        <option value="Spot Digital Pay">Spot Digital Pay</option>
                                        <option value="Spot Cash">Spot Cash</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Amount Collected (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        autoComplete="off"
                                        required
                                        min="0"
                                        defaultValue={participant.amount || ""}
                                        placeholder="e.g. 500"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-900 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Receipt No (Optional)</label>
                                    <input
                                        type="text"
                                        name="receiptNo"
                                        autoComplete="off"
                                        defaultValue={participant.receiptNo || ""}
                                        placeholder="Enter transaction ID or receipt no"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-900 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPendingSubmit}
                                    className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 transition-all mt-6"
                                >
                                    {isPendingSubmit ? (
                                        <Loader2 className="animate-spin w-6 h-6" />
                                    ) : (
                                        participant.attended ? "Update Entry Details" : "Mark as Paid & Entered RGF"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
