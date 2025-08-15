'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface AddClubModalProps {
    onClose: () => void
    onSuccess: () => void
}

export function AddClubModal({ onClose, onSuccess }: AddClubModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        founded_year: '',
        logo_url: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error: insertError } = await supabase
                .from('clubs')
                .insert([{
                    name: formData.name.trim(),
                    city: formData.city.trim(),
                    founded_year: parseInt(formData.founded_year),
                    logo_url: formData.logo_url.trim() || null
                }])

            if (insertError) throw insertError

            onSuccess()
        } catch (error) {
            console.error('Error adding club:', error)
            setError('فشل في إضافة النادي. يرجى المحاولة مرة أخرى.')
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
                        <h3 className="text-lg font-medium text-gray-900">إضافة نادي جديد</h3>
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
                                {loading ? 'جاري الإضافة...' : 'إضافة النادي'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 