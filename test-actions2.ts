import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkEvent5() {
    try {
        const event = await prisma.event.findUnique({
            where: { id: 5 },
            include: { transactions: true }
        });
        console.log("Event 5:", JSON.stringify(event, null, 2));

        if (event && event.transactions.length > 0) {
            const checkin = event.transactions[0];
            console.log("Found checkin for Player:", checkin.playerId);
            // Let's try to unregister them just like the action does
            const pointsToRemove = Number(checkin.amount);
            console.log(`Decreasing ${pointsToRemove} points from player ${checkin.playerId}`);

            await prisma.$transaction([
                prisma.player.update({
                    where: { id: checkin.playerId },
                    data: {
                        totalPoints: { decrement: pointsToRemove },
                    },
                }),
                prisma.transaction.delete({
                    where: { id: checkin.id },
                }),
            ]);
            console.log("Successfully unregistered manually in script!");
        }
    } catch (e) {
        console.error("Error checking event 5:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkEvent5();
