'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Plus, Edit, Trash2, Calendar, Trophy, Clock, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react'
import { SeasonModal } from '@/components/admin/SeasonModal'
import { RoundModal } from '@/components/admin/RoundModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'

interface Season {
    id: string
    name: string
    start_date: string
    end_date: string
    is_active: boolean
    created_at: string
}

interface Round {
    id: string
    season_id: string
    name: string
    round_number: number
    deadline_at: string
    status: 'open' | 'locked' | 'finished'
    created_at: string
}

interface SeasonWithRounds extends Season {
    rounds: Round[]
}

export default function AdminRoundsPage() {
    const { user, loading: authLoading } = useAuth()
    const [seasons, setSeasons] = useState<SeasonWithRounds[]>([])
    const [loading, setLoading] = useState(true)
    const [showSeasonModal, setShowSeasonModal] = useState(false)
    const [showRoundModal, setShowRoundModal] = useState(false)
    const [editingSeason, setEditingSeason] = useState<Season | null>(null)
    const [editingRound, setEditingRound] = useState<Round | null>(null)
    const [deletingSeason, setDeletingSeason] = useState<Season | null>(null)
    const [deletingRound, setDeletingRound] = useState<Round | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (user) {
            fetchSeasons()
        }
    }, [user])

    const fetchSeasons = async () => {
        try {
            setLoading(true)
            const { data: seasonsData, error: seasonsError } = await supabase
                .from('seasons')
                .select('*')
                .order('start_date', { ascending: false })

            if (seasonsError) throw seasonsError

            // Fetch rounds for each season
            const seasonsWithRounds = await Promise.all(
                (seasonsData || []).map(async (season) => {
                    const { data: roundsData, error: roundsError } = await supabase
                        .from('rounds')
                        .select('*')
                        .eq('season_id', season.id)
                        .order('round_number')

                    if (roundsError) throw roundsError

                    return {
                        ...season,
                        rounds: roundsData || []
                    }
                })
            )

            setSeasons(seasonsWithRounds)
        } catch (error) {
            console.error('Error fetching seasons:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSeason = async () => {
        if (!deletingSeason) return

        try {
            setDeleteLoading(true)
            // Delete rounds first (due to foreign key constraint)
            const { error: roundsError } = await supabase
                .from('rounds')
                .delete()
                .eq('season_id', deletingSeason.id)

            if (roundsError) throw roundsError

            // Then delete season
            const { error: seasonError } = await supabase
                .from('seasons')
                .delete()
                .eq('id', deletingSeason.id)

            if (seasonError) throw seasonError

            await fetchSeasons()
            setDeletingSeason(null)
        } catch (error) {
            console.error('Error deleting season:', error)
            alert('فشل في حذف الموسم')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleDeleteRound = async () => {
        if (!deletingRound) return

        try {
            setDeleteLoading(true)
            const { error } = await supabase
                .from('rounds')
                .delete()
                .eq('id', deletingRound.id)

            if (error) throw error

            await fetchSeasons()
            setDeletingRound(null)
        } catch (error) {
            console.error('Error deleting round:', error)
            alert('فشل في حذف الجولة')
        } finally {
            setDeleteLoading(false)
        }
    }

    const toggleSeasonExpansion = (seasonId: string) => {
        const newExpanded = new Set(expandedSeasons)
        if (newExpanded.has(seasonId)) {
            newExpanded.delete(seasonId)
        } else {
            newExpanded.add(seasonId)
        }
        setExpandedSeasons(newExpanded)
    }

    const getSeasonStatus = (season: Season) => {
        const now = new Date()
        const startDate = new Date(season.start_date)
        const endDate = new Date(season.end_date)

        if (now < startDate) return { text: 'قريباً', color: 'bg-blue-100 text-blue-800' }
        if (now > endDate) return { text: 'منتهي', color: 'bg-gray-100 text-gray-800' }
        return { text: 'مستمر', color: 'bg-green-100 text-green-800' }
    }

    const getRoundStatus = (round: Round) => {
        const now = new Date()
        const deadline = new Date(round.deadline_at)

        if (round.status === 'locked') return { text: 'مقفل', color: 'bg-red-100 text-red-800' }
        if (now > deadline) return { text: 'منتهي', color: 'bg-gray-100 text-gray-800' }
        return { text: 'مفتوح', color: 'bg-green-100 text-green-800' }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleSuccess = () => {
        setShowSeasonModal(false)
        setShowRoundModal(false)
        setEditingSeason(null)
        setEditingRound(null)
        fetchSeasons()
    }

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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة الجولات</h1>
                        <p className="text-gray-600 mt-2">إنشاء وإدارة المواسم والجولات</p>
                    </div>
                    <div className="flex space-x-3 space-x-reverse">
                        <button
                            onClick={() => setShowRoundModal(true)}
                            className="btn-secondary flex items-center space-x-2 space-x-reverse"
                        >
                            <Plus className="h-4 w-4" />
                            <span>إضافة جولة</span>
                        </button>
                        <button
                            onClick={() => setShowSeasonModal(true)}
                            className="btn-primary flex items-center space-x-2 space-x-reverse"
                        >
                            <Plus className="h-4 w-4" />
                            <span>إضافة موسم</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Trophy className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">إجمالي المواسم</p>
                                <p className="text-2xl font-bold text-gray-900">{seasons.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">إجمالي الجولات</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {seasons.reduce((total, season) => total + season.rounds.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">الجولات المفتوحة</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {seasons.reduce((total, season) =>
                                        total + season.rounds.filter(r => r.status === 'open').length, 0
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Lock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">الجولات المقفلة</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {seasons.reduce((total, season) =>
                                        total + season.rounds.filter(r => r.status === 'locked').length, 0
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seasons List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">المواسم والجولات</h2>
                    </div>

                    {seasons.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مواسم</h3>
                            <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء موسم جديد</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowSeasonModal(true)}
                                    className="btn-primary"
                                >
                                    <Plus className="h-4 w-4 ml-2" />
                                    إضافة موسم
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {seasons.map((season) => (
                                <div key={season.id} className="p-6">
                                    {/* Season Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4 space-x-reverse">
                                            <button
                                                onClick={() => toggleSeasonExpansion(season.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {expandedSeasons.has(season.id) ? (
                                                    <ChevronUp className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5" />
                                                )}
                                            </button>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{season.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(season.start_date)} - {formatDate(season.end_date)}
                                                </p>
                                            </div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeasonStatus(season).color}`}>
                                                {getSeasonStatus(season).text}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <button
                                                onClick={() => {
                                                    setEditingSeason(season)
                                                    setShowSeasonModal(true)
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                title="تعديل الموسم"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingSeason(season)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="حذف الموسم"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rounds List */}
                                    {expandedSeasons.has(season.id) && (
                                        <div className="mr-8">
                                            {season.rounds.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500">
                                                    لا توجد جولات لهذا الموسم
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {season.rounds.map((round) => (
                                                        <div key={round.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{round.name}</p>
                                                                    <p className="text-sm text-gray-500">
                                                                        الجولة {round.round_number} • انتهاء التسجيل: {formatDateTime(round.deadline_at)}
                                                                    </p>
                                                                </div>
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoundStatus(round).color}`}>
                                                                    {getRoundStatus(round).text}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingRound(round)
                                                                        setShowRoundModal(true)
                                                                    }}
                                                                    className="text-indigo-600 hover:text-indigo-900 p-1"
                                                                    title="تعديل الجولة"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeletingRound(round)}
                                                                    className="text-red-600 hover:text-red-900 p-1"
                                                                    title="حذف الجولة"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Season Modal */}
            {showSeasonModal && (
                <SeasonModal
                    season={editingSeason}
                    onClose={() => {
                        setShowSeasonModal(false)
                        setEditingSeason(null)
                    }}
                    onSuccess={handleSuccess}
                />
            )}

            {/* Round Modal */}
            {showRoundModal && (
                <RoundModal
                    round={editingRound}
                    seasons={seasons}
                    onClose={() => {
                        setShowRoundModal(false)
                        setEditingRound(null)
                    }}
                    onSuccess={handleSuccess}
                />
            )}

            {/* Delete Confirm Modals */}
            <DeleteConfirmModal
                isOpen={!!deletingSeason}
                onClose={() => setDeletingSeason(null)}
                onConfirm={handleDeleteSeason}
                title="حذف الموسم"
                message="هل أنت متأكد من حذف هذا الموسم؟ سيتم حذف جميع الجولات المرتبطة به."
                itemName={deletingSeason?.name || ''}
                loading={deleteLoading}
            />

            <DeleteConfirmModal
                isOpen={!!deletingRound}
                onClose={() => setDeletingRound(null)}
                onConfirm={handleDeleteRound}
                title="حذف الجولة"
                message="هل أنت متأكد من حذف هذه الجولة؟ سيتم حذف جميع البيانات المرتبطة بها."
                itemName={deletingRound?.name || ''}
                loading={deleteLoading}
            />
        </AppLayout>
    )
}


