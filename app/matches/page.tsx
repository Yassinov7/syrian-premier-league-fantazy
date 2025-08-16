'use client'

import { useState, useEffect } from 'react'
import { Match, Club } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Calendar, Filter, Trophy, Clock, CheckCircle } from 'lucide-react'
import { MatchCard } from '@/components/matches/MatchCard'
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

interface Round {
    id: string
    season_id: string
    name: string
    round_number: number
    deadline_at: string
    status: 'open' | 'locked' | 'finished'
}

export default function MatchesPage() {
    const { user, loading: authLoading } = useAuth()
    const [matches, setMatches] = useState<Match[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [rounds, setRounds] = useState<Round[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedClub, setSelectedClub] = useState<string>('all')
    const [selectedSeason, setSelectedSeason] = useState<string>('all')
    const [selectedRound, setSelectedRound] = useState<string>('all')

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            const [matchesRes, clubsRes, seasonsRes, roundsRes] = await Promise.all([
                supabase.from('matches').select('*').order('match_date', { ascending: false }),
                supabase.from('clubs').select('*').order('name'),
                supabase.from('seasons').select('*').order('start_date', { ascending: false }),
                supabase.from('rounds').select('*').order('round_number')
            ])

            if (matchesRes.data) setMatches(matchesRes.data)
            if (clubsRes.data) setClubs(clubsRes.data)
            if (seasonsRes.data) setSeasons(seasonsRes.data)
            if (roundsRes.data) setRounds(roundsRes.data)
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
        const matchesSeason = selectedSeason === 'all' ||
            (match.round_id && rounds.find(r => r.id === match.round_id)?.season_id === selectedSeason)
        const matchesRound = selectedRound === 'all' || match.round_id === selectedRound

        return matchesStatus && matchesClub && matchesSeason && matchesRound
    })

    const getClubName = (clubId: string) => {
        return clubs.find(c => c.id === clubId)?.name || 'غير محدد'
    }

    const getStatusCount = (status: string) => {
        return matches.filter(m => m.status === status).length
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
                    <h1 className="text-3xl font-bold text-gray-900">المباريات</h1>
                    <p className="mt-2 text-gray-600">
                        تابع جميع مباريات الدوري
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
                        icon={<Clock className="h-6 w-6" />}
                        color="red"
                    />
                    <StatCard
                        title="مباريات منتهية"
                        value={getStatusCount('finished')}
                        icon={<CheckCircle className="h-6 w-6" />}
                        color="green"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">تصفية المباريات</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="scheduled">مجدولة</option>
                                <option value="live">مباشرة</option>
                                <option value="finished">منتهية</option>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">الموسم</label>
                            <select
                                value={selectedSeason}
                                onChange={(e) => setSelectedSeason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">جميع المواسم</option>
                                {seasons.map((season) => (
                                    <option key={season.id} value={season.id}>
                                        {season.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">الجولة</label>
                            <select
                                value={selectedRound}
                                onChange={(e) => setSelectedRound(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">جميع الجولات</option>
                                {rounds.map((round) => (
                                    <option key={round.id} value={round.id}>
                                        {round.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.length > 0 ? (
                        filteredMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                homeClub={clubs.find(c => c.id === match.home_club_id)}
                                awayClub={clubs.find(c => c.id === match.away_club_id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا توجد مباريات
                            </h3>
                            <p className="text-gray-500">
                                لا توجد مباريات تطابق معايير البحث
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
