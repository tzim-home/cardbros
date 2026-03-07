'use client';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteEvent } from '@/lib/actions';

export default function EventDeleteClient({ eventId, eventName }: { eventId: number, eventName: string }) {
    const router = useRouter();

    const handleDelete = async () => {
        if (confirm(`Είστε απόλυτα σίγουροι ότι θέλετε να διαγράψετε το τουρνουά "${eventName}"; Όλες οι εγγραφές σε αυτό θα διαγραφούν οριστικά.`)) {
            await deleteEvent(eventId);
            router.push('/events');
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleDelete}
            title="Διαγραφή Τουρνουά" className="p-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-bold flex items-center gap-2"
        >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Διαγραφή Τουρνουά</span>
        </button>
    );
}
