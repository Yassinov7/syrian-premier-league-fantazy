'use client'

import { AppLayout } from '@/components/layout/AppLayout'

export default function LeaderboardPage() {
	return (
		<AppLayout userRole="user">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">التصنيف</h1>
				<p className="text-gray-500">قريبًا</p>
			</div>
		</AppLayout>
	)
}

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, TrendingUp, Users } from 'lucide-react'
import { StatCard } from '@/components/stats/StatCard'

interface LeaderboardEntry {
    id: string
    user_name: string
    team_name: string
    total_points: number
    rank: number
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('user_teams')
                .select(`
                    id,
                    total_points,
                    users (full_name),
                    name
                `)
                .order('total_points', { ascending: false })

            if (data) {
                const entries = data.map((entry, index) => ({
                    id: entry.id,
                    user_name: entry.users?.full_name || 'مستخدم غير معروف',
                    team_name: entry.name,
                    total_points: entry.total_points,
                    rank: index + 1
                }))
                setLeaderboard(entries)
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            تصنيف الفرق
                        </h1>
                        <p className="text-gray-600">
                            شاهد ترتيب الفرق حسب النقاط
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
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
                        title="أقل نقاط"
                        value={leaderboard[leaderboard.length - 1]?.total_points || 0}
                        icon={<Trophy className="h-6 w-6" />}
                        color="purple"
                    />
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">ترتيب الفرق</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {entry.user_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {entry.team_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-primary-600">
                                                {entry.total_points} نقطة
                                            </div>
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
                            لا توجد فرق بعد
                        </h3>
                        <p className="text-gray-500">
                            ابدأ بإنشاء فريقك للحصول على نقاط
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
