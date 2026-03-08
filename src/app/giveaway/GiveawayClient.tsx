'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Gift, RotateCcw, Users, History } from 'lucide-react';
import { saveGiveawayWinner } from '@/lib/actions';

interface Player {
    id: number;
    firstName: string;
    lastName: string;
    pokemonId: string;
}

interface GiveawayWin {
    id: number;
    playerId: number;
    firstName: string;
    lastName: string;
    createdAt: string;
}

interface EventData {
    id: number;
    name: string;
    date: string;
    isActive: boolean;
    players: Player[];
    giveawayWins: GiveawayWin[];
}

export default function GiveawayClient({ events }: { events: EventData[] }) {
    const [selectedEventId, setSelectedEventId] = useState<number>(events[0]?.id || 0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [currentName, setCurrentName] = useState<string>('???');
    const [excludedIds, setExcludedIds] = useState<number[]>([]);

    const selectedEvent = events.find(e => e.id === Number(selectedEventId));
    const availablePlayers = selectedEvent?.players.filter(p => !excludedIds.includes(p.id)) || [];

    // Reset when event ID changes manually
    useEffect(() => {
        setWinner(null);
        setCurrentName('???');
    }, [selectedEventId]);

    // Update exclusions and history when events data changes (e.g. after save)
    useEffect(() => {
        if (selectedEvent) {
            setExcludedIds(selectedEvent.giveawayWins.map(gw => gw.playerId));
        } else {
            setExcludedIds([]);
        }
    }, [selectedEvent]);

    const fireConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#60a5fa']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#60a5fa']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    const startDraw = () => {
        if (!availablePlayers.length) return;

        setIsDrawing(true);
        setWinner(null);

        let ticks = 0;
        const maxTicks = 40; // Total quick name changes
        const intervalTime = 50;

        const interval = setInterval(() => {
            const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
            setCurrentName(`${randomPlayer.firstName} ${randomPlayer.lastName}`);
            ticks++;

            if (ticks >= maxTicks) {
                clearInterval(interval);
                finishDraw();
            }
        }, intervalTime);
    };

    const finishDraw = async () => {
        const finalWinner = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
        setWinner(finalWinner);
        setCurrentName(`${finalWinner.firstName} ${finalWinner.lastName}`);
        setIsDrawing(false);
        fireConfetti();

        // Save to database
        await saveGiveawayWinner(selectedEventId, finalWinner.id);
    };

    const drawAgain = () => {
        if (winner) {
            setExcludedIds(prev => [...prev, winner.id]);
        }
        startDraw();
    };

    return (
        <div className="flex flex-col items-center w-full">
            {/* Event Selector */}
            <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl mb-12">
                <label className="block text-slate-300 text-sm font-bold mb-2">
                    Επιλογή Τουρνουά
                </label>
                <select
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(Number(e.target.value))}
                    disabled={isDrawing}
                >
                    {events.map(event => (
                        <option key={event.id} value={event.id}>
                            {event.name} ({new Date(event.date).toLocaleDateString('el-GR')})
                        </option>
                    ))}
                </select>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Σύνολο Συμμετοχών:
                    </span>
                    <span className="font-bold text-slate-200">{selectedEvent?.players.length || 0}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Διαθέσιμοι για κλήρωση:</span>
                    <span className="font-bold text-amber-400">{availablePlayers.length}</span>
                </div>
            </div>

            {/* Roulette Display */}
            <div className="relative w-full max-w-2xl bg-slate-800/80 backdrop-blur-xl border-2 border-slate-700/50 rounded-[2.5rem] p-8 md:p-16 mb-12 shadow-2xl flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
                {/* Glow behind text */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="w-64 h-64 bg-amber-500 rounded-full blur-[100px]" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentName}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -20 }}
                        transition={{ duration: 0.05 }}
                        className={`text-center z-10 ${winner ? 'scale-110 transition-transform duration-500' : ''}`}
                    >
                        {winner ? (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-amber-400 font-bold tracking-widest uppercase text-sm mb-4 flex items-center justify-center gap-2"
                                >
                                    <Trophy className="w-5 h-5" /> Νικητης! <Trophy className="w-5 h-5" />
                                </motion.div>
                                <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                                    {winner.firstName} <br className="hidden md:block" /> {winner.lastName}
                                </h2>
                                <p className="mt-4 text-slate-400 font-mono text-lg">{winner.pokemonId}</p>
                            </>
                        ) : (
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-300 opacity-80">
                                {currentName}
                            </h2>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                {!winner ? (
                    <button
                        onClick={startDraw}
                        disabled={isDrawing || availablePlayers.length === 0}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-xl md:text-2xl shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        <Gift className="w-8 h-8" />
                        {isDrawing ? 'Κλήρωση...' : 'Έναρξη Κλήρωσης'}
                    </button>
                ) : (
                    <button
                        onClick={drawAgain}
                        disabled={availablePlayers.length <= 1}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all flex items-center gap-3 disabled:opacity-50 transform hover:scale-105 active:scale-95 border border-slate-500"
                    >
                        <RotateCcw className="w-5 h-5" />
                        {availablePlayers.length <= 1 ? 'Τέλος Παικτών' : 'Κλήρωση Ξανά'}
                    </button>
                )}
            </div>

            {/* Winner History / Excluded Log */}
            {selectedEvent && selectedEvent.giveawayWins.length > 0 && (
                <div className="mt-12 w-full max-w-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 shadow-xl">
                    <h3 className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider text-center flex items-center justify-center gap-2">
                        <History className="w-4 h-4" /> Ιστορικό Νικητών
                    </h3>
                    <div className="flex flex-col gap-2">
                        {selectedEvent.giveawayWins.map(win => (
                            <div key={win.id} className="bg-slate-700/50 border border-slate-600/50 p-3 rounded-xl flex items-center justify-between">
                                <span className="text-slate-200 font-bold flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-500" />
                                    {win.firstName} {win.lastName}
                                </span>
                                <span className="text-slate-400 text-xs">
                                    {new Date(win.createdAt).toLocaleTimeString('el-GR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-3 italic">Οι προηγούμενοι νικητές αποκλείονται από την τρέχουσα κλήρωση.</p>
                </div>
            )}
        </div>
    );
}
