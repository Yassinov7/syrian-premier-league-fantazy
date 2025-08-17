'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, Player, Club, UserTeam } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { TeamFormation } from '@/components/team-selection/TeamFormation'
import { PlayersList } from '@/components/team-selection/PlayersList'
import { TeamSummary } from '@/components/team-selection/TeamSummary'
import { SaveTeamModal } from '@/components/team-selection/SaveTeamModal'
import { Save, RotateCcw } from 'lucide-react'
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

interface Round {
    id: string
    season_id: string
    name: string
    round_number: number
    deadline_at: string
    status: 'open' | 'locked' | 'finished'
}

export default function TeamSelectionPage() {
    const { user, loading: authLoading } = useAuth()
    const { addToast } = useToast()
    const { showConfirm } = useConfirmDialog()
    const [players, setPlayers] = useState<Player[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [seasons, setSeasons] = useState<Season[]>([])
    const [rounds, setRounds] = useState<Round[]>([])
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
    const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
    const [budget] = useState(100)
    const [loading, setLoading] = useState(true)
    const [captainId, setCaptainId] = useState<string>('')
    const [viceCaptainId, setViceCaptainId] = useState<string>('')
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            const [playersRes, clubsRes, seasonsRes, roundsRes, teamRes] = await Promise.all([
                supabase.from('players').select('*').order('name'),
                supabase.from('clubs').select('*').order('name'),
                supabase.from('seasons').select('*').order('start_date', { ascending: false }),
                supabase.from('rounds').select('*').order('round_number'),
                supabase.from('user_teams').select('*').eq('user_id', user!.id).single()
            ])

            if (playersRes.data) setPlayers(playersRes.data)
            if (clubsRes.data) setClubs(clubsRes.data)
            if (seasonsRes.data) setSeasons(seasonsRes.data)
            if (roundsRes.data) setRounds(roundsRes.data)
            if (teamRes.data) setUserTeam(teamRes.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
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
            if (selectedPlayers.length < 15) {
                setSelectedPlayers([...selectedPlayers, player])
            }
        }
    }

    const handlePlayerDrop = (player: Player) => {
        if (selectedPlayers.length < 15 && !selectedPlayers.find(p => p.id === player.id)) {
            setSelectedPlayers([...selectedPlayers, player])
        }
    }

    const handleRemovePlayer = (playerId: string) => {
        setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId))

        // Remove captain/vice captain if this player was one
        if (captainId === playerId) setCaptainId('')
        if (viceCaptainId === playerId) setViceCaptainId('')
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
        setSaving(true)
        try {
            // Save or update user team
            let teamId = userTeam?.id
            if (!teamId) {
                const { data: newTeam, error: teamError } = await supabase
                    .from('user_teams')
                    .insert({
                        user_id: user!.id,
                        name: teamName
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
                    .update({ name: teamName })
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
                is_vice_captain: player.id === viceCaptainId
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

    const getCurrentRound = () => {
        const activeSeason = getActiveSeason()
        if (!activeSeason) return null
        return rounds.find(r => r.season_id === activeSeason.id && r.status === 'open')
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
    const currentRound = getCurrentRound()

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
                                onClick={resetTeam}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 space-x-reverse"
                            >
                                <RotateCcw className="h-5 w-5" />
                                <span>إعادة تعيين</span>
                            </button>
                            <button
                                onClick={() => setShowSaveModal(true)}
                                disabled={selectedPlayers.length !== 15}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 space-x-reverse ${selectedPlayers.length === 15
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Save className="h-5 w-5" />
                                <span>حفظ الفريق</span>
                            </button>
                        </div>
                    </div>

                    {/* Season and Round Info */}
                    {activeSeason && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>الموسم الحالي:</strong> {activeSeason.name}
                            </p>
                        </div>
                    )}
                    {currentRound && (
                        <div className="mt-2 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>الجولة الحالية:</strong> {currentRound.name} -
                                الموعد النهائي: {new Date(currentRound.deadline_at).toLocaleDateString('ar-SA')}
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
                            captainId={captainId}
                            viceCaptainId={viceCaptainId}
                        />

                        {/* Team Summary */}
                        <TeamSummary
                            selectedPlayers={selectedPlayers}
                            budget={budget}
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
                    budget={budget}
                    captainId={captainId}
                    viceCaptainId={viceCaptainId}
                />
            </div>
        </AppLayout>
    )
}