import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import type { User } from '@/types/UserRolePermission'
import AppearanceToggleDropdown from '@/components/appearance-dropdown'

export function Header() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props
    const isActive = (path: string) => window.location.pathname.startsWith(path)
    const [mobileOpen, setMobileOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur border-b border-gray-100 dark:border-gray-800 mb-8">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-xl text-indigo-700 dark:text-indigo-300 hover:opacity-80 transition"
                >
                    <span>VirtualTour</span>
                </Link>
                {/* Desktop Menu */}
                <div className="flex-1 hidden md:flex" />
                <div className="hidden md:flex items-center">
                    <div className="inline-flex rounded-xl bg-[#23232b] dark:bg-[#23232b] p-1 shadow-inner">
                        <Link
                            href="/articles"
                            className={`px-5 py-2 rounded-lg font-medium transition ${isActive('/articles')
                                    ? 'bg-indigo-500 text-white font-bold shadow'
                                    : 'text-gray-200 hover:bg-gray-700'
                                }`}
                        >
                            Articles
                        </Link>
                        <Link
                            href="/tours"
                            className={`px-5 py-2 rounded-lg font-medium transition ${isActive('/tours')
                                    ? 'bg-indigo-500 text-white font-bold shadow'
                                    : 'text-gray-200 hover:bg-gray-700'
                                }`}
                        >
                            Tours
                        </Link>
                    </div>
                </div>
                <div className="flex-1 hidden md:flex" />
                <div className="hidden md:flex items-center gap-4">
                    <AppearanceToggleDropdown className="mx-2" />
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded border border-[#19140035] px-5 py-1.5 text-sm font-medium text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b] transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded border border-transparent px-5 py-1.5 text-sm font-medium text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A] transition"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded border border-[#19140035] px-5 py-1.5 text-sm font-medium text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b] transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                {/* Hamburger for mobile */}
                <button
                    className="ml-auto md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Open menu"
                >
                    <svg className="w-6 h-6 text-indigo-700 dark:text-indigo-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="md:hidden px-4 pb-4">
                    <div className="flex flex-col gap-2 mt-2 rounded-xl bg-[#23232b] dark:bg-[#23232b] p-3 shadow-inner">
                        <Link
                            href="/articles"
                            className={`px-5 py-2 rounded-lg font-medium transition ${isActive('/articles')
                                    ? 'bg-indigo-500 text-white font-bold shadow'
                                    : 'text-gray-200 hover:bg-gray-700'
                                }`}
                            onClick={() => setMobileOpen(false)}
                        >
                            Articles
                        </Link>
                        <Link
                            href="/tours"
                            className={`px-5 py-2 rounded-lg font-medium transition ${isActive('/tours')
                                    ? 'bg-indigo-500 text-white font-bold shadow'
                                    : 'text-gray-200 hover:bg-gray-700'
                                }`}
                            onClick={() => setMobileOpen(false)}
                        >
                            Tours
                        </Link>
                        <div className="border-t border-gray-700 my-2" />
                        <AppearanceToggleDropdown className="mx-2" />
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded border border-[#19140035] px-5 py-1.5 text-sm font-medium text-[#EDEDEC] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b] transition"
                                onClick={() => setMobileOpen(false)}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded border border-transparent px-5 py-1.5 text-sm font-medium text-[#EDEDEC] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A] transition"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded border border-[#19140035] px-5 py-1.5 text-sm font-medium text-[#EDEDEC] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:hover:border-[#62605b] transition"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}