'use client'

import { useState } from 'react'
import { Player, Club } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface EditPlayerModalProps {
    player: Player
    clubs: Club[]
    onClose: () => void
    onSuccess: () => void
}

export function EditPlayerModal({ player, clubs, onClose, onSuccess }: EditPlayerModalProps) {
    const [formData, setFormData] = useState({
        name: player.name,
        position: player.position as 'GK' | 'DEF' | 'MID' | 'FWD',
        club_id: player.club_id,
        price: player.price.toString()
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase
                .from('players')
                .update({
                    name: formData.name.trim(),
                    position: formData.position,
                    club_id: formData.club_id,
                    price: parseFloat(formData.price)
                })
                .eq('id', player.id)

            if (error) throw error

            onSuccess()
        } catch (error) {
            console.error('Error updating player:', error)
            setError('خطأ في تحديث اللاعب')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">تعديل اللاعب</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                اسم اللاعب *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="input-field w-full"
                                placeholder="اسم اللاعب"
                            />
                        </div>

                        <div>
                            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                                المركز *
                            </label>
                            <select
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                required
                                className="input-field w-full"
                            >
                                <option value="GK">حارس مرمى</option>
                                <option value="DEF">مدافع</option>
                                <option value="MID">لاعب وسط</option>
                                <option value="FWD">مهاجم</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="club_id" className="block text-sm font-medium text-gray-700 mb-2">
                                النادي *
                            </label>
                            <select
                                id="club_id"
                                name="club_id"
                                value={formData.club_id}
                                onChange={handleChange}
                                required
                                className="input-field w-full"
                            >
                                <option value="">اختر النادي</option>
                                {clubs.map((club) => (
                                    <option key={club.id} value={club.id}>
                                        {club.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                السعر (نقطة) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="1"
                                max="15"
                                className="input-field w-full"
                                placeholder="سعر اللاعب"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'جاري التحديث...' : 'تحديث اللاعب'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


