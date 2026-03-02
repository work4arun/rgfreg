"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// Ensure Admin Only
async function checkAdmin() {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function getDashboardStats(startDate?: string, endDate?: string) {
    await checkAdmin();

    let dateFilter = {};
    if (startDate && endDate) {
        dateFilter = {
            createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        };
    }

    // Aggregate totals
    const totalParticipants = await prisma.participant.count({ where: dateFilter });
    const attendedParticipants = await prisma.participant.count({
        where: { ...dateFilter, attended: true },
    });

    // Group by category (eventType) and sum amount
    const categoryStatsRaw = await prisma.participant.groupBy({
        by: ["eventType"],
        _count: {
            id: true,
        },
        _sum: {
            amount: true,
        },
        where: dateFilter,
    });

    const categoryStats = categoryStatsRaw.map(stat => ({
        category: stat.eventType,
        count: stat._count.id,
        amount: stat._sum.amount || 0,
    }));

    const totalCash = categoryStats.reduce((sum, item) => sum + item.amount, 0);

    // Group by counter to see money collected
    const counterStatsRaw = await prisma.participant.groupBy({
        by: ["counterUsername", "paymentType"],
        _count: { id: true },
        _sum: { amount: true },
        where: { ...dateFilter, attended: true, counterUsername: { not: null } },
    });

    const counterStatsMap = new Map();
    for (const stat of counterStatsRaw) {
        if (!stat.counterUsername) continue;
        if (!counterStatsMap.has(stat.counterUsername)) {
            counterStatsMap.set(stat.counterUsername, {
                counter: stat.counterUsername,
                count: 0,
                amount: 0,
                alreadyPaid: 0,
                spotCash: 0,
                spotDigital: 0,
            });
        }
        const cStat = counterStatsMap.get(stat.counterUsername);
        cStat.count += stat._count.id;

        const amt = stat._sum.amount || 0;
        cStat.amount += amt;

        if (stat.paymentType === "Already Paid") {
            cStat.alreadyPaid += amt;
        } else if (stat.paymentType === "Spot Cash") {
            cStat.spotCash += amt;
        } else if (stat.paymentType === "Spot Digital Pay") {
            cStat.spotDigital += amt;
        }
    }
    const counterStats = Array.from(counterStatsMap.values());

    // Get data for CSV export
    const allParticipants = await prisma.participant.findMany({
        where: dateFilter,
        orderBy: { createdAt: "desc" },
    });

    return {
        totalParticipants,
        attendedParticipants,
        totalCash,
        categoryStats,
        counterStats,
        allParticipants,
    };
}

export async function getUsers() {
    await checkAdmin();
    const users = await prisma.user.findMany({
        select: { id: true, username: true, role: true },
    });
    return users;
}

export async function createUser(formData: FormData) {
    await checkAdmin();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!username || !password || !role) {
        return { error: "All fields are required" };
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return { error: "Username already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
            },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (err) {
        return { error: "Failed to create user" };
    }
}

export async function deleteUser(id: string) {
    await checkAdmin();
    const session = await getSession();

    if (session?.id === id) {
        return { error: "Cannot delete yourself" };
    }

    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath("/admin");
        return { success: true };
    } catch (err) {
        return { error: "Failed to delete user" };
    }
}

export async function resetPassword(formData: FormData) {
    await checkAdmin();
    const id = formData.get("id") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!id || !newPassword || newPassword.length < 6) {
        return { error: "Invalid input or password too short." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (err) {
        return { error: "Failed to reset password" };
    }
}

export async function deleteParticipant(id: string) {
    await checkAdmin();
    try {
        await prisma.participant.delete({ where: { id } });
        revalidatePath("/admin");
        return { success: true };
    } catch (err) {
        return { error: "Failed to delete participant" };
    }
}
