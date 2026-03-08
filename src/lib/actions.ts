/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createPlayer(formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const pokemonId = formData.get('pokemonId') as string;
    const birthDate = formData.get('birthDate') as string;
    const ageCategory = formData.get('ageCategory') as any;

    try {
        // Έλεγχος αν υπάρχει ήδη το Pokemon ID
        const existing = await prisma.player.findUnique({
            where: { pokemonId }
        });

        if (existing) {
            return { error: 'Το Pokemon ID υπάρχει ήδη σε άλλον παίκτη!' };
        }

        await prisma.player.create({
            data: {
                firstName,
                lastName,
                pokemonId,
                birthDate: birthDate ? new Date(birthDate) : null,
                ageCategory: ageCategory || 'Master',
                totalPoints: 0,
                totalCredits: 0,
            },
        });

        revalidatePath('/players');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Create error:', error);
        return { error: 'Σφάλμα κατά την αποθήκευση του παίκτη.' };
    }
}

export async function updateSetting(formData: FormData) {
    const key = formData.get('key') as string;
    const value = formData.get('value') as string;

    await prisma.setting.update({
        where: { key },
        data: { value },
    });
    revalidatePath('/settings');
}

export async function updatePlayer(playerId: number, formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const pokemonId = formData.get('pokemonId') as string;
    const birthDate = formData.get('birthDate') as string;
    const ageCategory = formData.get('ageCategory') as any;

    try {
        // Έλεγχος αν το νέο Pokemon ID χρησιμοποιείται από άλλον παίκτη
        const existing = await prisma.player.findFirst({
            where: {
                pokemonId,
                id: { not: playerId }
            }
        });

        if (existing) {
            return { error: 'Το Pokemon ID χρησιμοποιείται ήδη από άλλον παίκτη!' };
        }

        await prisma.player.update({
            where: { id: playerId },
            data: {
                firstName,
                lastName,
                pokemonId,
                birthDate: birthDate ? new Date(birthDate) : null,
                ageCategory: ageCategory || 'Master',
            },
        });

        revalidatePath('/players');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Update error:', error);
        return { error: 'Σφάλμα κατά την ενημέρωση του παίκτη.' };
    }
}

export async function deletePlayer(playerId: number) {
    await prisma.player.delete({
        where: { id: playerId },
    });
    revalidatePath('/players');
    revalidatePath('/');
}



export async function createEvent(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;

    await prisma.event.create({
        data: {
            name,
            description,
            date: date ? new Date(date) : new Date(),
            isActive: true,
        },
    });

    revalidatePath('/events');
    revalidatePath('/checkin');
}

export async function toggleEventStatus(eventId: number, isActive: boolean) {
    await prisma.event.update({
        where: { id: eventId },
        data: { isActive },
    });
    revalidatePath('/events');
}

export async function deleteEvent(eventId: number) {
    // Θα διαγράψει και τα transactions (cascade)
    await prisma.event.delete({
        where: { id: eventId },
    });
    revalidatePath('/events');
    revalidatePath('/');
}

export async function manualPointsAdjustment(playerId: number, points: number, reason: string) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error('Player not found');

    await prisma.$transaction([
        prisma.player.update({
            where: { id: playerId },
            data: {
                totalPoints: { increment: points },
            },
        }),
        prisma.transaction.create({
            data: {
                playerId,
                type: points >= 0 ? 'points_add' : 'points_sub',
                amount: Math.abs(points),
                reason: reason || 'Χειροκίνητη ρύθμιση πόντων',
            },
        }),
    ]);

    revalidatePath('/players');
    revalidatePath('/');
}

export async function manualCreditsAdjustment(playerId: number, amount: number, reason: string) {
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new Error('Player not found');

    await prisma.$transaction([
        prisma.player.update({
            where: { id: playerId },
            data: {
                totalCredits: { increment: amount },
            },
        }),
        prisma.transaction.create({
            data: {
                playerId,
                type: amount >= 0 ? 'credits_add' : 'credits_sub',
                amount: Math.abs(amount),
                reason: reason || 'Χειροκίνητη ρύθμιση Credits',
            },
        }),
    ]);

    revalidatePath('/players');
    revalidatePath('/');
}

export async function resetMonthlyPoints() {
    await prisma.player.updateMany({
        data: {
            totalPoints: 0,
        },
    });
    revalidatePath('/players');
    revalidatePath('/');
}

export async function getPlayerHistory(playerId: number) {
    return await prisma.transaction.findMany({
        where: { playerId },
        orderBy: { createdAt: 'desc' },
        include: { event: true },
    });
}

