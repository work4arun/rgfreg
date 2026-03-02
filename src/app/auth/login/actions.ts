"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Username and password are required" };
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return { error: "Invalid credentials" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return { error: "Invalid credentials" };
    }

    await createSession({
        id: user.id,
        username: user.username,
        role: user.role,
    });

    if (user.role === "ADMIN") {
        redirect("/admin");
    } else {
        redirect("/counter");
    }
}
