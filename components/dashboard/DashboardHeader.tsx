'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Trophy, LogOut } from 'lucide-react'

interface DashboardHeaderProps {
    role: 'user' | 'admin'
    userName?: string
    onSignOut: () => void
}

export function DashboardHeader({ role, userName, onSignOut }: DashboardHeaderProps) {
    const { signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        onSignOut()
    }

    const userLinks = [
        { href: '/dashboard', label: 'الرئيسية' },
        { href: '/teams', label: 'فريقي' },
        { href: '/players/team-selection', label: 'اختيار اللاعبين' },
        { href: '/players', label: 'اللاعبين' },
        { href: '/matches', label: 'المباريات' },
        { href: '/leaderboard', label: 'التصنيف' },
    ]

    const adminLinks = [
        { href: '/dashboard', label: 'لوحة التحكم' },
        { href: '/admin/clubs', label: 'الأندية' },
        { href: '/admin/players', label: 'اللاعبين' },
        { href: '/admin/rounds', label: 'الجولات والمواسم' },
        { href: '/admin/matches', label: 'المباريات' },
        { href: '/admin/player-stats', label: 'الإحصائيات' },
        { href: '/admin/users', label: 'المستخدمون' },
    ]

    const links = role === 'admin' ? adminLinks : userLinks

    return (
        <header className="bg-white shadow-sm border-b" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Trophy className="h-8 w-8 text-primary-600" />
                            <h1 className="text-xl font-bold text-gray-900">
                                فانتازي الدوري السوري
                            </h1>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center space-x-6 space-x-reverse">
                        {links.map((link) => (
                            <Link key={link.href} href={link.href} className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{userName || 'مستخدم'}</p>
                            <p className="text-xs text-gray-500">{role === 'admin' ? 'مشرف' : 'مستخدم'}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 space-x-reverse text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}