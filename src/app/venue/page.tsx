"use client";

import { useState, useEffect } from "react";
import { getVenueCategories, getVenuesByCategory } from "./actions";
import { MapPin, Navigation, Map, Loader2, CalendarRange, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VenueLookupPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [venues, setVenues] = useState<any[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState("");

    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingVenues, setLoadingVenues] = useState(false);

    useEffect(() => {
        getVenueCategories().then((data: string[]) => {
            setCategories(data);
            setLoadingCategories(false);
        });
    }, []);

    useEffect(() => {
        if (!selectedCategory) {
            setVenues([]);
            setSelectedDate("");
            setSelectedVenueId("");
            return;
        }
        setLoadingVenues(true);
        setSelectedDate("");
        setSelectedVenueId("");
        getVenuesByCategory(selectedCategory).then(data => {
            setVenues(data);
            setLoadingVenues(false);
        });
    }, [selectedCategory]);

    const availableDates = Array.from(new Set(venues.map(v => v.date))).filter(Boolean).sort();
    const filteredVenues = selectedDate ? venues.filter(v => v.date === selectedDate) : venues;

    const selectedVenue = venues.find(v => v.id === selectedVenueId);

    return (
        <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-br from-indigo-700 to-purple-800 rounded-b-[3rem] shadow-xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-[pulse_10s_ease-in-out_infinite]" />
            </div>

            <div className="w-full max-w-md relative z-10 pt-4 pb-12">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="px-6 py-8 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex border border-indigo-200/50 shadow-sm items-center justify-center mb-4 text-indigo-600">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Know Your Venue</h1>
                        <p className="text-slate-500 mt-2 text-sm max-w-[250px]">
                            Find the exact location for your registered event or workshop.
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Category Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <CalendarRange className="w-4 h-4 text-indigo-500" />
                                Select Event Category
                            </label>
                            {loadingCategories ? (
                                <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse flex items-center px-4">
                                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                                </div>
                            ) : (
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow appearance-none"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="" disabled>-- Select a Category --</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Date Dropdown */}
                        {selectedCategory && (availableDates.length > 0 || loadingVenues) && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <CalendarRange className="w-4 h-4 text-emerald-500" />
                                    Select Event Date
                                </label>
                                {loadingVenues ? (
                                    <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse flex items-center px-4">
                                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                                    </div>
                                ) : (
                                    <select
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow appearance-none"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setSelectedVenueId("");
                                        }}
                                    >
                                        <option value="" disabled>-- Select a Date --</option>
                                        {availableDates.map(d => (
                                            <option key={d as string} value={d as string}>{d as string}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Event Dropdown */}
                        {selectedDate && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Map className="w-4 h-4 text-purple-500" />
                                    Select Specific Event
                                </label>
                                {loadingVenues ? (
                                    <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse flex items-center px-4">
                                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                                    </div>
                                ) : (
                                    <select
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow appearance-none"
                                        value={selectedVenueId}
                                        onChange={(e) => setSelectedVenueId(e.target.value)}
                                    >
                                        <option value="" disabled>-- Select an Event Title --</option>
                                        {filteredVenues.map(v => (
                                            <option key={v.id} value={v.id}>{v.title}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Venue Detail Card */}
                        {selectedVenue && (
                            <div className="mt-8 overflow-hidden rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95 duration-500 bg-gradient-to-br from-indigo-50 to-white">
                                <div className="px-5 py-4 flex flex-col items-center text-center">
                                    <div className="p-3 bg-white shadow-sm rounded-full mb-3 text-indigo-600">
                                        <Navigation className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{selectedVenue.title}</h3>

                                    <div className="my-3 space-y-2 text-sm w-full">
                                        <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 text-left">
                                            <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Venue details</span>
                                            <span className="text-slate-700 font-medium">{selectedVenue.venueDetail}</span>
                                        </div>

                                        {selectedVenue.contactInfo && (
                                            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50 text-left">
                                                <span className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Contact</span>
                                                <span className="text-slate-700 font-medium">{selectedVenue.contactInfo}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedVenue.googleMapLink && (
                                        <a
                                            href={selectedVenue.googleMapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Open in Google Maps
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
