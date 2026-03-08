'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Trophy, CheckCircle2, XCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { createEvent, toggleEventStatus } from '@/lib/actions';

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        const res = await fetch('/api/events'); // Χρειαζόμαστε ένα νέο API route για events ή fetch απευθείας
        const data = await res.json();
        setEvents(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createEvent(formData);
        setShowModal(false);
        fetchEvents();
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        await toggleEventStatus(id, !currentStatus);
        fetchEvents();
    };

    return (
        <div className="min-h-screen bg-slate-50">


            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 text-balance">Διαχείριση Τουρνουά</h1>
                        <p className="text-slate-600">Δημιουργία και έλεγχος ενεργών εκδηλώσεων.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5 text-slate-400" />
                        Νέο Τουρνουά
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-slate-400 italic">Φόρτωση τουρνουά...</div>
                    ) : events.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-400 italic">Δεν υπάρχουν τουρνουά.</div>
                    ) : events.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:border-slate-400 hover:shadow-md transition-all group">
                            <Link href={`/events/${event.id}`} className="flex-grow block cursor-pointer">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${event.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <Trophy className="w-6 h-6" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${event.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {event.isActive ? 'Ενεργό' : 'Ανενεργό'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">{event.name}</h3>
                                    <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(event.date).toLocaleDateString('el-GR')}
                                    </p>
                                    {event.description && <p className="text-slate-600 text-sm line-clamp-2 mb-6">{event.description}</p>}
                                </div>
                            </Link>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                <button
                                    onClick={(e) => { e.preventDefault(); handleToggleStatus(event.id, event.isActive); }}
                                    className={`w-full py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${event.isActive
                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        }`}
                                >
                                    {event.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                    {event.isActive ? 'Λήξη' : 'Ενεργό'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900">Δημιουργία Τουρνουά</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <form onSubmit={handleCreateEvent} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Όνομα Τουρνουά</label>
                                    <input name="name" required className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none border transition-all" placeholder="π.χ. Saturday Standard" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Περιγραφή (Προαιρετικό)</label>
                                    <textarea name="description" className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none border transition-all h-24 resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ημερομηνία</label>
                                    <input name="date" type="date" className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none border transition-all" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all">Άκυρο</button>
                                    <button type="submit" className="flex-1 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-black transition-all shadow-lg">Δημιουργία</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
