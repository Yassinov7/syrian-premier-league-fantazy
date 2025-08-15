'use client'

import { useState } from 'react'
import { supabase, Club } from '@/lib/supabase'
import { X } from 'lucide-react'

interface AddMatchModalProps {
    clubs: Club[]
    onClose: () => void
    onSuccess: () => void
}

export function AddMatchModal({ clubs, onClose, onSuccess }: AddMatchModalProps) {
    const [homeClubId, setHomeClubId] = useState('')
    const [awayClubId, setAwayClubId] = useState('')
    const [matchDate, setMatchDate] = useState('')
    const [status, setStatus] = useState<'scheduled' | 'live' | 'finished'>('scheduled')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (homeClubId === awayClubId) {
            setError('لا يمكن أن يلعب النادي مع نفسه')
            setLoading(false)
            return
        }

        try {
            const { error: insertError } = await supabase
                .from('matches')
                .insert([
                    {
                        home_club_id: homeClubId,
                        away_club_id: awayClubId,
                        match_date: matchDate,
                        status,
                    }
                ])

            if (insertError) throw insertError

            onSuccess()
        } catch (error) {
            setError('فشل في إضافة المباراة. يرجى المحاولة مرة أخرى.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">إضافة مباراة جديدة</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="homeClub" className="block text-sm font-medium text-gray-700 mb-2">
                            النادي المضيف
                        </label>
                        <select
                            id="homeClub"
                            value={homeClubId}
                            onChange={(e) => setHomeClubId(e.target.value)}
                            required
                            className="input-field"
                        >
                            <option value="">اختر النادي المضيف</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="awayClub" className="block text-sm font-medium text-gray-700 mb-2">
                            النادي الضيف
                        </label>
                        <select
                            id="awayClub"
                            value={awayClubId}
                            onChange={(e) => setAwayClubId(e.target.value)}
                            required
                            className="input-field"
                        >
                            <option value="">اختر النادي الضيف</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700 mb-2">
                            تاريخ المباراة
                        </label>
                        <input
                            id="matchDate"
                            type="datetime-local"
                            value={matchDate}
                            onChange={(e) => setMatchDate(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                            حالة المباراة
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'scheduled' | 'live' | 'finished')}
                            required
                            className="input-field"
                        >
                            <option value="scheduled">مجدولة</option>
                            <option value="live">مباشر</option>
                            <option value="finished">منتهية</option>
                        </select>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex space-x-3 space-x-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'جاري الإضافة...' : 'إضافة المباراة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 