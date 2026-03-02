import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckCircle2, Ticket } from "lucide-react";
import DownloadTicketButton from "@/components/DownloadTicketButton";
import QrCodeDisplay from "@/components/QrCodeDisplay";
import { format } from "date-fns";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const params = await searchParams;
    const id = params?.id;

    if (!id) {
        redirect("/");
    }

    const participant = await prisma.participant.findUnique({
        where: { id },
    });

    if (!participant) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div id="ticket-container" className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

                <div className="bg-gradient-to-r from-emerald-500 flex flex-col items-center justify-center to-teal-600 p-8 text-center text-white relative">
                    <h2 className="text-3xl font-extrabold mb-4 tracking-wider drop-shadow-md">RGF 2026</h2>
                    <div className="bg-white/20 p-4 rounded-full mb-4">
                        <CheckCircle2 size={48} className="text-white relative z-10" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
                    <p className="text-emerald-50 opacity-90 text-sm">
                        You are officially registered for {participant.eventName}.
                    </p>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <p className="text-slate-500 mb-6 text-center text-sm">
                        Please save this QR Code or Register Number and present it at the counter for entry and payment.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-2xl w-full flex flex-col items-center border border-slate-200 mb-6 shadow-sm">
                        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                            <QrCodeDisplay value={participant.registerNumber} />
                        </div>

                        <div className="text-center w-full bg-white py-3 rounded-lg border border-slate-100 flex items-center justify-center gap-2 text-xl font-bold tracking-widest text-indigo-700">
                            <Ticket className="text-indigo-400" size={20} />
                            {participant.registerNumber}
                        </div>
                    </div>

                    <div className="w-full space-y-3 bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-slate-500 text-sm">Name</span>
                            <span className="font-semibold text-slate-800">{participant.name}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-slate-500 text-sm">College</span>
                            <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{participant.college}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-slate-500 text-sm">Event</span>
                            <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{participant.eventType}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                            <span className="text-slate-500 text-sm">Date & Time</span>
                            <span className="font-medium text-slate-700 text-right text-sm">
                                {format(new Date(participant.createdAt), "MMM d, yyyy • h:mm a")}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-all">
                            Register another participant
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-md w-full mt-4">
                <DownloadTicketButton />
            </div>
        </div>
    );
}
