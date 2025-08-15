'use client'

import { useState, useEffect } from 'react'
import { Club, Player, Match } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Plus, Trophy, Users, Calendar, Settings } from 'lucide-react'
import { AddClubModal } from './AddClubModal'
import { AddPlayerModal } from './AddPlayerModal'
import { AddMatchModal } from './AddMatchModal'

export function AdminDashboard() {
    const [clubs, setClubs] = useState<Club[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddClub, setShowAddClub] = useState(false)
    const [showAddPlayer, setShowAddPlayer] = useState(false)
    const [showAddMatch, setShowAddMatch] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [clubsRes, playersRes, matchesRes] = await Promise.all([
                supabase.from('clubs').select('*').order('name'),
                supabase.from('players').select('*').order('name'),
                supabase.from('matches').select('*').order('match_date', { ascending: false })
            ])

            if (clubsRes.data) setClubs(clubsRes.data)
            if (playersRes.data) setPlayers(playersRes.data)
            if (matchesRes.data) setMatches(matchesRes.data)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    لوحة تحكم المشرف 🛠️
                </h2>
                <p className="text-gray-600">
                    إدارة الأندية واللاعبين والمباريات
                </p>
            </div>

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
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المباريات</p>
                            <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Settings className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">الإعدادات</p>
                            <p className="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">إجراءات سريعة</h3>
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

            {/* Recent Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Clubs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">آخر الأندية المضافة</h3>
                    </div>
                    <div className="p-6">
                        {clubs.slice(0, 5).map((club) => (
                            <div key={club.id} className="flex items-center space-x-3 space-x-reverse mb-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 text-sm font-medium">
                                        {club.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{club.name}</p>
                                    <p className="text-sm text-gray-500">{club.city}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Matches */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">آخر المباريات</h3>
                    </div>
                    <div className="p-6">
                        {matches.slice(0, 5).map((match) => (
                            <div key={match.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">
                                            {clubs.find(c => c.id === match.home_club_id)?.name} vs {clubs.find(c => c.id === match.away_club_id)?.name}
                                        </p>
                                        <p className="text-gray-500">{new Date(match.match_date).toLocaleDateString('ar-SA')}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === 'finished' ? 'bg-green-100 text-green-800' :
                                            match.status === 'live' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {match.status === 'finished' ? 'منتهية' :
                                            match.status === 'live' ? 'مباشر' : 'مجدولة'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddClub && (
                <AddClubModal
                    onClose={() => setShowAddClub(false)}
                    onSuccess={handleClubAdded}
                />
            )}

            {showAddPlayer && (
                <AddPlayerModal
                    clubs={clubs}
                    onClose={() => setShowAddPlayer(false)}
                    onSuccess={handlePlayerAdded}
                />
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