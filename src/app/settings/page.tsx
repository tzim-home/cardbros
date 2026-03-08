import React from 'react';
import { Settings as SettingsIcon, Save, Info, DollarSign, Award, AlertTriangle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import DangerZone from './DangerZone';
import SettingForm from './SettingForm';

export default async function SettingsPage() {
    const settings = await prisma.setting.findMany();

    return (
        <div className="min-h-screen bg-slate-50">


            <main className="max-w-3xl mx-auto px-4 py-12">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <SettingsIcon className="w-8 h-8 text-slate-800" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Ρυθμίσεις Συστήματος</h1>
                    </div>
                    <p className="text-slate-600">Διαμορφώστε τις παραμέτρους για τη λειτουργία του καταστήματος.</p>
                </header>

                <div className="space-y-6">
                    {settings.filter(s => s.key !== 'default_entry_fee').map(setting => (
                        <div key={setting.key} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    {setting.key.includes('fee') ? <DollarSign className="w-6 h-6 text-emerald-600" /> : <Award className="w-6 h-6 text-amber-600" />}
                                    <div>
                                        <h3 className="font-bold text-slate-900 capitalize">{setting.key.replace(/_/g, ' ')}</h3>
                                        <p className="text-sm text-slate-500">{setting.description}</p>
                                    </div>
                                </div>
                            </div>

                            <SettingForm settingKey={setting.key} initialValue={setting.value} />
                        </div>
                    ))}

                    <div className="p-6 bg-slate-100 border border-slate-200 rounded-2xl flex gap-4 text-slate-800">
                        <Info className="w-6 h-6 shrink-0 text-slate-500" />
                        <p className="text-sm italic">
                            Οι αλλαγές στις ρυθμίσεις επηρεάζουν άμεσα τους υπολογισμούς για τα νέα check-ins.
                        </p>
                    </div>

                    <DangerZone />
                </div>
            </main>
        </div >
    );
}
