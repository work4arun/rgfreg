"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, Loader2 } from "lucide-react";

export default function QrScanner({ onResult }: { onResult: (res: string) => void }) {
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerId = "qr-reader-manual";

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanning = async () => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            const html5QrCode = new Html5Qrcode(scannerId);
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // Success callback
                    if (scannerRef.current?.isScanning) {
                        scannerRef.current.stop().then(() => {
                            setIsScanning(false);
                            onResult(decodedText);
                        }).catch(console.error);
                    }
                },
                () => {
                    // Ignore frame-by-frame parsing errors
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Camera Error:", err);
            setErrorMsg("Could not access the camera. Please check permissions or try another browser.");
        } finally {
            setIsLoading(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium shadow-sm">
                    {errorMsg}
                </div>
            )}

            <div
                id={scannerId}
                className={`w-full overflow-hidden rounded-2xl border-2 ${isScanning ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 bg-black' : 'border-slate-200 bg-slate-50 shadow-sm'} transition-all`}
                style={{ minHeight: isScanning ? '300px' : '0px' }}
            ></div>

            {!isScanning ? (
                <button
                    onClick={startScanning}
                    disabled={isLoading}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Starting Camera...
                        </>
                    ) : (
                        <>
                            <Camera className="w-6 h-6" />
                            Tap to Scan QR Ticket
                        </>
                    )}
                </button>
            ) : (
                <button
                    onClick={stopScanning}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 py-3.5 px-4 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-[0.98]"
                >
                    <X className="w-6 h-6" />
                    Cancel Scanning
                </button>
            )}
        </div>
    );
}
