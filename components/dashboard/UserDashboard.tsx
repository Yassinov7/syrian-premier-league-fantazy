'use client'

import { useState, useEffect } from 'react'
import { User, UserTeam, Player } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { Trophy, Users, TrendingUp, Calendar } from 'lucide-react'

interface UserDashboardProps {
    user: User | null
}

export function UserDashboard({ user }: UserDashboardProps) {
    const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
    const [teamPlayers, setTeamPlayers] = useState<Player[]>([])
    const [totalPoints, setTotalPoints] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchUserTeam()
        }
    }, [user])

    const fetchUserTeam = async () => {
        if (!user) return

        try {
            // Fetch user's team
            const { data: team } = await supabase
                .from('user_teams')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (team) {
                setUserTeam(team)
                setTotalPoints(team.total_points)

                // Fetch team players
                const { data: players } = await supabase
                    .from('user_team_players')
                    .select(`
            *,
            players (*)
          `)
                    .eq('user_team_id', team.id)

                if (players) {
                    setTeamPlayers(players.map(p => p.players).filter(Boolean))
                }
            }
        } catch (error) {
            console.error('Error fetching user team:', error)
        } finally {
            setLoading(false)
        }
    }

    const createTeam = async () => {
        if (!user) return

        try {
            const { data: team } = await supabase
                .from('user_teams')
                .insert([
                    {
                        user_id: user.id,
                        name: `فريق ${user.full_name}`,
                        total_points: 0
                    }
                ])
                .select()
                .single()

            if (team) {
                setUserTeam(team)
                setTotalPoints(0)
            }
        } catch (error) {
            console.error('Error creating team:', error)
        }
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
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    مرحباً، {user?.full_name}! 👋
                </h2>
                <p className="text-gray-600">
                    استعد فريقك وابدأ رحلة الفانتازي!
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">إجمالي النقاط</p>
                            <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">عدد اللاعبين</p>
                            <p className="text-2xl font-bold text-gray-900">{teamPlayers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المركز</p>
                            <p className="text-2xl font-bold text-gray-900">-</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="mr-4">
                            <p className="text-sm font-medium text-gray-600">المباريات</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">فريقي</h3>
                </div>

                <div className="p-6">
                    {!userTeam ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم إنشاء فريق بعد</h3>
                            <p className="text-gray-500 mb-6">
                                ابدأ بإنشاء فريقك واختر أفضل اللاعبين
                            </p>
                            <button
                                onClick={createTeam}
                                className="btn-primary"
                            >
                                إنشاء فريق
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-gray-900">{userTeam.name}</h4>
                                <span className="text-sm text-gray-500">النقاط: {userTeam.total_points}</span>
                            </div>

                            {teamPlayers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    لم يتم اختيار أي لاعبين بعد. ابدأ ببناء فريقك!
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {teamPlayers.map((player) => (
                                        <div key={player.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-3 space-x-reverse">
                                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-600 font-medium">
                                                        {player.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{player.name}</p>
                                                    <p className="text-sm text-gray-500">{player.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 