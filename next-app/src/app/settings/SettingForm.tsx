'use client';

import React, { useTransition } from 'react';
import { Save } from 'lucide-react';
import { updateSetting } from '@/lib/actions';

export default function SettingForm({ settingKey, initialValue }: { settingKey: string, initialValue: string }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                await updateSetting(formData);
                alert('Η ρύθμιση αποθηκεύτηκε με επιτυχία!');
            } catch (err: any) {
                alert('Σφάλμα: ' + err.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4">
            <input type="hidden" name="key" value={settingKey} />
            <input
                name="value"
                defaultValue={initialValue}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700"
            />
            <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
                <Save className="w-5 h-5" />
                {isPending ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
        </form>
    );
}
