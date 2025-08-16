'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, TrendingUp, Users, Calendar } from 'lucide-react'
import { StatCard } from '@/components/stats/StatCard'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/components/providers/AuthProvider'

interface LeaderboardEntry {
    id: string
    user_name: string
    team_name: string
    total_points: number
    rank: number
}

interface Season {
    id: string
    name: string
    start_date: string
    end_date: string
    is_active: boolean
}

export default function LeaderboardPage() {
    const { user, loading: authLoading } = useAuth()
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSeason, setSelectedSeason] = useState<string>('all')

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            const [leaderboardRes, seasonsRes] = await Promise.all([
                supabase
                    .from('user_teams')
                    .select(`
                        id,
                        total_points,
                        users (full_name),
                        name
                    `)
                    .order('total_points', { ascending: false }),
                supabase.from('seasons').select('*').order('start_date', { ascending: false })
            ])

            if (leaderboardRes.data) {
                const entries = leaderboardRes.data.map((entry, index) => ({
                    id: entry.id,
                    user_name: entry.users?.[0]?.full_name || 'مستخدم غير معروف',
                    team_name: entry.name,
                    total_points: entry.total_points,
                    rank: index + 1
                }))
                setLeaderboard(entries)
            }

            if (seasonsRes.data) {
                setSeasons(seasonsRes.data)
                // Set active season as default
                const activeSeason = seasonsRes.data.find(s => s.is_active)
                if (activeSeason) {
                    setSelectedSeason(activeSeason.id)
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
        return <span className="text-lg font-bold text-gray-400">{rank}</span>
    }

    const getActiveSeason = () => {
        return seasons.find(s => s.is_active) || seasons[0]
    }

    if (authLoading || loading) {
        return (
            <AppLayout userRole="user">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
                </div>
            </AppLayout>
        )
    }

    if (!user) {
        window.location.href = '/'
        return null
    }

    const activeSeason = getActiveSeason()

    return (
        <AppLayout userRole="user">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">تصنيف الفرق</h1>
                    <p className="mt-2 text-gray-600">
                        شاهد ترتيب الفرق حسب النقاط
                    </p>
                    {activeSeason && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>الموسم الحالي:</strong> {activeSeason.name}
                            </p>
                        </div>
                    )}
                </div>

                {/* Season Filter */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">اختر الموسم</h3>
                    <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">جميع المواسم</option>
                        {seasons.map((season) => (
                            <option key={season.id} value={season.id}>
                                {season.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="إجمالي الفرق"
                        value={leaderboard.length}
                        icon={<Users className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="أعلى نقاط"
                        value={leaderboard[0]?.total_points || 0}
                        icon={<Trophy className="h-6 w-6" />}
                        color="yellow"
                    />
                    <StatCard
                        title="متوسط النقاط"
                        value={Math.round(leaderboard.reduce((sum, entry) => sum + entry.total_points, 0) / leaderboard.length) || 0}
                        icon={<TrendingUp className="h-6 w-6" />}
                        color="green"
                    />
                    <StatCard
                        title="الموسم الحالي"
                        value={activeSeason?.name || 'غير محدد'}
                        icon={<Calendar className="h-6 w-6" />}
                        color="purple"
                    />
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">ترتيب الفرق</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الترتيب
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        اسم المستخدم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        اسم الفريق
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        النقاط
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaderboard.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                {getRankIcon(entry.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {entry.user_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.team_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {entry.total_points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {leaderboard.length === 0 && (
                    <div className="text-center py-12">
                        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            لا توجد فرق
                        </h3>
                        <p className="text-gray-500">
                            لم يتم إنشاء أي فرق بعد
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
