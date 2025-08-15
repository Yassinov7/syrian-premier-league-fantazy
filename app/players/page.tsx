'use client'

import { useState, useEffect } from 'react'
import { Player, Club } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Search, Filter, Trophy, Users } from 'lucide-react'
import { PlayerCard } from '@/components/players/PlayerCard'
import { StatCard } from '@/components/stats/StatCard'

export default function PlayersPage() {
    const [players, setPlayers] = useState<Player[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPosition, setSelectedPosition] = useState<string>('all')
    const [selectedClub, setSelectedClub] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'name' | 'points' | 'price'>('name')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [playersRes, clubsRes] = await Promise.all([
                supabase.from('players').select('*').order('name'),
                supabase.from('clubs').select('*').order('name')
            ])

            if (playersRes.data) setPlayers(playersRes.data)
            if (clubsRes.data) setClubs(clubsRes.data)
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
                            قائمة اللاعبين
                        </h1>
                        <p className="text-gray-600">
                            اختر أفضل اللاعبين لبناء فريقك
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
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
                        title="متوسط السعر"
                        value={Math.round(players.reduce((sum, p) => sum + p.price, 0) / players.length)}
                        icon={<Trophy className="h-6 w-6" />}
                        color="green"
                    />
                    <StatCard
                        title="أكثر الأندية"
                        value={new Set(players.map(p => p.club_id)).size}
                        icon={<Users className="h-6 w-6" />}
                        color="purple"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="البحث عن لاعب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Position Filter */}
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">جميع المراكز</option>
                            <option value="GK">حارس مرمى</option>
                            <option value="DEF">مدافع</option>
                            <option value="MID">لاعب وسط</option>
                            <option value="FWD">مهاجم</option>
                        </select>

                        {/* Club Filter */}
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">جميع الأندية</option>
                            {clubs.map(club => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="name">ترتيب بالاسم</option>
                            <option value="points">ترتيب بالنقاط</option>
                            <option value="price">ترتيب بالسعر</option>
                        </select>
                    </div>
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedPlayers.map(player => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            showStats={true}
                        />
                    ))}
                </div>

                {sortedPlayers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            لم يتم العثور على لاعبين
                        </h3>
                        <p className="text-gray-500">
                            جرب تغيير معايير البحث
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
