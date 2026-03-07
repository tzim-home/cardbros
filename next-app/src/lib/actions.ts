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
