'use client'

import { useState } from 'react'
import { Player, Match } from '@/lib/supabase'
import { X, Plus, Minus } from 'lucide-react'

interface PlayerStatsFormProps {
    player: Player
    match: Match
    onSave: (stats: any) => void
    onCancel: () => void
}

export function PlayerStatsForm({ player, match, onSave, onCancel }: PlayerStatsFormProps) {
    const [stats, setStats] = useState({
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        clean_sheet: false,
        minutes_played: 90
    })

    const handleStatChange = (field: string, value: number | boolean) => {
        setStats(prev => ({ ...prev, [field]: value }))
    }

    const incrementStat = (field: string) => {
        setStats(prev => ({ ...prev, [field]: (prev[field] as number) + 1 }))
    }

    const decrementStat = (field: string) => {
        setStats(prev => ({
            ...prev,
            [field]: Math.max(0, (prev[field] as number) - 1)
        }))
    }

    const calculatePoints = () => {
        let points = 0

        // Goals
        points += stats.goals * 4

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            ...stats,
            points: calculatePoints()
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        إحصائيات {player.name}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Player Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {player.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{player.name}</h4>
                                <p className="text-sm text-gray-500">
                                    {player.position === 'GK' ? 'حارس مرمى' :
                                        player.position === 'DEF' ? 'مدافع' :
                                            player.position === 'MID' ? 'لاعب وسط' : 'مهاجم'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Inputs */}
                    <div className="space-y-4">
                        {/* Goals */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">الأهداف</label>
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <button
                                    type="button"
                                    onClick={() => decrementStat('goals')}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{stats.goals}</span>
                                <button
                                    type="button"
                                    onClick={() => incrementStat('goals')}
                                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Assists */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">التمريرات الحاسمة</label>
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <button
                                    type="button"
                                    onClick={() => decrementStat('assists')}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{stats.assists}</span>
                                <button
                                    type="button"
                                    onClick={() => incrementStat('assists')}
                                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Yellow Cards */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">البطاقات الصفراء</label>
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <button
                                    type="button"
                                    onClick={() => decrementStat('yellow_cards')}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{stats.yellow_cards}</span>
                                <button
                                    type="button"
                                    onClick={() => incrementStat('yellow_cards')}
                                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Red Cards */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">البطاقات الحمراء</label>
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <button
                                    type="button"
                                    onClick={() => decrementStat('red_cards')}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{stats.red_cards}</span>
                                <button
                                    type="button"
                                    onClick={() => incrementStat('red_cards')}
                                    className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Minutes Played */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                دقائق اللعب
                            </label>
                            <input
                                type="number"
                                value={stats.minutes_played}
                                onChange={(e) => handleStatChange('minutes_played', parseInt(e.target.value) || 0)}
                                min="0"
                                max="120"
                                className="input-field"
                            />
                        </div>

                        {/* Clean Sheet (only for GK and DEF) */}
                        {(player.position === 'GK' || player.position === 'DEF') && (
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <input
                                    type="checkbox"
                                    id="clean_sheet"
                                    checked={stats.clean_sheet}
                                    onChange={(e) => handleStatChange('clean_sheet', e.target.checked)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="clean_sheet" className="text-sm font-medium text-gray-700">
                                    نظافة مرمى
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Points Preview */}
                    <div className="bg-primary-50 rounded-lg p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">النقاط المحسوبة</p>
                            <p className="text-2xl font-bold text-primary-600">
                                {calculatePoints()} نقطة
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 space-x-reverse">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary flex-1"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            حفظ الإحصائيات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
