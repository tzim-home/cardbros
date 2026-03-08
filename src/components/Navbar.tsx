'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Ταμπλό' },
        { href: '/players', label: 'Παίκτες' },
        { href: '/events', label: 'Τουρνουά' },
        { href: '/leaderboard', label: 'Κατάταξη' },
        { href: '/giveaway', label: 'Κληρώσεις' },
        { href: '/settings', label: 'Ρυθμίσεις' },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    if (pathname === '/login') return null;

    return (
        <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        TCG Manager
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                            Ταμπλό
                        </Link>
                        <Link href="/players" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/players' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                            Παίκτες
                        </Link>
                        <Link href="/events" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname.startsWith('/events') ? 'bg-white text-blue-600 shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                            Τουρνουά
                        </Link>
                        <Link href="/leaderboard" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/leaderboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                            Κατάταξη
                        </Link>
                        <Link href="/giveaway" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/giveaway' ? 'bg-white text-blue-600 shadow-sm' : 'text-amber-300 hover:bg-white/10 hover:text-white drop-shadow-md'}`}>
                            Κληρώσεις
                        </Link>
                        <Link href="/settings" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}>
                            Ρυθμίσεις
                        </Link>
                    </div>

                    {/* Admin / Logout (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-sm text-slate-400">Admin</span>
                        <form action="/api/auth/logout" method="POST">
                            <button type="submit" className="bg-slate-800 hover:bg-red-600/20 hover:text-red-400 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all">
                                Αποσύνδεση
                            </button>
                        </form>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800 shadow-inner">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${pathname === link.href ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-300'}
                                `}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-4 pt-4 border-t border-slate-800 px-3">
                            <div className="text-sm text-slate-500 mb-3">Συνδεδεμένος ως: Admin</div>
                            <form action="/api/auth/logout" method="POST">
                                <button type="submit" className="w-full text-left flex items-center gap-2 text-white bg-slate-800 hover:bg-red-900/40 px-3 py-3 rounded-md text-base font-medium transition-colors">
                                    <LogOut className="w-5 h-5" />
                                    Αποσύνδεση
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
