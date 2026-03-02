"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader2 } from "lucide-react";

export default function DownloadTicketButton() {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const ticketElement = document.getElementById("ticket-container");
            if (!ticketElement) return;

            const canvas = await html2canvas(ticketElement, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("Rathinam_Grand_Fest_Ticket.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to download PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all"
        >
            {isDownloading ? (
                <Loader2 className="animate-spin w-5 h-5" />
            ) : (
                <Download className="w-5 h-5" />
            )}
            Download Ticket (PDF)
        </button>
    );
}
