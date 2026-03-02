import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const username = "admin";
    const password = "M13lc0123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await prisma.user.findUnique({
        where: { username },
    });

    if (!existingAdmin) {
        const admin = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: "ADMIN",
            },
        });
        console.log(`Created default admin user: ${admin.username} / ${password}`);
    } else {
        await prisma.user.update({
            where: { username },
            data: { password: hashedPassword },
        });
        console.log(`Updated existing admin user password to: ${password}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
