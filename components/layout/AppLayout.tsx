'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    Trophy,
    Users,
    Calendar,
    CalendarDays,
    BarChart3,
    LogOut,
    Menu,
    X,
    Home,
    Shield,
    User,
    Database,
    User2Icon,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

interface AppLayoutProps {
    children: React.ReactNode
    userRole?: 'user' | 'admin'
}

export function AppLayout({ children, userRole = 'user' }: AppLayoutProps) {
    const { signOut, user } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    const handleSignOut = async () => {
        await signOut()
        window.location.href = '/'
    }

    const userNavItems = [
        { href: '/dashboard', label: 'الرئيسية', icon: <Home className="h-5 w-5" /> },
        { href: '/teams', label: 'فريقي', icon: <Trophy className="h-5 w-5" /> },
        { href: '/team-selection', label: 'اختيار اللاعبين', icon: <Users className="h-5 w-5" /> },
        { href: '/players', label: 'اللاعبين', icon: <User2Icon className="h-5 w-5" /> },
        { href: '/matches', label: 'المباريات', icon: <Calendar className="h-5 w-5" /> },
        { href: '/leaderboard', label: 'التصنيف', icon: <BarChart3 className="h-5 w-5" /> },
        { href: '/profile', label: 'الملف الشخصي', icon: <User className="h-5 w-5" /> },
    ]

    const adminNavItems = [
        { href: '/dashboard', label: 'لوحة التحكم', icon: <Home className="h-5 w-5" /> },
        { href: '/admin/rounds', label: 'الجولات والمواسم', icon: <CalendarDays className="h-5 w-5" /> },
        { href: '/admin/clubs', label: 'إدارة الأندية', icon: <Shield className="h-5 w-5" /> },
        { href: '/admin/players', label: 'إدارة اللاعبين', icon: <Users className="h-5 w-5" /> },
        { href: '/admin/matches', label: 'إدارة المباريات', icon: <Calendar className="h-5 w-5" /> },
        { href: '/admin/player-stats', label: 'تسجيل الإحصائيات', icon: <BarChart3 className="h-5 w-5" /> },
        { href: '/admin/users', label: 'إدارة المستخدمين', icon: <Database className="h-5 w-5" /> },
    ]

    const navItems = userRole === 'admin' ? adminNavItems : userNavItems

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl 
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                lg:hidden
            `}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                            <Image
                                src="/assets/android-chrome-512x512.png" // عدّل المسار حسب اسم الصورة الفعلي
                                alt="شعار فانتازي الدوري السوري"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900">فانتازي الدوري</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.user_metadata?.full_name || 'مستخدم'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {userRole === 'admin' ? 'مشرف' : 'مستخدم'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="px-3 py-4 flex-1">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                                        ${isActive
                                            ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                {/* Sign Out */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div>
                {/* Small screens top bar with menu */}
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 lg:hidden">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {userRole === 'admin' ? 'لوحة تحكم المشرف' : 'لوحة التحكم'}
                        </h2>
                        <div className="w-6" />
                    </div>
                </div>

                {/* Large screens header */}
                <div className="hidden lg:block sticky top-0 z-30">
                    <DashboardHeader
                        role={userRole}
                        userName={user?.user_metadata?.full_name || user?.email || 'مستخدم'}
                        onSignOut={handleSignOut}
                    />
                </div>

                {/* Page Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
