"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function QrCodeDisplay({ value }: { value: string }) {
    return (
        <QRCodeCanvas
            value={value}
            size={180}
            level="H"
            includeMargin={true}
        />
    );
}
