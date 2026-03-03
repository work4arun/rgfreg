"use server";

import prisma from "@/lib/prisma";

export async function getVenueCategories() {
    try {
        const venues = await prisma.venue.findMany({
            select: { category: true }
        });
        const categories = Array.from(new Set(venues.map((v) => v.category))).sort() as string[];
        return categories;
    } catch (error) {
        console.error("Failed to fetch venue categories", error);
        return [];
    }
}

export async function getVenuesByCategory(category: string) {
    try {
        const venues = await prisma.venue.findMany({
            where: { category },
            orderBy: { title: 'asc' }
        });
        return venues;
    } catch (error) {
        console.error("Failed to fetch venues by category", error);
        return [];
    }
}
