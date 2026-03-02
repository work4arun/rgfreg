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
    } catch (error) {
        console.error("Failed to delete participant:", error);
        return { error: "Failed to delete participant." };
    }
}

export async function upsertVenues(venues: { category: string, date: string, title: string, venueDetail: string, contactInfo: string, googleMapLink: string }[]) {
    try {
        await checkAdmin();

        if (!venues || venues.length === 0) {
            return { error: "No venues provided to upload." };
        }

        let createdCount = 0;
        let updatedCount = 0;

        for (const v of venues) {
            if (!v.category || !v.title) continue;

            const existing = await prisma.venue.findUnique({
                where: { category_title_date: { category: v.category, title: v.title, date: v.date || "" } }
            });

            if (existing) {
                await prisma.venue.update({
                    where: { id: existing.id },
                    data: {
                        venueDetail: v.venueDetail || existing.venueDetail,
                        contactInfo: v.contactInfo || existing.contactInfo,
                        googleMapLink: v.googleMapLink || existing.googleMapLink
                    }
                });
                updatedCount++;
            } else {
                await prisma.venue.create({
                    data: {
                        category: v.category,
                        title: v.title,
                        date: v.date || "",
                        venueDetail: v.venueDetail || "",
                        contactInfo: v.contactInfo || "",
                        googleMapLink: v.googleMapLink || ""
                    }
                });
                createdCount++;
            }
        }

        revalidatePath("/admin/venues");
        return { success: true, message: `Successfully uploaded: ${createdCount} created, ${updatedCount} updated.` };
    } catch (error) {
        console.error("Failed to upload venues:", error);
        return { error: "Failed to upload venues to the database." };
    }
}
