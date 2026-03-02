"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function searchParticipant(registerNumber: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized access" };

    const participant = await prisma.participant.findUnique({
        where: { registerNumber },
    });

    if (!participant) {
        return { error: "Participant not found with that Register Number" };
    }

    if (participant.attended) {
        return { error: `Participant has already attended on ${participant.createdAt.toLocaleString()}` };
    }

    return { participant };
}

export async function markAttended(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized access" };

    const id = formData.get("id") as string;
    const paymentType = formData.get("paymentType") as string;
    const receiptNo = formData.get("receiptNo") as string;
    const amountStr = formData.get("amount") as string;
    const amount = amountStr ? parseInt(amountStr, 10) : 0;

    if (!id || !paymentType) {
        return { error: "Missing required fields" };
    }

    try {
        await prisma.participant.update({
            where: { id },
            data: {
                attended: true,
                paymentStatus: "PAID",
                paymentType,
                amount,
                receiptNo: receiptNo || null,
                counterUsername: session.username,
            },
        });
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to mark participant as attended" };
    }
}
