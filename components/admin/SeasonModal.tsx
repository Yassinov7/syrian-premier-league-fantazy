'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface Season {
	id: string
	name: string
	start_date: string
	end_date: string
	is_active: boolean
	created_at: string
}

interface SeasonModalProps {
	season?: Season | null
	onClose: () => void
	onSuccess: () => void
}

export function SeasonModal({ season, onClose, onSuccess }: SeasonModalProps) {
	const [formData, setFormData] = useState({
		name: season?.name || '',
		start_date: season?.start_date || '',
		end_date: season?.end_date || '',
		is_active: season?.is_active ?? true
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const isEditing = !!season

	useEffect(() => {
		if (season) {
			setFormData({
				name: season.name,
				start_date: season.start_date,
				end_date: season.end_date,
				is_active: season.is_active
			})
		}
	}, [season])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			if (isEditing) {
				const { error } = await supabase
					.from('seasons')
					.update({
						name: formData.name.trim(),
						start_date: formData.start_date,
						end_date: formData.end_date,
						is_active: formData.is_active
					})
					.eq('id', season.id)

				if (error) throw error
			} else {
				const { error } = await supabase
					.from('seasons')
					.insert({
						name: formData.name.trim(),
						start_date: formData.start_date,
						end_date: formData.end_date,
						is_active: formData.is_active
					})

				if (error) throw error
			}

			onSuccess()
		} catch (error) {
			console.error('Error saving season:', error)
			setError('خطأ في حفظ الموسم')
		} finally {
			setLoading(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}))
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-medium text-gray-900">
							{isEditing ? 'تعديل الموسم' : 'إضافة موسم جديد'}
						</h3>
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
								اسم الموسم *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								className="input-field w-full"
								placeholder="مثال: موسم 2024-2025"
							/>
						</div>

						<div>
							<label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
								تاريخ البداية *
							</label>
							<input
								type="date"
								id="start_date"
								name="start_date"
								value={formData.start_date}
								onChange={handleChange}
								required
								className="input-field w-full"
							/>
						</div>

						<div>
							<label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
								تاريخ النهاية *
							</label>
							<input
								type="date"
								id="end_date"
								name="end_date"
								value={formData.end_date}
								onChange={handleChange}
								required
								className="input-field w-full"
							/>
						</div>

						<div className="flex items-center">
							<input
								type="checkbox"
								id="is_active"
								name="is_active"
								checked={formData.is_active}
								onChange={handleChange}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
							/>
							<label htmlFor="is_active" className="mr-2 block text-sm text-gray-900">
								موسم نشط
							</label>
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
								{loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث الموسم' : 'إضافة الموسم')}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
