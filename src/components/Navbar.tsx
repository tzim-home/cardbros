'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Dashboard' },
        { href: '/players', label: 'Παίκτες' },
        { href: '/events', label: 'Τουρνουά' },
        { href: '/settings', label: 'Ρυθμίσεις' },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    if (pathname === '/login') return null;

    return (
        <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        TCG Manager
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            Ταμπλό
                        </Link>
                        <Link href="/leaderboard" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/leaderboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            Κατάταξη
                        </Link>
                        <Link href="/events" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname.startsWith('/events') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            Τουρνουά
                        </Link>
                        <Link href="/players" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/players' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            Παίκτες
                        </Link>
                        <Link href="/transactions" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/transactions' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            Ιστορικό
                        </Link>
                        <Link href="/settings" className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname === '/settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            Ρυθμίσεις
                        </Link>
                    </div>

                    {/* Admin / Logout (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-sm text-blue-100">Admin</span>
                        <form action="/api/auth/logout" method="POST">
                            <button type="submit" className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                Αποσύνδεση
                            </button>
                        </form>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-500 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-blue-700 border-t border-blue-500 shadow-inner">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${pathname === link.href ? 'bg-blue-800 text-white' : 'hover:bg-blue-600 text-blue-50'}
                                `}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-4 pt-4 border-t border-blue-500/50 px-3">
                            <div className="text-sm text-blue-200 mb-3">Συνδεδεμένος ως: Admin</div>
                            <form action="/api/auth/logout" method="POST">
                                <button type="submit" className="w-full text-left flex items-center gap-2 text-white bg-blue-800 hover:bg-blue-900 px-3 py-3 rounded-md text-base font-medium transition-colors">
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
