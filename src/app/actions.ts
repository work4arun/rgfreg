"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitRegistration(formData: FormData) {
    const name = formData.get("name") as string;
    const college = formData.get("college") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const department = formData.get("department") as string;
    const rollNo = formData.get("rollNo") as string;
    const eventType = formData.get("eventType") as string;
    const eventName = formData.get("eventName") as string;

    if (!name || !college || !phone || !email || !department || !rollNo || !eventType || !eventName) {
        return { error: "All fields are required" };
    }

    // Check if phone number or email already exists to return their existing ticket
    const existingParticipant = await prisma.participant.findFirst({
        where: {
            OR: [
                { phone },
                { email }
            ]
        },
    });

    if (existingParticipant) {
        redirect(`/success?id=${existingParticipant.id}`);
    }

    // Generate sequential Register Number starting from 8000
    const count = await prisma.participant.count();
    let nextReg = 8000 + count;

    // Ensure uniqueness explicitly in case of collision
    while (await prisma.participant.findUnique({ where: { registerNumber: nextReg.toString() } })) {
        nextReg++;
    }
    const registerNumber = nextReg.toString();

    let participantId = "";

    try {
        const newParticipant = await prisma.participant.create({
            data: {
                registerNumber,
                name,
                college,
                phone,
                email,
                department,
                rollNo,
                eventType,
                eventName,
            },
        });
        participantId = newParticipant.id;
    } catch (error) {
        console.error(error);
        return { error: "An error occurred while saving. Please try again." };
    }

    // Redirect to success page on success
    redirect(`/success?id=${participantId}`);
}
