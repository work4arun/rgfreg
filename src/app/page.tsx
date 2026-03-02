"use client"

import { useState, useTransition } from "react";
import { submitRegistration } from "./actions";
import { Loader2, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

export default function RegistrationPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await submitRegistration(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Rathinam Grand Fest
          </h1>
          <p className="text-blue-100 font-medium tracking-wide">
            Participant Registration Portal
          </p>
        </div>

        <div className="p-8">
          <Link
            href="/venue"
            className="flex flex-col items-center justify-center mb-8 w-full group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative w-full bg-blue-50 border border-blue-100/50 rounded-xl px-4 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-blue-900 font-bold leading-tight">Know Your Venue</h3>
                  <p className="text-blue-700/80 text-xs">Find map links and exact locations</p>
                </div>
              </div>
              <Navigation className="w-5 h-5 text-blue-600 mr-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form action={handleAction} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="name">Full Name</label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="phone">Contact Number</label>
                <input
                  required
                  type="tel"
                  id="phone"
                  name="phone"
                  pattern="[0-9]{10}"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white"
                  placeholder="10-digit mobile number"
                  title="Please enter a valid 10-digit number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
              <input
                required
                type="email"
                id="email"
                name="email"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="college">College / University Name</label>
              <input
                required
                type="text"
                id="college"
                name="college"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white"
                placeholder="Name of your institution"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="department">Department</label>
                <input
                  required
                  type="text"
                  id="department"
                  name="department"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="rollNo">College Roll No</label>
                <input
                  required
                  type="text"
                  id="rollNo"
                  name="rollNo"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white"
                  placeholder="Your registration number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="eventType">Event Category</label>
              <select
                required
                id="eventType"
                name="eventType"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white appearance-none"
              >
                <option value="">Select Event Category...</option>
                <option value="Technical Event">Technical Event</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Championship">Championship</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="eventName">Mention the specific event/Workshop/sport/championship name</label>
              <input
                required
                type="text"
                id="eventName"
                name="eventName"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white"
                placeholder="e.g. CodeSprint 2026"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all mt-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Submitting Application...
                </>
              ) : (
                "Complete Registration"
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-500 text-sm">
            For any queries, please contact the fest support desk.
          </p>
        </div>
      </div>
    </div>
  );
}
