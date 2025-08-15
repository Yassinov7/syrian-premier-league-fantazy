'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Plus, Edit, Trash2, Calendar, Trophy, Clock, Target, X, Save, CheckCircle, BarChart3 } from 'lucide-react'

interface Club {
    id: string
    name: string
    city: string
    founded_year: number
    logo_url?: string
}

interface Player {
    id: string
    name: string
    position: 'GK' | 'DEF' | 'MID' | 'FWD'
    club_id: string
    price: number
    total_points: number
    created_at: string
}

interface Match {
    id: string
    home_club_id: string
    away_club_id: string
    home_score?: number
    away_score?: number
    match_date: string
    status: 'scheduled' | 'live' | 'finished'
    round_id?: string
    created_at: string
}

interface Round {
    id: string
    season_id: string
    name: string
    round_number: number
    deadline_at: string
    status: 'open' | 'locked' | 'finished'
}

interface PlayerPerformance {
    id?: string
    player_id: string
    match_id: string
    goals: number
    assists: number
    yellow_cards: number
    red_cards: number
    clean_sheet: boolean
    minutes_played: number
    points: number
    created_at?: string
}

interface MatchWithDetails extends Match {
    home_club: Club
    away_club: Club
    round?: Round
}

export default function PlayerStatsPage() {
    const { user, loading: authLoading } = useAuth()
    const [matches, setMatches] = useState<MatchWithDetails[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [rounds, setRounds] = useState<Round[]>([])
    const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null)
    const [selectedRound, setSelectedRound] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [playerStats, setPlayerStats] = useState<{ [playerId: string]: PlayerPerformance }>({})
    const [existingStats, setExistingStats] = useState<{ [playerId: string]: PlayerPerformance }>({})

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [matchesResponse, playersResponse, clubsResponse, roundsResponse] = await Promise.all([
                supabase
                    .from('matches')
                    .select(`
                        *,
                        home_club:clubs!home_club_id(*),
                        away_club:clubs!away_club_id(*),
                        round:rounds(*)
                    `)
                    .order('match_date', { ascending: false }),
                supabase.from('players').select('*').order('name'),
                supabase.from('clubs').select('*').order('name'),
                supabase.from('rounds').select('*').order('round_number')
            ])

            if (matchesResponse.error) throw matchesResponse.error
            if (playersResponse.error) throw playersResponse.error
            if (clubsResponse.error) throw clubsResponse.error
            if (roundsResponse.error) throw roundsResponse.error

            setMatches(matchesResponse.data || [])
            setPlayers(playersResponse.data || [])
            setClubs(clubsResponse.data || [])
            setRounds(roundsResponse.data || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMatchSelect = async (match: MatchWithDetails) => {
        console.log('handleMatchSelect called with match:', match)
        setSelectedMatch(match)
        setPlayerStats({})
        setExistingStats({})

        // Fetch existing player performances for this match
        try {
            const { data: existingPerformances } = await supabase
                .from('player_performances')
                .select('*')
                .eq('match_id', match.id)

            if (existingPerformances) {
                const statsMap: { [playerId: string]: PlayerPerformance } = {}
                existingPerformances.forEach(perf => {
                    statsMap[perf.player_id] = perf
                })
                setExistingStats(statsMap)
                setPlayerStats(statsMap)
            }
        } catch (error) {
            console.error('Error fetching existing performances:', error)
        }
    }

    const getMatchPlayers = (match: MatchWithDetails) => {
        return players.filter(player =>
            player.club_id === match.home_club_id || player.club_id === match.away_club_id
        )
    }

    const updatePlayerStat = (playerId: string, field: keyof PlayerPerformance, value: number | boolean) => {
        setPlayerStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                player_id: playerId,
                match_id: selectedMatch!.id,
                goals: prev[playerId]?.goals ?? 0,
                assists: prev[playerId]?.assists ?? 0,
                yellow_cards: prev[playerId]?.yellow_cards ?? 0,
                red_cards: prev[playerId]?.red_cards ?? 0,
                clean_sheet: prev[playerId]?.clean_sheet ?? false,
                minutes_played: prev[playerId]?.minutes_played ?? 90,
                points: 0,
                [field]: value
            }
        }))
    }

    const calculatePlayerPoints = (player: Player, stats: PlayerPerformance) => {
        let points = 0

        // Goals
        if (player.position === 'GK' || player.position === 'DEF') {
            points += stats.goals * 6
        } else if (player.position === 'MID') {
            points += stats.goals * 5
        } else {
            points += stats.goals * 4
        }

        // Assists
        points += stats.assists * 3

        // Cards
        points += stats.yellow_cards * -1
        points += stats.red_cards * -3

        // Clean sheet (only for GK and DEF)
        if (stats.clean_sheet && (player.position === 'GK' || player.position === 'DEF')) {
            points += 4
        }

        // Minutes played bonus
        if (stats.minutes_played >= 60) {
            points += 2
        }

        return points
    }

    const handleSaveStats = async () => {
        if (!selectedMatch) return

        try {
            setSaving(true)
            const matchPlayers = getMatchPlayers(selectedMatch)
            const statsToSave: PlayerPerformance[] = []

            for (const player of matchPlayers) {
                const stats = playerStats[player.id]
                if (stats) {
                    const points = calculatePlayerPoints(player, stats)
                    statsToSave.push({
                        ...stats,
                        points,
                        match_id: selectedMatch.id
                    })
                }
            }

            // Save all player performances
            for (const stats of statsToSave) {
                if (stats.id) {
                    // Update existing
                    const { error } = await supabase
                        .from('player_performances')
                        .update(stats)
                        .eq('id', stats.id)
                    if (error) throw error
                } else {
                    // Insert new
                    const { error } = await supabase
                        .from('player_performances')
                        .insert(stats)
                    if (error) throw error
                }
            }

            // Update player total points
            for (const player of matchPlayers) {
                const stats = playerStats[player.id]
                if (stats) {
                    const points = calculatePlayerPoints(player, stats)
                    const { error } = await supabase
                        .from('players')
                        .update({ total_points: player.total_points + points })
                        .eq('id', player.id)
                    if (error) throw error
                }
            }

            // Refresh data
            await fetchData()
            setSelectedMatch(null)
            setPlayerStats({})
            setExistingStats({})
        } catch (error) {
            console.error('Error saving stats:', error)
            alert('فشل في حفظ الإحصائيات')
        } finally {
            setSaving(false)
        }
    }

    const filteredMatches = matches.filter(match => {
        const roundMatch = selectedRound === 'all' || match.round_id === selectedRound
        const statusMatch = selectedStatus === 'all' || match.status === selectedStatus
        return roundMatch && statusMatch
    })

    if (authLoading || loading) {
        return (
            <AppLayout userRole="admin">
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

    return (
        <AppLayout userRole="admin">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">إحصائيات اللاعبين</h1>
                    <p className="text-gray-600 mt-2">تسجيل إحصائيات اللاعبين في المباريات لحساب النقاط</p>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3 space-x-reverse">
                            <div className="flex-shrink-0">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-blue-800">كيفية الاستخدام:</h3>
                                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                                    <li>• اختر مباراة منتهية أو مباشرة لتسجيل إحصائيات اللاعبين</li>
                                    <li>• أدخل الأهداف والتمريرات الحاسمة والبطاقات والدقائق لكل لاعب</li>
                                    <li>• حدد "شباك نظيفة" لحارس المرمى والمدافعين (+4 نقاط)</li>
                                    <li>• سيتم حساب النقاط تلقائياً حسب نظام النقاط</li>
                                    <li>• اضغط "حفظ الإحصائيات" لحفظ البيانات</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="round-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                تصفية حسب الجولة
                            </label>
                            <select
                                id="round-filter"
                                value={selectedRound}
                                onChange={(e) => setSelectedRound(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="all">جميع الجولات</option>
                                {rounds.map((round) => (
                                    <option key={round.id} value={round.id}>
                                        {round.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                تصفية حسب الحالة
                            </label>
                            <select
                                id="status-filter"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="all">جميع الحالات</option>
                                <option value="scheduled">مباريات مجدولة</option>
                                <option value="live">مباريات مباشرة</option>
                                <option value="finished">مباريات منتهية</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Matches List */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">المباريات</h2>
                    </div>
                    {filteredMatches.length === 0 ? (
                        <div className="text-center py-12">
                            <Target className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مباريات</h3>
                            <p className="mt-1 text-sm text-gray-500">لا توجد مباريات تطابق المعايير المحددة</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredMatches.map((match) => (
                                <div key={match.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className="text-lg font-medium text-gray-900">
                                                    {match.home_club.name} vs {match.away_club.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(match.match_date).toLocaleDateString('ar-SA', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${match.status === 'finished' ? 'bg-gray-100 text-gray-800' :
                                                    match.status === 'live' ? 'bg-red-100 text-red-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {match.status === 'finished' ? 'منتهية' :
                                                        match.status === 'live' ? 'مباشر' : 'مجدولة'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            {selectedMatch?.id === match.id ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedMatch(null)
                                                        setPlayerStats({})
                                                        setExistingStats({})
                                                    }}
                                                    className="btn-secondary"
                                                >
                                                    إغلاق
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-end space-y-2">
                                                    <button
                                                        onClick={() => handleMatchSelect(match)}
                                                        className="btn-primary"
                                                        disabled={match.status === 'scheduled'}
                                                        title={match.status === 'scheduled' ? 'لا يمكن تسجيل الإحصائيات للمباريات المجدولة' : 'تسجيل إحصائيات اللاعبين'}
                                                    >
                                                        تسجيل الإحصائيات
                                                    </button>
                                                    {match.status === 'scheduled' && (
                                                        <span className="text-xs text-gray-500">
                                                            انتظر حتى تبدأ المباراة
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Player Stats Form */}
                {selectedMatch && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        إحصائيات اللاعبين - {selectedMatch.home_club.name} vs {selectedMatch.away_club.name}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        نظام النقاط: الأهداف (حارس/مدافع: 6، وسط: 5، مهاجم: 4) | التمريرات: 3 | البطاقات الصفراء: -1 | البطاقات الحمراء: -3 | شباك نظيفة: +4 | دقائق ≥60: +2
                                    </p>
                                </div>
                                <button
                                    onClick={handleSaveStats}
                                    disabled={saving}
                                    className="btn-primary flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>حفظ الإحصائيات</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            اللاعب
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            النادي
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المركز
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الأهداف
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            التمريرات الحاسمة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            البطاقات الصفراء
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            البطاقات الحمراء
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الدقائق
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            شباك نظيفة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            النقاط
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getMatchPlayers(selectedMatch).map((player) => {
                                        const stats = playerStats[player.id] || {
                                            goals: 0,
                                            assists: 0,
                                            yellow_cards: 0,
                                            red_cards: 0,
                                            clean_sheet: false,
                                            minutes_played: 90,
                                            points: 0
                                        }
                                        const points = calculatePlayerPoints(player, stats)

                                        return (
                                            <tr key={player.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {player.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {clubs.find(c => c.id === player.club_id)?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${player.position === 'GK' ? 'bg-blue-100 text-blue-800' :
                                                        player.position === 'DEF' ? 'bg-green-100 text-green-800' :
                                                            player.position === 'MID' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {player.position === 'GK' ? 'حارس' :
                                                            player.position === 'DEF' ? 'مدافع' :
                                                                player.position === 'MID' ? 'وسط' : 'مهاجم'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={stats.goals}
                                                        onChange={(e) => updatePlayerStat(player.id, 'goals', parseInt(e.target.value) || 0)}
                                                        className="input-field w-20 text-center"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={stats.assists}
                                                        onChange={(e) => updatePlayerStat(player.id, 'assists', parseInt(e.target.value) || 0)}
                                                        className="input-field w-20 text-center"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={stats.yellow_cards}
                                                        onChange={(e) => updatePlayerStat(player.id, 'yellow_cards', parseInt(e.target.value) || 0)}
                                                        className="input-field w-20 text-center"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={stats.red_cards}
                                                        onChange={(e) => updatePlayerStat(player.id, 'red_cards', parseInt(e.target.value) || 0)}
                                                        className="input-field w-20 text-center"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="90"
                                                        value={stats.minutes_played}
                                                        onChange={(e) => updatePlayerStat(player.id, 'minutes_played', parseInt(e.target.value) || 0)}
                                                        className="input-field w-20 text-center"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {(player.position === 'GK' || player.position === 'DEF') ? (
                                                        <div className="flex items-center space-x-2 space-x-reverse">
                                                            <input
                                                                type="checkbox"
                                                                checked={stats.clean_sheet}
                                                                onChange={(e) => updatePlayerStat(player.id, 'clean_sheet', e.target.checked)}
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                                                                title="شباك نظيفة (+4 نقاط)"
                                                            />
                                                            <span className="text-xs text-gray-600">
                                                                {stats.clean_sheet ? 'نعم (+4)' : 'لا'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">غير متاح</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {points}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
