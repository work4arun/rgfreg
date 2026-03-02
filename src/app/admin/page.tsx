"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, getUsers, createUser, deleteUser, resetPassword, deleteParticipant } from "./actions";
import { Loader2, Users, IndianRupee, Download, Plus, Trash2, Shield, UserRound } from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const statsData = await getDashboardStats(startDate, endDate);
            const usersData = await getUsers();
            setStats(statsData);
            setUsers(usersData);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [startDate, endDate]);

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const res = await createUser(formData);
        if (res?.error) {
            alert(res.error);
        } else {
            alert(`User ${formData.get("username")} created successfully!`);
            e.currentTarget.reset();
            loadData();
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            await deleteUser(id);
            loadData();
        }
    };

    const handleResetPassword = async (id: string) => {
        const newPwd = prompt("Enter new password for this user (min 6 chars):");
        if (!newPwd) return;
        const formData = new FormData();
        formData.append("id", id);
        formData.append("newPassword", newPwd);

        const res = await resetPassword(formData);
        if (res?.error) {
            alert(res.error);
        } else {
            alert("Password updated successfully.");
        }
    };

    const handleDeleteParticipant = async (id: string, name: string) => {
        if (confirm(`WARNING: Are you sure you want to delete the registration for ${name}?`)) {
            const confirmText = prompt(`Type DELETE to permanently remove ${name}'s registration:`);
            if (confirmText === "DELETE") {
                const res = await deleteParticipant(id);
                if (res?.error) {
                    alert(res.error);
                } else {
                    alert("Registration deleted successfully.");
                    loadData();
                }
            } else {
                alert("Deletion cancelled.");
            }
        }
    };

    const exportCSV = () => {
        if (!stats || !stats.allParticipants) return;

        const worksheet = XLSX.utils.json_to_sheet(stats.allParticipants);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

        // Create Summary Sheet
        const summaryData = [
            ["Category", "Total Registered", "Total Cash (₹)"],
            ...stats.categoryStats.map((s: any) => [s.category, s.count, s.amount]),
            ["GRAND TOTAL", stats.totalParticipants, stats.totalCash],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

        XLSX.writeFile(workbook, `TCMF_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center text-slate-800">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="text-indigo-600" /> Admin Dashboard
                    </h1>
                    <div className="flex gap-4">
                        <button onClick={() => router.push("/counter")} className="text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors">Go to Counter Dashboard</button>
                        <button onClick={() => router.push("/auth/login")} className="text-sm text-slate-600 hover:text-red-600 font-medium transition-colors">Sign Out</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700">From:</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50" />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700">To:</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50" />
                        </div>
                        {(startDate || endDate) && (
                            <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-sm text-red-500 hover:underline">Clear</button>
                        )}
                    </div>
                    <button onClick={exportCSV} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
                        <Download className="w-4 h-4" /> Export CSV/Excel
                    </button>
                </div>

                {/* Global Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                        <div className="bg-blue-100 p-4 rounded-full mr-5">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Registered</p>
                            <h2 className="text-3xl font-bold text-slate-800">{stats?.totalParticipants}</h2>
                            <p className="text-xs text-slate-400 mt-1">{stats?.attendedParticipants} attended</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
                        <div className="bg-emerald-100 p-4 rounded-full mr-5">
                            <IndianRupee className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Collection</p>
                            <h2 className="text-3xl font-bold text-slate-800">₹{stats?.totalCash.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-lg font-semibold text-slate-800">Category Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                    <th className="py-3 px-6 font-semibold">Category</th>
                                    <th className="py-3 px-6 font-semibold text-right">Participants</th>
                                    <th className="py-3 px-6 font-semibold text-right">Cash Collected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.categoryStats.map((cat: any) => (
                                    <tr key={cat.category} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-4 px-6 font-medium text-slate-800">{cat.category}</td>
                                        <td className="py-4 px-6 text-right text-slate-600">{cat.count}</td>
                                        <td className="py-4 px-6 text-right text-emerald-600 font-medium">₹{cat.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {stats?.categoryStats.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-slate-500">No data available for selected dates.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Counter Stats Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-lg font-semibold text-slate-800">Counter Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                    <th className="py-3 px-6 font-semibold">Counter User</th>
                                    <th className="py-3 px-6 font-semibold text-right">Registrations Processed</th>
                                    <th className="py-3 px-6 font-semibold text-right">Already Paid</th>
                                    <th className="py-3 px-6 font-semibold text-right">Spot Cash</th>
                                    <th className="py-3 px-6 font-semibold text-right">Spot Digital Pay</th>
                                    <th className="py-3 px-6 font-semibold text-right">Total Cash Collected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.counterStats?.map((cStat: any) => (
                                    <tr key={cStat.counter} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-4 px-6 font-medium text-slate-800">{cStat.counter}</td>
                                        <td className="py-4 px-6 text-right text-slate-600">{cStat.count}</td>
                                        <td className="py-4 px-6 text-right text-slate-600">₹{cStat.alreadyPaid?.toLocaleString() || 0}</td>
                                        <td className="py-4 px-6 text-right text-slate-600">₹{cStat.spotCash?.toLocaleString() || 0}</td>
                                        <td className="py-4 px-6 text-right text-slate-600">₹{cStat.spotDigital?.toLocaleString() || 0}</td>
                                        <td className="py-4 px-6 text-right text-emerald-600 font-medium">₹{cStat.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(!stats?.counterStats || stats.counterStats.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">No data available for selected dates.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-semibold text-slate-800">System Users</h3>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {users.map(user => (
                                <li key={user.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2 rounded-full">
                                            <UserRound className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{user.username}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-900'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleResetPassword(user.id)} className="text-blue-500 hover:text-blue-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors mr-2">
                                            Reset Pwd
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-semibold text-slate-800">Create New User</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input required name="username" type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 bg-slate-50 focus:bg-white" placeholder="counter1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input required name="password" type="password" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 bg-slate-50 focus:bg-white" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select required name="role" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 bg-slate-50 focus:bg-white">
                                        <option value="COUNTER">COUNTER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full mt-2 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" /> Create User
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Manage Registrations */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800">Manage Registrations</h3>
                        <span className="text-sm text-slate-500">Showing {stats?.allParticipants?.length || 0} entries (Based on Date Filter)</span>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                                    <th className="py-3 px-6 font-semibold">Reg. No</th>
                                    <th className="py-3 px-6 font-semibold">Name</th>
                                    <th className="py-3 px-6 font-semibold">Phone</th>
                                    <th className="py-3 px-6 font-semibold">Event</th>
                                    <th className="py-3 px-6 font-semibold">Status</th>
                                    <th className="py-3 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.allParticipants?.map((p: any) => (
                                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-6 font-medium text-indigo-600">{p.registerNumber}</td>
                                        <td className="py-3 px-6 text-slate-800 font-medium">{p.name}</td>
                                        <td className="py-3 px-6 text-slate-600 font-mono text-sm">{p.phone}</td>
                                        <td className="py-3 px-6 text-slate-600 max-w-xs truncate" title={`${p.eventType} - ${p.eventName}`}>{p.eventId || p.eventName}</td>
                                        <td className="py-3 px-6">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.attended ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {p.attended ? "Attended" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <button
                                                onClick={() => handleDeleteParticipant(p.id, p.name)}
                                                className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                                title="Delete Registration"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.allParticipants || stats.allParticipants.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">No registrations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
