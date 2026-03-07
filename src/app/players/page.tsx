/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import { UserPlus, Search, Edit2, Trash2, ChevronRight, Award, History, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

// Αυτή η σελίδα χρειάζεται client-side φιλτράρισμα ή server actions
import { createPlayer, updatePlayer, deletePlayer, manualPointsAdjustment, manualCreditsAdjustment, getPlayerHistory } from '@/lib/actions';

export default function PlayersPage() {
    const [players, setPlayers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyTab, setHistoryTab] = useState<'points' | 'credits'>('points');
    const [editingPlayer, setEditingPlayer] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    const fetchPlayers = () => {
        setLoading(true);
        fetch('/api/players')
            .then(res => res.json())
            .then(data => {
                setPlayers(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        let result;
        if (editingPlayer) {
            result = await updatePlayer(editingPlayer.id, formData);
        } else {
            result = await createPlayer(formData);
        }

        if (result?.error) {
            toast.error(result.error);
            return;
        }

        toast.success(editingPlayer ? 'Ο παίκτης ενημερώθηκε!' : 'Ο παίκτης προστέθηκε!');
        setShowModal(false);
        setEditingPlayer(null);
        fetchPlayers();
    };

    const handlePointsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const points = parseInt(formData.get('points') as string);
        const reason = formData.get('reason') as string;

        await manualPointsAdjustment(editingPlayer.id, points, reason);
        setShowPointsModal(false);
        setEditingPlayer(null);
        fetchPlayers();
    };

    const handleCreditsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get('amount') as string);
        const reason = formData.get('reason') as string;

        await manualCreditsAdjustment(editingPlayer.id, amount, reason);
        setShowCreditsModal(false);
        setEditingPlayer(null);
        fetchPlayers();
    };

    const handleViewHistory = async (player: any) => {
        setEditingPlayer(player);
        const hist = await getPlayerHistory(player.id);
        setHistory(hist);
        setShowHistoryModal(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον παίκτη;')) {
            await deletePlayer(id);
            fetchPlayers();
        }
    };



    const handleEdit = (player: any) => {
        setEditingPlayer(player);
        setShowModal(true);
    };

    const filteredPlayers = Array.isArray(players) ? players.filter(p =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.pokemonId.includes(search)
    ) : [];

    return (
        <div className="min-h-screen bg-slate-50">


            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Διαχείριση Παικτών</h1>
                        <p className="text-slate-600">Προσθήκη, επεξεργασία και αναζήτηση παικτών.</p>
                    </div>
                    <button
                        onClick={() => { setEditingPlayer(null); setShowModal(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <UserPlus className="w-5 h-5" />
                        Νέος Παίκτης
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Αναζήτηση με όνομα ή Pokemon ID..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Παίκτης</th>
                                    <th className="px-6 py-4">Pokemon ID</th>
                                    <th className="px-6 py-4">Κατηγορία</th>
                                    <th className="px-6 py-4 text-right">Πόντοι / Credits</th>
                                    <th className="px-6 py-4 text-center">Ενέργειες</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Φόρτωση παικτών...</td>
                                    </tr>
                                ) : filteredPlayers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Δεν βρέθηκαν παίκτες.</td>
                                    </tr>
                                ) : filteredPlayers.map(player => (
                                    <tr key={player.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{player.firstName} {player.lastName}</div>
                                            <div className="text-xs text-slate-400">{player.birthDate ? new Date(player.birthDate).toLocaleDateString() : '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">{player.pokemonId}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase">{player.ageCategory}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-slate-900">{player.totalPoints} pts</div>
                                            <div className="text-sm text-blue-600">{(player.totalCredits || 0).toFixed(2)} Credits</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleViewHistory(player)}
                                                    title="Ιστορικό" className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                >
                                                    <History className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingPlayer(player); setShowPointsModal(true); }}
                                                    title="Πόντοι" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                >
                                                    <Award className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingPlayer(player); setShowCreditsModal(true); }}
                                                    title="Credits" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                >
                                                    <DollarSign className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(player)}
                                                    title="Επεξεργασία" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(player.id)}
                                                    title="Διαγραφή" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal για Νέο/Επεξεργασία Παίκτη */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingPlayer ? 'Επεξεργασία Παίκτη' : 'Προσθήκη Νέου Παίκτη'}
                                </h3>
                                <button onClick={() => { setShowModal(false); setEditingPlayer(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Όνομα</label>
                                        <input
                                            name="firstName"
                                            required
                                            defaultValue={editingPlayer?.firstName || ''}
                                            className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none border transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Επώνυμο</label>
                                        <input
                                            name="lastName"
                                            required
                                            defaultValue={editingPlayer?.lastName || ''}
                                            className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none border transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Pokemon Player ID</label>
                                    <input
                                        name="pokemonId"
                                        required
                                        defaultValue={editingPlayer?.pokemonId || ''}
                                        className="border-slate-200 block w-full px-4 py-2.5 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none border transition-all"
                                        placeholder="π.χ. 1234567"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ημερομηνία Γέννησης</label>
                                        <input
                                            name="birthDate"
                                            type="date"
                                            defaultValue={editingPlayer?.birthDate ? new Date(editingPlayer.birthDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = new Date(e.target.value);
                                                if (!isNaN(date.getTime())) {
                                                    const year = date.getFullYear();
                                                    const currentYear = new Date().getFullYear();
                                                    const age = currentYear - year;
                                                    let category = 'Master';
                                                    if (age <= 12) category = 'Junior';
                                                    else if (age <= 16) category = 'Senior';

                                                    const select = e.target.form?.querySelector('select[name="ageCategory"]') as HTMLSelectElement;
                                                    if (select) select.value = category;
                                                }
                                            }}
                                            className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none border transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Κατηγορία (Division)</label>
                                        <select
                                            name="ageCategory"
                                            defaultValue={editingPlayer?.ageCategory || 'Master'}
                                            disabled
                                            className="border-slate-200 block w-full px-4 py-2.5 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed border transition-all appearance-none"
                                        >
                                            <option value="Master">Master</option>
                                            <option value="Senior">Senior</option>
                                            <option value="Junior">Junior</option>
                                        </select>
                                        {/* Hidden input to pass the value because disabled selects are not sent in formData */}
                                        <input type="hidden" name="ageCategoryHidden" />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => { setShowModal(false); setEditingPlayer(null); }} className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all">Άκυρο</button>
                                    <button
                                        type="submit"
                                        onClick={(e) => {
                                            const form = e.currentTarget.form;
                                            if (form) {
                                                const select = form.querySelector('select[name="ageCategory"]') as HTMLSelectElement;
                                                const hidden = form.querySelector('input[name="ageCategoryHidden"]') as HTMLInputElement;
                                                if (select && hidden) {
                                                    hidden.value = select.value;
                                                    hidden.name = "ageCategory"; // Change name so it matches what server expects
                                                }
                                            }
                                        }}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                                    >
                                        {editingPlayer ? 'Ενημέρωση' : 'Αποθήκευση'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal για Διαχείριση Πόντων */}
                {showPointsModal && editingPlayer && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-amber-900">Διαχείριση Πόντων</h3>
                                <button onClick={() => { setShowPointsModal(false); setEditingPlayer(null); }} className="text-amber-400 hover:text-amber-600">✕</button>
                            </div>
                            <form onSubmit={handlePointsSubmit} className="p-6 space-y-4">
                                <p className="text-sm border-b pb-3 border-slate-100 text-slate-600">
                                    Παίκτης: <strong className="text-slate-900">{editingPlayer.firstName} {editingPlayer.lastName}</strong><br />
                                    Τρέχοντες Πόντοι: <strong className="text-amber-600">{editingPlayer.totalPoints}</strong>
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Πόντοι (πχ. 50 ή -20)</label>
                                    <input
                                        name="points"
                                        type="number"
                                        required
                                        className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none border transition-all"
                                        placeholder="± πόντοι"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Αιτιολογία</label>
                                    <input
                                        name="reason"
                                        required
                                        className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none border transition-all"
                                        placeholder="π.χ. Νίκη Τουρνουά"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => { setShowPointsModal(false); setEditingPlayer(null); }} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all">Άκυρο</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-md">Αποθήκευση</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal για Διαχείριση Credits */}
                {showCreditsModal && editingPlayer && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-emerald-900">Διαχείριση Credits</h3>
                                <button onClick={() => { setShowCreditsModal(false); setEditingPlayer(null); }} className="text-emerald-400 hover:text-emerald-600">✕</button>
                            </div>
                            <form onSubmit={handleCreditsSubmit} className="p-6 space-y-4">
                                <p className="text-sm border-b pb-3 border-slate-100 text-slate-600">
                                    Παίκτης: <strong className="text-slate-900">{editingPlayer.firstName} {editingPlayer.lastName}</strong><br />
                                    Τρέχοντα Credits: <strong className="text-emerald-600">{(editingPlayer.totalCredits || 0).toFixed(2)}</strong>
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ποσό (πχ. 10.50 ή -5.00)</label>
                                    <input
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        required
                                        className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none border transition-all"
                                        placeholder="± credits"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Αιτιολογία</label>
                                    <input
                                        name="reason"
                                        required
                                        className="border-slate-200 block w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none border transition-all"
                                        placeholder="π.χ. Αγορά Boosters"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => { setShowCreditsModal(false); setEditingPlayer(null); }} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all">Άκυρο</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-md">Αποθήκευση</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal για Ιστορικό Παίκτη */}
                {showHistoryModal && editingPlayer && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Ιστορικό Κινήσεων - {editingPlayer.firstName}
                                </h3>
                                <button onClick={() => { setShowHistoryModal(false); setEditingPlayer(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <div className="flex border-b border-slate-100 bg-white shrink-0">
                                <button
                                    onClick={() => setHistoryTab('points')}
                                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${historyTab === 'points' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Πόντοι
                                </button>
                                <button
                                    onClick={() => setHistoryTab('credits')}
                                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${historyTab === 'credits' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Credits
                                </button>
                            </div>
                            <div className="p-0 overflow-y-auto w-full">
                                {history.filter(tx => historyTab === 'credits' ? tx.type.includes('credits') : (!tx.type.includes('credits'))).length === 0 ? (
                                    <p className="p-8 text-center text-slate-400 italic">Δεν υπάρχουν κινήσεις.</p>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {history.filter(tx => historyTab === 'credits' ? tx.type.includes('credits') : (!tx.type.includes('credits'))).map((tx, idx) => (
                                            <li key={idx} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold text-slate-800 text-sm">
                                                        {tx.reason || (tx.type === 'checkin' ? (tx.event ? `Check-in: ${tx.event.name}` : 'Check-in') : 'Συναλλαγή')}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {new Date(tx.createdAt).toLocaleString('el-GR', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </div>
                                                </div>
                                                <div className={`font-bold text-sm ${tx.type.includes('add') || tx.type === 'checkin' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {tx.type.includes('credits') ? `${tx.type === 'credits_sub' ? '-' : '+'}${tx.amount} Credits` :
                                                        `${tx.type === 'points_sub' ? '-' : '+'}${tx.amount} πόντους`}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 text-center">
                                <button onClick={() => { setShowHistoryModal(false); setEditingPlayer(null); }} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all">Κλείσιμο</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
