'use client'

import { useState } from 'react'
import { Club } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface EditClubModalProps {
    club: Club
    onClose: () => void
    onSuccess: () => void
}

export function EditClubModal({ club, onClose, onSuccess }: EditClubModalProps) {
    const [formData, setFormData] = useState({
        name: club.name,
        city: club.city,
        founded_year: club.founded_year,
        logo_url: club.logo_url || ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase
                .from('clubs')
                .update({
                    name: formData.name.trim(),
                    city: formData.city.trim(),
                    founded_year: parseInt(formData.founded_year.toString()),
                    logo_url: formData.logo_url.trim() || null
                })
                .eq('id', club.id)

            if (error) throw error

            onSuccess()
        } catch (error) {
            console.error('Error updating club:', error)
            setError('خطأ في تحديث النادي')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                        <h3 className="text-lg font-medium text-gray-900">تعديل النادي</h3>
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
                                اسم النادي *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="input-field w-full"
                                placeholder="اسم النادي"
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                المدينة *
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="input-field w-full"
                                placeholder="المدينة"
                            />
                        </div>

                        <div>
                            <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-2">
                                سنة التأسيس *
                            </label>
                            <input
                                type="number"
                                id="founded_year"
                                name="founded_year"
                                value={formData.founded_year}
                                onChange={handleChange}
                                required
                                min="1800"
                                max={new Date().getFullYear()}
                                className="input-field w-full"
                                placeholder="سنة التأسيس"
                            />
                        </div>

                        <div>
                            <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                                رابط الشعار (اختياري)
                            </label>
                            <input
                                type="url"
                                id="logo_url"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleChange}
                                className="input-field w-full"
                                placeholder="https://example.com/logo.png"
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
                                {loading ? 'جاري التحديث...' : 'تحديث النادي'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
