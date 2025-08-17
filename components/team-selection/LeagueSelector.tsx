'use client'

import { useState } from 'react'
import { League, User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { X, Trophy, Users, Lock, Globe, Plus, Crown } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface LeagueSelectorProps {
    isOpen: boolean
    onClose: () => void
    leagues: League[]
    selectedLeagueId: string
    onSelectLeague: (leagueId: string) => void
    user: User
}

export function LeagueSelector({
    isOpen,
    onClose,
    leagues,
    selectedLeagueId,
    onSelectLeague,
    user
}: LeagueSelectorProps) {
    const { addToast } = useToast()
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newLeague, setNewLeague] = useState({
        name: '',
        description: '',
        max_teams: 20,
        entry_fee: 0,
        type: 'private' as 'public' | 'private'
    })

    if (!isOpen) return null

    const handleSelectLeague = (leagueId: string) => {
        onSelectLeague(leagueId)
        onClose()
        addToast({
            type: 'success',
            title: 'تم اختيار الدوري',
            message: 'تم اختيار الدوري بنجاح'
        })
    }

    const handleCreateLeague = async () => {
        if (!newLeague.name.trim()) {
            addToast({
                type: 'error',
                title: 'اسم الدوري مطلوب',
                message: 'يرجى إدخال اسم للدوري'
            })
            return
        }

        setCreating(true)
        try {
            const { data: league, error } = await supabase
                .from('leagues')
                .insert({
                    name: newLeague.name,
                    description: newLeague.description,
                    type: newLeague.type,
                    season_id: '1', // Default season for now
                    max_teams: newLeague.max_teams,
                    entry_fee: newLeague.entry_fee,
                    is_active: true,
                    created_by: user.id
                })
                .select()
                .single()

            if (error) throw error

            // Join the league as admin
            await supabase
                .from('league_members')
                .insert({
                    league_id: league.id,
                    user_id: user.id,
                    user_team_id: '', // Will be set when team is created
                    is_admin: true
                })

            addToast({
                type: 'success',
                title: 'تم إنشاء الدوري',
                message: 'تم إنشاء الدوري الخاص بك بنجاح'
            })

            // Select the new league
            onSelectLeague(league.id)
            setShowCreateForm(false)
            setNewLeague({
                name: '',
                description: '',
                max_teams: 20,
                entry_fee: 0,
                type: 'private'
            })
            onClose()
        } catch (error) {
            console.error('Error creating league:', error)
            addToast({
                type: 'error',
                title: 'خطأ في إنشاء الدوري',
                message: 'حدث خطأ أثناء إنشاء الدوري. يرجى المحاولة مرة أخرى.'
            })
        } finally {
            setCreating(false)
        }
    }

    const publicLeagues = leagues.filter(l => l.type === 'public')
    const privateLeagues = leagues.filter(l => l.type === 'private')

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">اختيار الدوري</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Create League Button */}
                        <div className="mb-6">
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                            >
                                <Plus className="h-5 w-5" />
                                <span>إنشاء دوري خاص</span>
                            </button>
                        </div>

                        {/* Create League Form */}
                        {showCreateForm && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">إنشاء دوري خاص</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اسم الدوري *
                                        </label>
                                        <input
                                            type="text"
                                            value={newLeague.name}
                                            onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="أدخل اسم الدوري"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            نوع الدوري
                                        </label>
                                        <select
                                            value={newLeague.type}
                                            onChange={(e) => setNewLeague({ ...newLeague, type: e.target.value as 'public' | 'private' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="private">دوري خاص</option>
                                            <option value="public">دوري عام</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الوصف
                                        </label>
                                        <textarea
                                            value={newLeague.description}
                                            onChange={(e) => setNewLeague({ ...newLeague, description: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows={2}
                                            placeholder="وصف الدوري (اختياري)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الحد الأقصى للفرق
                                        </label>
                                        <input
                                            type="number"
                                            value={newLeague.max_teams}
                                            onChange={(e) => setNewLeague({ ...newLeague, max_teams: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="2"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رسوم الانضمام (مليون)
                                        </label>
                                        <input
                                            type="number"
                                            value={newLeague.entry_fee}
                                            onChange={(e) => setNewLeague({ ...newLeague, entry_fee: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex space-x-3 space-x-reverse">
                                    <button
                                        onClick={handleCreateLeague}
                                        disabled={creating}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {creating ? 'جاري الإنشاء...' : 'إنشاء الدوري'}
                                    </button>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Public Leagues */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                                الدوريات العامة
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publicLeagues.map((league) => (
                                    <LeagueCard
                                        key={league.id}
                                        league={league}
                                        isSelected={selectedLeagueId === league.id}
                                        onSelect={() => handleSelectLeague(league.id)}
                                        showJoinButton={true}
                                    />
                                ))}
                                {publicLeagues.length === 0 && (
                                    <div className="col-span-full text-center text-gray-500 py-8">
                                        لا توجد دوريات عامة متاحة حالياً
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Private Leagues */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Lock className="h-5 w-5 mr-2 text-purple-600" />
                                الدوريات الخاصة
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {privateLeagues.map((league) => (
                                    <LeagueCard
                                        key={league.id}
                                        league={league}
                                        isSelected={selectedLeagueId === league.id}
                                        onSelect={() => handleSelectLeague(league.id)}
                                        showJoinButton={true}
                                        isOwner={league.created_by === user.id}
                                    />
                                ))}
                                {privateLeagues.length === 0 && (
                                    <div className="col-span-full text-center text-gray-500 py-8">
                                        لا توجد دوريات خاصة متاحة حالياً
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface LeagueCardProps {
    league: League
    isSelected: boolean
    onSelect: () => void
    showJoinButton?: boolean
    isOwner?: boolean
}

function LeagueCard({ league, isSelected, onSelect, showJoinButton, isOwner }: LeagueCardProps) {
    return (
        <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
            isSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
        }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Trophy className={`h-5 w-5 ${
                        league.type === 'public' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                    <h4 className="font-semibold text-gray-900">{league.name}</h4>
                    {isOwner && (
                        <Crown className="h-4 w-4 text-yellow-600" title="أنت مالك هذا الدوري" />
                    )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                    league.type === 'public' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                }`}>
                    {league.type === 'public' ? 'عام' : 'خاص'}
                </span>
            </div>
            
            {league.description && (
                <p className="text-sm text-gray-600 mb-3">{league.description}</p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1 space-x-reverse">
                    <Users className="h-4 w-4" />
                    <span>{league.max_teams || 'غير محدد'} فريق</span>
                </div>
                {league.entry_fee > 0 && (
                    <span>{league.entry_fee} مليون</span>
                )}
            </div>

            {showJoinButton && (
                <button
                    onClick={onSelect}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {isSelected ? 'مختار' : 'انضم للدوري'}
                </button>
            )}
        </div>
    )
}
