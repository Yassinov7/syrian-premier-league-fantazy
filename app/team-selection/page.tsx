'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, Player, Club, UserTeam, League, GameWeek, UserTeamPlayer } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { TeamFormation } from '@/components/team-selection/TeamFormation'
import { PlayersList } from '@/components/team-selection/PlayersList'
import { TeamSummary } from '@/components/team-selection/TeamSummary'
import { SaveTeamModal } from '@/components/team-selection/SaveTeamModal'
import { LeagueSelector } from '@/components/team-selection/LeagueSelector'
import { Save, RotateCcw, Trophy, Users, Calendar } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FullPageSpinner } from '@/components/ui/LoadingSpinner'

interface Season {
    id: string
    name: string
    start_date: string
    end_date: string
    is_active: boolean
}

export default function TeamSelectionPage() {
    const { user, loading: authLoading } = useAuth()
    const { addToast } = useToast()
    const { showConfirm } = useConfirmDialog()
    
    // Data states
    const [players, setPlayers] = useState<Player[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [gameWeeks, setGameWeeks] = useState<GameWeek[]>([])
    const [leagues, setLeagues] = useState<League[]>([])
    const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
    
    // Team states
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
    const [captainId, setCaptainId] = useState<string>('')
    const [viceCaptainId, setViceCaptainId] = useState<string>('')
    const [selectedLeagueId, setSelectedLeagueId] = useState<string>('')
    
    // UI states
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [showLeagueSelector, setShowLeagueSelector] = useState(false)
    
    // Constants
    const BUDGET = 100
    const MAX_PLAYERS = 15
    const MIN_PLAYERS = 11

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            setLoading(true)
            
            // Fetch all required data
            const [
                playersRes, 
                clubsRes, 
                seasonsRes, 
                gameWeeksRes, 
                leaguesRes,
                userTeamRes
            ] = await Promise.all([
                supabase.from('players').select('*').order('name'),
                supabase.from('clubs').select('*').order('name'),
                supabase.from('seasons').select('*').order('start_date', { ascending: false }),
                supabase.from('game_weeks').select('*').order('round_number'),
                supabase.from('leagues').select('*').eq('is_active', true).order('name'),
                supabase.from('user_teams').select('*').eq('user_id', user!.id).single()
            ])

            if (playersRes.data) setPlayers(playersRes.data)
            if (clubsRes.data) setClubs(clubsRes.data)
            if (seasonsRes.data) setSeasons(seasonsRes.data)
            if (gameWeeksRes.data) setGameWeeks(gameWeeksRes.data)
            if (leaguesRes.data) setLeagues(leaguesRes.data)
            if (userTeamRes.data) {
                setUserTeam(userTeamRes.data)
                setSelectedLeagueId(userTeamRes.data.league_id || '')
                await loadUserTeam(userTeamRes.data.id)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            addToast({
                type: 'error',
                title: 'خطأ في تحميل البيانات',
                message: 'حدث خطأ أثناء تحميل البيانات. يرجى تحديث الصفحة.'
            })
        } finally {
            setLoading(false)
        }
    }

    const loadUserTeam = async (teamId: string) => {
        try {
            // Fetch team players with their details
            const { data: teamPlayers, error } = await supabase
                .from('user_team_players')
                .select(`
                    *,
                    players (*)
                `)
                .eq('user_team_id', teamId)

            if (error) throw error

            if (teamPlayers && teamPlayers.length > 0) {
                const loadedPlayers = teamPlayers.map(tp => ({
                    ...tp.players,
                    isStartingXI: tp.is_starting_xi !== false // Default to true if not set
                })) as Player[]

                setSelectedPlayers(loadedPlayers)

                // Set captain and vice captain
                const captain = teamPlayers.find(tp => tp.is_captain)
                const viceCaptain = teamPlayers.find(tp => tp.is_vice_captain)
                
                if (captain) setCaptainId(captain.player_id)
                if (viceCaptain) setViceCaptainId(vice_captain.player_id)
            }
        } catch (error) {
            console.error('Error loading user team:', error)
        }
    }

    const handlePlayerSelect = (player: Player) => {
        if (selectedPlayers.find(p => p.id === player.id)) {
            // Remove player
            setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id))

            // Remove captain/vice captain if this player was one
            if (captainId === player.id) setCaptainId('')
            if (viceCaptainId === player.id) setViceCaptainId('')
        } else {
            // Add player if we haven't reached the limit
            if (selectedPlayers.length < MAX_PLAYERS) {
                const playerWithStartingXI = { ...player, isStartingXI: true }
                setSelectedPlayers([...selectedPlayers, playerWithStartingXI])
            } else {
                addToast({
                    type: 'warning',
                    title: 'حد أقصى للاعبين',
                    message: `لا يمكن اختيار أكثر من ${MAX_PLAYERS} لاعب`
                })
            }
        }
    }

    const handlePlayerDrop = (player: Player) => {
        if (selectedPlayers.length < MAX_PLAYERS && !selectedPlayers.find(p => p.id === player.id)) {
            const playerWithStartingXI = { ...player, isStartingXI: true }
            setSelectedPlayers([...selectedPlayers, playerWithStartingXI])
        }
    }

    const handleRemovePlayer = (playerId: string) => {
        setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))

        // Remove captain/vice captain if this player was one
        if (captainId === playerId) setCaptainId('')
        if (viceCaptainId === playerId) setViceCaptainId('')
    }

    const handleToggleStartingXI = (playerId: string) => {
        setSelectedPlayers(selectedPlayers.map(player => 
            player.id === playerId 
                ? { ...player, isStartingXI: !player.isStartingXI }
                : player
        ))
    }

    const handleSetCaptain = (playerId: string) => {
        if (captainId === playerId) {
            setCaptainId('')
        } else {
            setCaptainId(playerId)
            // If this player was vice captain, remove it
            if (viceCaptainId === playerId) {
                setViceCaptainId('')
            }
        }
    }

    const handleSetViceCaptain = (playerId: string) => {
        if (viceCaptainId === playerId) {
            setViceCaptainId('')
        } else {
            // Can't be both captain and vice captain
            if (captainId !== playerId) {
                setViceCaptainId(playerId)
            }
        }
    }

    const handleSaveTeam = async (teamName: string, captainId: string, viceCaptainId: string) => {
        if (!selectedLeagueId) {
            addToast({
                type: 'error',
                title: 'يجب اختيار دوري',
                message: 'يجب اختيار دوري قبل حفظ الفريق'
            })
            return
        }

        setSaving(true)
        try {
            // Save or update user team
            let teamId = userTeam?.id
            if (!teamId) {
                const { data: newTeam, error: teamError } = await supabase
                    .from('user_teams')
                    .insert({
                        user_id: user!.id,
                        name: teamName,
                        league_id: selectedLeagueId
                    })
                    .select()
                    .single()

                if (teamError) throw teamError
                teamId = newTeam.id
                setUserTeam(newTeam)
            } else {
                // Update existing team
                const { error: updateError } = await supabase
                    .from('user_teams')
                    .update({ 
                        name: teamName,
                        league_id: selectedLeagueId
                    })
                    .eq('id', teamId)

                if (updateError) throw updateError
            }

            // Clear existing team players
            const { error: deleteError } = await supabase
                .from('user_team_players')
                .delete()
                .eq('user_team_id', teamId)

            if (deleteError) throw deleteError

            // Insert new team players
            const teamPlayers = selectedPlayers.map(player => ({
                user_team_id: teamId,
                player_id: player.id,
                is_captain: player.id === captainId,
                is_vice_captain: player.id === viceCaptainId,
                is_starting_xi: player.isStartingXI !== false
            }))

            const { error: insertError } = await supabase
                .from('user_team_players')
                .insert(teamPlayers)

            if (insertError) throw insertError

            // Update captain and vice captain
            setCaptainId(captainId)
            setViceCaptainId(viceCaptainId)

            // Show success message
            addToast({
                type: 'success',
                title: 'تم حفظ الفريق بنجاح! 🎉',
                message: 'تم حفظ فريقك بنجاح ويمكنك الآن متابعة أدائه'
            })

            setShowSaveModal(false)
        } catch (error) {
            console.error('Error saving team:', error)
            addToast({
                type: 'error',
                title: 'خطأ في حفظ الفريق',
                message: 'حدث خطأ أثناء حفظ الفريق. يرجى المحاولة مرة أخرى.'
            })
        } finally {
            setSaving(false)
        }
    }

    const resetTeam = () => {
        showConfirm({
            title: 'تأكيد إعادة تعيين الفريق',
            message: 'هل أنت متأكد من إعادة تعيين الفريق؟ سيتم فقدان جميع التغييرات.',
            type: 'warning',
            confirmText: 'إعادة تعيين',
            cancelText: 'إلغاء',
            onConfirm: () => {
                setSelectedPlayers([])
                setCaptainId('')
                setViceCaptainId('')
                addToast({
                    type: 'info',
                    title: 'تم إعادة تعيين الفريق',
                    message: 'تم مسح جميع اللاعبين المختارين'
                })
            }
        })
    }

    const getActiveSeason = () => {
        return seasons.find(s => s.is_active) || seasons[0]
    }

    const getCurrentGameWeek = () => {
        const activeSeason = getActiveSeason()
        if (!activeSeason) return null
        return gameWeeks.find(gw => 
            gw.season_id === activeSeason.id && 
            gw.status === 'upcoming'
        )
    }

    const getSelectedLeague = () => {
        return leagues.find(l => l.id === selectedLeagueId)
    }

    const canSaveTeam = () => {
        const startingXICount = selectedPlayers.filter(p => p.isStartingXI !== false).length
        return selectedPlayers.length >= MIN_PLAYERS && 
               selectedPlayers.length <= MAX_PLAYERS && 
               startingXICount === 11 &&
               captainId && 
               viceCaptainId &&
               selectedLeagueId
    }

    if (authLoading || loading) {
        return (
            <AppLayout userRole="user">
                <FullPageSpinner message="جاري تحميل بيانات الفريق..." />
            </AppLayout>
        )
    }

    if (!user) {
        window.location.href = '/'
        return null
    }

    const activeSeason = getActiveSeason()
    const currentGameWeek = getCurrentGameWeek()
    const selectedLeague = getSelectedLeague()

    return (
        <AppLayout userRole="user">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">بناء الفريق الفانتازي</h1>
                            <p className="mt-2 text-gray-600">
                                اختر أفضل اللاعبين لبناء فريقك
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                                onClick={() => setShowLeagueSelector(true)}
                                className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 space-x-reverse"
                            >
                                <Trophy className="h-5 w-5" />
                                <span>اختيار الدوري</span>
                            </button>
                            <button
                                onClick={resetTeam}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 space-x-reverse"
                            >
                                <RotateCcw className="h-5 w-5" />
                                <span>إعادة تعيين</span>
                            </button>
                            <button
                                onClick={() => setShowSaveModal(true)}
                                disabled={!canSaveTeam()}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 space-x-reverse ${canSaveTeam()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Save className="h-5 w-5" />
                                <span>حفظ الفريق</span>
                            </button>
                        </div>
                    </div>

                    {/* League and Season Info */}
                    {selectedLeague && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                                        <Trophy className="h-5 w-5 mr-2" />
                                        {selectedLeague.name}
                                    </h3>
                                    <p className="text-sm text-purple-600">
                                        {selectedLeague.type === 'public' ? 'دوري عام' : 'دوري خاص'}
                                        {selectedLeague.description && ` - ${selectedLeague.description}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-purple-600">
                                        <Users className="h-4 w-4 inline mr-1" />
                                        {selectedLeague.max_teams || 'غير محدد'} فريق
                                    </div>
                                    {selectedLeague.entry_fee && (
                                        <div className="text-sm text-purple-600">
                                            رسوم الانضمام: {selectedLeague.entry_fee} مليون
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Season and GameWeek Info */}
                    {activeSeason && (
                        <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>الموسم الحالي:</strong> {activeSeason.name}
                            </p>
                        </div>
                    )}
                    {currentGameWeek && (
                        <div className="mt-2 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>الجولة الحالية:</strong> {currentGameWeek.name} -
                                الموعد النهائي: {new Date(currentGameWeek.deadline).toLocaleDateString('ar-SA')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column - Team Formation and Summary */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Team Formation */}
                        <TeamFormation
                            selectedPlayers={selectedPlayers}
                            onRemovePlayer={handleRemovePlayer}
                            onSetCaptain={handleSetCaptain}
                            onSetViceCaptain={handleSetViceCaptain}
                            onToggleStartingXI={handleToggleStartingXI}
                            captainId={captainId}
                            viceCaptainId={viceCaptainId}
                        />

                        {/* Team Summary */}
                        <TeamSummary
                            selectedPlayers={selectedPlayers}
                            budget={BUDGET}
                            captainId={captainId}
                            viceCaptainId={viceCaptainId}
                        />
                    </div>

                    {/* Right Column - Players List */}
                    <div className="xl:col-span-1">
                        <PlayersList
                            players={players}
                            clubs={clubs}
                            selectedPlayers={selectedPlayers}
                            onPlayerSelect={handlePlayerSelect}
                            onPlayerDrop={handlePlayerDrop}
                        />
                    </div>
                </div>

                {/* Save Team Modal */}
                <SaveTeamModal
                    isOpen={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    onSave={handleSaveTeam}
                    selectedPlayers={selectedPlayers}
                    budget={BUDGET}
                    captainId={captainId}
                    viceCaptainId={viceCaptainId}
                    selectedLeague={selectedLeague}
                />

                {/* League Selector Modal */}
                <LeagueSelector
                    isOpen={showLeagueSelector}
                    onClose={() => setShowLeagueSelector(false)}
                    leagues={leagues}
                    selectedLeagueId={selectedLeagueId}
                    onSelectLeague={setSelectedLeagueId}
                    user={user}
                />
            </div>
        </AppLayout>
    )
}