import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testDeleteEvent() {
    try {
        console.log("Testing deleteEvent for event 3...");
        await prisma.event.delete({ where: { id: 3 } });
        console.log("Success deleting event 3");
    } catch (e) {
        console.error("Error deleting event 3:", e);
    }
}

async function testUnregister() {
    try {
        console.log("Testing unregister for player from event 3...");
        const checkin = await prisma.transaction.findFirst({ where: { eventId: 3, type: 'checkin' } });
        if (!checkin) {
            console.log("No checkins found for event 3.");
            return;
        }

        console.log("Found checkin:", checkin.id, " amount:", checkin.amount);
        const pointsToRemove = Number(checkin.amount);
        console.log("Decrementing points by", pointsToRemove);

        await prisma.$transaction([
            prisma.player.update({
                where: { id: checkin.playerId },
                data: { totalPoints: { decrement: pointsToRemove } }
            }),
            prisma.transaction.delete({
                where: { id: checkin.id }
            })
        ]);
        console.log("Success unregister!");
    } catch (e) {
        console.error("Error unregistering:", e);
    }
}

async function run() {
    await testUnregister();
    await testDeleteEvent();
    await prisma.$disconnect();
}
run();
