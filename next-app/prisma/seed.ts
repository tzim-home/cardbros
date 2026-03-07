// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Default Admin
    const admin = await prisma.adminUser.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: 'admin123', // Στην πραγματικότητα θα χρησιμοποιούσαμε bcrypt, αλλά για το demo αφήνουμε απλό κείμενο ή placeholder
        },
    });
    console.log('Admin user created:', admin.username);

    // 2. Create Default Settings
    const settings = [
        { key: 'default_entry_fee', value: '5.00', description: 'Προεπιλεγμένο κόστος συμμετοχής' },
        { key: 'participation_points', value: '10', description: 'Πόντοι συμμετοχής ανά check-in' },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log('Default settings seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
