import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import type { User } from '@/types/UserRolePermission'

export function Header() {
    const { auth } = usePage<{ auth: { user: User | null } }>().props

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur border-b border-gray-100 dark:border-gray-800 mb-8">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-end gap-4">
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
        </header>
    )
}
