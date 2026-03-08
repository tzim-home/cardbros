'use client';
import { AlertTriangle, Database } from 'lucide-react';
import { resetMonthlyPoints, fixDatabaseStructure } from '@/lib/actions';
import { toast } from 'react-hot-toast';

export default function DangerZone() {
    return (
        <div className="mt-12 p-8 bg-red-50 border border-red-200 rounded-3xl">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-900 mb-2">Επικίνδυνη Ζώνη (Danger Zone)</h3>
                    <p className="text-red-700 text-sm mb-6 max-w-xl">
                        Η 'Επαναφορά Μήνα' θα μηδενίσει τους πόντους <strong>όλων των παικτών</strong>. Το πλήρες ιστορικό των συναλλαγών τους θα διατηρηθεί κανονικά ως αρχείο, ωστόσο το άθροισμα πόντων όλων θα γίνει 0. Αυτή η ενέργεια δεν αναιρείται.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <form action={resetMonthlyPoints} onSubmit={(e) => { if (!confirm('Είστε απόλυτα σίγουροι ότι θέλετε να μηδενίσετε τους πόντους ΟΛΩΝ των παικτών;')) e.preventDefault(); }}>
                            <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                                Επαναφορά Μήνα (Μηδενισμός Πόντων)
                            </button>
                        </form>

                        <button
                            onClick={async () => {
                                const res = await fixDatabaseStructure();
                                if (res.success) toast.success(res.message || 'Επιτυχία!');
                                else toast.error(res.error || 'Σφάλμα!');
                            }}
                            className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Database className="w-5 h-5" />
                            Επιδιόρθωση Βάσης (Migration)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
