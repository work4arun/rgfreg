"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QrScanner({ onResult }: { onResult: (res: string) => void }) {
    const [scannerId] = useState(`qr-reader-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            scannerId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        let isScanning = true;

        const onScanSuccess = (decodedText: string) => {
            if (!isScanning) return;
            isScanning = false;
            scanner.clear();
            onResult(decodedText);
        };

        scanner.render(onScanSuccess, () => { });

        return () => {
            isScanning = false;
            scanner.clear().catch(e => console.error(e));
        };
    }, [scannerId, onResult]);

    return <div id={scannerId} className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white"></div>;
}