export async function registerPlayerToEvent(playerId: number, eventId: number) {
    const existingRegistration = await prisma.transaction.findFirst({
        where: {
            playerId,
            eventId,
            type: 'checkin'
        }
    });

    if (existingRegistration) {
        throw new Error('Ο παίκτης υπάρχει ήδη στο τουρνουά!');
    }

    const settings = await prisma.setting.findMany();
    const pointsAdd = parseInt(settings.find(s => s.key === 'participation_points')?.value || '10');

    await prisma.$transaction([
        prisma.player.update({
            where: { id: playerId },
            data: {
                totalPoints: { increment: pointsAdd },
            },
        }),
        prisma.transaction.create({
            data: {
                playerId,
                eventId,
                type: 'checkin',
                amount: pointsAdd,
                reason: 'Εγγραφή στο Τουρνουά',
            },
        }),
    ]);

    revalidatePath(`/events/${eventId}`);
    revalidatePath('/events');
    revalidatePath('/players');
    revalidatePath('/');
}

export async function unregisterPlayerFromEvent(playerId: number, eventId: number) {
    console.log(`Unregistering player ${playerId} from event ${eventId}`);
    try {
        // Βρίσκουμε τη συναλλαγή checkin
        const checkinTransaction = await (prisma.transaction as any).findFirst({
            where: {
                playerId,
                eventId,
                type: 'checkin'
            }
        });

        if (!checkinTransaction) {
            console.error('No checkin transaction found');
            throw new Error('Δεν βρέθηκε εγγραφή για αυτόν τον παίκτη.');
        }

        const pointsToRemove = Number(checkinTransaction.amount);
        console.log(`Removing ${pointsToRemove} points from player ${playerId}`);

        await prisma.$transaction([
            // Αφαίρεση πόντων από τον παίκτη
            (prisma.player as any).update({
                where: { id: playerId },
                data: {
                    totalPoints: { decrement: pointsToRemove },
                },
            }),
            // Διαγραφή της συναλλαγής
            (prisma.transaction as any).delete({
                where: { id: checkinTransaction.id },
            }),
        ]);

        console.log('Unregister successful');
        revalidatePath(`/events/${eventId}`);
        revalidatePath('/events');
        revalidatePath('/players');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Unregister error:', error);
        throw new Error(error.message || 'Σφάλμα κατά τη διαγραφή της εγγραφής');
    }
}

export async function saveGiveawayWinner(eventId: number, playerId: number) {
    try {
        await prisma.giveawayWinner.create({
            data: {
                eventId,
                playerId
            }
        });
        revalidatePath('/giveaway');
        return { success: true };
    } catch (error: any) {
        console.error('Save Giveaway Winner error:', error);
        return { error: 'Σφάλμα κατά την αποθήκευση του νικητή' };
    }
}

export async function clearGiveawayHistory() {
    try {
        await prisma.giveawayWinner.deleteMany({});
        revalidatePath('/giveaway');
        return { success: true };
    } catch (error: any) {
        console.error('Clear Giveaway History error:', error);
        return { error: 'Σφάλμα κατά την εκκαθάριση του ιστορικού' };
    }
}

export async function fixDatabaseStructure() {
    try {
        // SQL για τη δημιουργία του πίνακα giveaway_winners αν δεν υπάρχει
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "giveaway_winners" (
                "id" SERIAL NOT NULL,
                "eventId" INTEGER NOT NULL,
                "playerId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "giveaway_winners_pkey" PRIMARY KEY ("id")
            );
        `);

        // SQL για τα foreign keys (με προσοχή αν υπάρχουν ήδη)
        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "giveaway_winners" 
                ADD CONSTRAINT "giveaway_winners_eventId_fkey" 
                FOREIGN KEY ("eventId") REFERENCES "events"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);
        } catch (e) { /* Ήδη υπάρχει ή σφάλμα */ }

        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "giveaway_winners" 
                ADD CONSTRAINT "giveaway_winners_playerId_fkey" 
                FOREIGN KEY ("playerId") REFERENCES "players"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);
        } catch (e) { /* Ήδη υπάρχει ή σφάλμα */ }

        revalidatePath('/giveaway');
        return { success: true, message: 'Η βάση δεδομένων ενημερώθηκε επιτυχώς!' };
    } catch (error: any) {
        console.error('Migration error:', error);
        return { error: 'Σφάλμα κατά την ενημέρωση της βάσης: ' + error.message };
    }
}


