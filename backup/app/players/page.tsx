'use client'

import { useState, useEffect } from 'react'
import { Player, Club } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Search, Filter, Trophy, Users, Target, DollarSign } from 'lucide-react'
import { PlayerCard } from '@/components/players/PlayerCard'
import { StatCard } from '@/components/stats/StatCard'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/components/providers/AuthProvider'

interface Season {
    id: string
    name: string
    start_date: string
    end_date: string
    is_active: boolean
}

export default function PlayersPage() {
    const { user, loading: authLoading } = useAuth()
    const [players, setPlayers] = useState<Player[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPosition, setSelectedPosition] = useState<string>('all')
    const [selectedClub, setSelectedClub] = useState<string>('all')
    const [selectedSeason, setSelectedSeason] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'name' | 'points' | 'price'>('name')

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            const [playersRes, clubsRes, seasonsRes] = await Promise.all([
                supabase.from('players').select('*').order('name'),
                supabase.from('clubs').select('*').order('name'),
                supabase.from('seasons').select('*').order('start_date', { ascending: false })
            ])

            if (playersRes.data) setPlayers(playersRes.data)
            if (clubsRes.data) setClubs(clubsRes.data)
            if (seasonsRes.data) setSeasons(seasonsRes.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition
        const matchesClub = selectedClub === 'all' || player.club_id === selectedClub

        return matchesSearch && matchesPosition && matchesClub
    })

    const sortedPlayers = [...filteredPlayers].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name, 'ar')
            case 'points':
                return b.total_points - a.total_points
            case 'price':
                return b.price - a.price
            default:
                return 0
        }
    })

    const getClubName = (clubId: string) => {
        return clubs.find(c => c.id === clubId)?.name || 'غير محدد'
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
                    <h1 className="text-3xl font-bold text-gray-900">قائمة اللاعبين</h1>
                    <p className="mt-2 text-gray-600">
                        اختر أفضل اللاعبين لبناء فريقك
                    </p>
                    {activeSeason && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>الموسم الحالي:</strong> {activeSeason.name}
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="إجمالي اللاعبين"
                        value={players.length}
                        icon={<Users className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="أعلى نقاط"
                        value={Math.max(...players.map(p => p.total_points))}
                        icon={<Trophy className="h-6 w-6" />}
                        color="yellow"
                    />
                    <StatCard
                        title="متوسط النقاط"
                        value={Math.round(players.reduce((sum, p) => sum + p.total_points, 0) / players.length)}
                        icon={<Target className="h-6 w-6" />}
                        color="green"
                    />
                    <StatCard
                        title="أعلى سعر"
                        value={Math.max(...players.map(p => p.price))}
                        icon={<DollarSign className="h-6 w-6" />}
                        color="purple"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">تصفية اللاعبين</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ابحث عن لاعب..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">المركز</label>
                            <select
                                value={selectedPosition}
                                onChange={(e) => setSelectedPosition(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">جميع المراكز</option>
                                <option value="GK">حارس مرمى</option>
                                <option value="DEF">مدافع</option>
                                <option value="MID">لاعب وسط</option>
                                <option value="FWD">مهاجم</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">النادي</label>
                            <select
                                value={selectedClub}
                                onChange={(e) => setSelectedClub(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">جميع الأندية</option>
                                {clubs.map((club) => (
                                    <option key={club.id} value={club.id}>
                                        {club.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'points' | 'price')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">الاسم</option>
                                <option value="points">النقاط</option>
                                <option value="price">السعر</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedPlayers.length > 0 ? (
                        sortedPlayers.map((player) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                showStats={true}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا يوجد لاعبون
                            </h3>
                            <p className="text-gray-500">
                                لا يوجد لاعبون يطابقون معايير البحث
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
