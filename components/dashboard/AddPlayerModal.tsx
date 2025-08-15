'use client'

import { useState } from 'react'
import { supabase, Club } from '@/lib/supabase'
import { X } from 'lucide-react'

interface AddPlayerModalProps {
    clubs?: Club[]
    onClose: () => void
    onSuccess: () => void
}

export function AddPlayerModal({ clubs, onClose, onSuccess }: AddPlayerModalProps) {
    const [name, setName] = useState('')
    const [position, setPosition] = useState<'GK' | 'DEF' | 'MID' | 'FWD'>('MID')
    const [clubId, setClubId] = useState('')
    const [price, setPrice] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error: insertError } = await supabase
                .from('players')
                .insert([
                    {
                        name,
                        position,
                        club_id: clubId,
                        price: parseFloat(price),
                        total_points: 0,
                    }
                ])

            if (insertError) throw insertError

            onSuccess()
        } catch (error) {
            setError('فشل في إضافة اللاعب. يرجى المحاولة مرة أخرى.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">إضافة لاعب جديد</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            اسم اللاعب
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="input-field"
                            placeholder="أدخل اسم اللاعب"
                        />
                    </div>

                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                            المركز
                        </label>
                        <select
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value as 'GK' | 'DEF' | 'MID' | 'FWD')}
                            required
                            className="input-field"
                        >
                            <option value="GK">حارس مرمى</option>
                            <option value="DEF">مدافع</option>
                            <option value="MID">لاعب وسط</option>
                            <option value="FWD">مهاجم</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="club" className="block text-sm font-medium text-gray-700 mb-2">
                            النادي
                        </label>
                        <select
                            id="club"
                            value={clubId}
                            onChange={(e) => setClubId(e.target.value)}
                            required
                            className="input-field"
                        >
                            <option value="">اختر النادي</option>
                            {(clubs || []).map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            السعر (نقطة)
                        </label>
                        <input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            min="1"
                            max="15"
                            className="input-field"
                            placeholder="أدخل سعر اللاعب"
                        />
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
                            {loading ? 'جاري الإضافة...' : 'إضافة اللاعب'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 