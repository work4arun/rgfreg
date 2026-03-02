"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleAction = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await loginAction(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
                    <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Lock className="text-indigo-600 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                        Staff Portal Login
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Sign in to access counter or admin dashboard
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    <form action={handleAction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm tracking-wide font-semibold text-slate-700" htmlFor="username">Username</label>
                            <input
                                required
                                type="text"
                                id="username"
                                name="username"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50 focus:bg-white transition-colors"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm tracking-wide font-semibold text-slate-700" htmlFor="password">Password</label>
                            <input
                                required
                                type="password"
                                id="password"
                                name="password"
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50 focus:bg-white transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 transition-all mt-4"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                    Authenticating...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
