'use client'

import { useState, useEffect } from 'react'
import { Club, Player, Match } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Plus, Trophy, Users, Calendar, Settings, Target, Clock, CheckCircle } from 'lucide-react'
import { AddClubModal } from './AddClubModal'
import { AddPlayerModal } from './AddPlayerModal'
import { AddMatchModal } from './AddMatchModal'

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

export function AdminDashboard() {
    const [clubs, setClubs] = useState<Club[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [rounds, setRounds] = useState<Round[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddClub, setShowAddClub] = useState(false)
    const [showAddPlayer, setShowAddPlayer] = useState(false)
    const [showAddMatch, setShowAddMatch] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [clubsRes, playersRes, matchesRes, seasonsRes, roundsRes] = await Promise.all([
                supabase.from('clubs').select('*').order('name'),
                supabase.from('players').select('*').order('name'),
                supabase.from('matches').select('*').order('match_date', { ascending: false }),
                supabase.from('seasons').select('*').order('start_date', { ascending: false }),
                supabase.from('rounds').select('*').order('round_number')
            ])

            if (clubsRes.data) setClubs(clubsRes.data)
            if (playersRes.data) setPlayers(playersRes.data)
            if (matchesRes.data) setMatches(matchesRes.data)
            if (seasonsRes.data) setSeasons(seasonsRes.data)
            if (roundsRes.data) setRounds(roundsRes.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClubAdded = () => {
        setShowAddClub(false)
        fetchData()
    }

    const handlePlayerAdded = () => {
        setShowAddPlayer(false)
        fetchData()
    }

    const handleMatchAdded = () => {
        setShowAddMatch(false)
        fetchData()
    }

    const getMatchStatus = (match: Match) => {
        if (match.status === 'finished') return { text: 'منتهية', color: 'bg-gray-100 text-gray-800' }
        if (match.status === 'live') return { text: 'مباشر', color: 'bg-red-100 text-red-800' }
        return { text: 'مجدولة', color: 'bg-green-100 text-green-800' }
    }

    const getActiveSeason = () => {
        return seasons.find(s => s.is_active) || seasons[0]
    }

    const getCurrentRound = () => {
        const activeSeason = getActiveSeason()
        if (!activeSeason) return null
        return rounds.find(r => r.season_id === activeSeason.id && r.status === 'open')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    const activeSeason = getActiveSeason()
    const currentRound = getCurrentRound()
    const scheduledMatches = matches.filter(m => m.status === 'scheduled').length
    const liveMatches = matches.filter(m => m.status === 'live').length
    const finishedMatches = matches.filter(m => m.status === 'finished').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    لوحة تحكم المشرف 🛠️
                </h2>
                <p className="text-gray-600">
                    إدارة الأندية واللاعبين والمباريات والمواسم
                </p>
            </div>

            {/* Season & Round Info */}
            {activeSeason && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                الموسم الحالي: {activeSeason.name}
                            </h3>
                            <p className="text-gray-600">
                                من {new Date(activeSeason.start_date).toLocaleDateString('ar-SA')}
                                إلى {new Date(activeSeason.end_date).toLocaleDateString('ar-SA')}
                            </p>
                        </div>
                        {currentRound && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600">الجولة الحالية</p>
                                <p className="text-lg font-bold text-blue-600">{currentRound.name}</p>
                                <p className="text-xs text-gray-500">
                                    الموعد النهائي: {new Date(currentRound.deadline_at).toLocaleDateString('ar-SA')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">الأندية</p>
                            <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">اللاعبين</p>
                            <p className="text-2xl font-bold text-gray-900">{players.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المباريات</p>
                            <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المواسم</p>
                            <p className="text-2xl font-bold text-gray-900">{seasons.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">مباريات مجدولة</p>
                            <p className="text-2xl font-bold text-gray-900">{scheduledMatches}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Clock className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">مباريات مباشر</p>
                            <p className="text-2xl font-bold text-gray-900">{liveMatches}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">مباريات منتهية</p>
                            <p className="text-2xl font-bold text-gray-900">{finishedMatches}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setShowAddClub(true)}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
                        <Plus className="h-4 w-4" />
                        <span>إضافة نادي</span>
                    </button>
                    <button
                        onClick={() => setShowAddPlayer(true)}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
                        <Plus className="h-4 w-4" />
                        <span>إضافة لاعب</span>
                    </button>
                    <button
                        onClick={() => setShowAddMatch(true)}
                        className="btn-primary flex items-center space-x-2 space-x-reverse"
                    >
                        <Plus className="h-4 w-4" />
                        <span>إضافة مباراة</span>
                    </button>
                </div>
            </div>

            {/* Recent Matches */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر المباريات</h3>
                {matches.slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                        {matches.slice(0, 5).map((match) => (
                            <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(match.match_date).toLocaleDateString('ar-SA')}
                                    </span>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMatchStatus(match).color}`}>
                                    {getMatchStatus(match).text}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد مباريات بعد</p>
                )}
            </div>

            {/* Modals */}
            {showAddClub && (
                <AddClubModal onClose={() => setShowAddClub(false)} onSuccess={handleClubAdded} />
            )}
            {showAddPlayer && (
                <AddPlayerModal onClose={() => setShowAddPlayer(false)} onSuccess={handlePlayerAdded} />
            )}
            {showAddMatch && (
                <AddMatchModal
                    clubs={clubs}
                    onClose={() => setShowAddMatch(false)}
                    onSuccess={handleMatchAdded}
                />
            )}
        </div>
    )
} 