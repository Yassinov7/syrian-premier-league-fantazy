'use client'

import { useState, useEffect } from 'react'
import { Match, Club } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Calendar, Filter, Trophy } from 'lucide-react'
import { MatchCard } from '@/components/matches/MatchCard'
import { StatCard } from '@/components/stats/StatCard'

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedClub, setSelectedClub] = useState<string>('all')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [matchesRes, clubsRes] = await Promise.all([
                supabase.from('matches').select('*').order('match_date', { ascending: false }),
                supabase.from('clubs').select('*').order('name')
            ])

            if (matchesRes.data) setMatches(matchesRes.data)
            if (clubsRes.data) setClubs(clubsRes.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredMatches = matches.filter(match => {
        const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus
        const matchesClub = selectedClub === 'all' ||
            match.home_club_id === selectedClub ||
            match.away_club_id === selectedClub

        return matchesStatus && matchesClub
    })

    const getClubName = (clubId: string) => {
        return clubs.find(c => c.id === clubId)?.name || 'غير محدد'
    }

    const getStatusCount = (status: string) => {
        return matches.filter(m => m.status === status).length
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
                            المباريات
                        </h1>
                        <p className="text-gray-600">
                            تابع جميع مباريات الدوري
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="إجمالي المباريات"
                        value={matches.length}
                        icon={<Trophy className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="مباريات مجدولة"
                        value={getStatusCount('scheduled')}
                        icon={<Calendar className="h-6 w-6" />}
                        color="yellow"
                    />
                    <StatCard
                        title="مباريات مباشرة"
                        value={getStatusCount('live')}
                        icon={<Trophy className="h-6 w-6" />}
                        color="red"
                    />
                    <StatCard
                        title="مباريات منتهية"
                        value={getStatusCount('finished')}
                        icon={<Trophy className="h-6 w-6" />}
                        color="green"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="scheduled">مجدولة</option>
                            <option value="live">مباشر</option>
                            <option value="finished">منتهية</option>
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
                    </div>
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.map(match => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            homeClub={clubs.find(c => c.id === match.home_club_id)}
                            awayClub={clubs.find(c => c.id === match.away_club_id)}
                            showActions={true}
                        />
                    ))}
                </div>

                {filteredMatches.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            لم يتم العثور على مباريات
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
