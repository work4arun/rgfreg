"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCounterStats() {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const statsRaw = await prisma.participant.groupBy({
            by: ["paymentType"],
            _count: { id: true },
            _sum: { amount: true },
            where: {
                attended: true,
                counterUsername: session.username,
            },
        });

        const stats = {
            spotCashAmount: 0,
            spotDigitalAmount: 0,
            alreadyPaidAmount: 0,
            nonAlreadyPaidCount: 0,
        };

        for (const s of statsRaw) {
            const amt = s._sum.amount || 0;
            const cnt = s._count.id || 0;

            if (s.paymentType === "Spot Cash") {
                stats.spotCashAmount += amt;
                stats.nonAlreadyPaidCount += cnt;
            } else if (s.paymentType === "Spot Digital Pay") {
                stats.spotDigitalAmount += amt;
                stats.nonAlreadyPaidCount += cnt;
            } else if (s.paymentType === "Already Paid") {
                stats.alreadyPaidAmount += amt;
            }
        }

        return { success: true, stats };
    } catch (e) {
        return { error: "Failed to load stats" };
    }
}

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
        return {
            warning: `Warning: This participant has already been marked as attended. You may update their payment data below.`,
            participant
        };
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
