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

interface Round {
	id: string
	season_id: string
	name: string
	round_number: number
	deadline_at: string
	status: 'open' | 'locked' | 'finished'
	created_at: string
}

interface RoundModalProps {
	round?: Round | null
	seasons: Season[]
	onClose: () => void
	onSuccess: () => void
}

export function RoundModal({ round, seasons, onClose, onSuccess }: RoundModalProps) {
	const [formData, setFormData] = useState({
		season_id: round?.season_id || '',
		name: round?.name || '',
		round_number: round?.round_number || 1,
		deadline_at: round?.deadline_at || '',
		status: round?.status || 'open'
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const isEditing = !!round

	useEffect(() => {
		if (round) {
			setFormData({
				season_id: round.season_id,
				name: round.name,
				round_number: round.round_number,
				deadline_at: round.deadline_at,
				status: round.status
			})
		}
	}, [round])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			if (isEditing) {
				const { error } = await supabase
					.from('rounds')
					.update({
						season_id: formData.season_id,
						name: formData.name.trim(),
						round_number: formData.round_number,
						deadline_at: formData.deadline_at,
						status: formData.status
					})
					.eq('id', round.id)

				if (error) throw error
			} else {
				const { error } = await supabase
					.from('rounds')
					.insert({
						season_id: formData.season_id,
						name: formData.name.trim(),
						round_number: formData.round_number,
						deadline_at: formData.deadline_at,
						status: formData.status
					})

				if (error) throw error
			}

			onSuccess()
		} catch (error) {
			console.error('Error saving round:', error)
			setError('خطأ في حفظ الجولة')
		} finally {
			setLoading(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: name === 'round_number' ? parseInt(value) : value
		}))
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-medium text-gray-900">
							{isEditing ? 'تعديل الجولة' : 'إضافة جولة جديدة'}
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
							<label htmlFor="season_id" className="block text-sm font-medium text-gray-700 mb-2">
								الموسم *
							</label>
							<select
								id="season_id"
								name="season_id"
								value={formData.season_id}
								onChange={handleChange}
								required
								className="input-field w-full"
							>
								<option value="">اختر الموسم</option>
								{seasons.map((season) => (
									<option key={season.id} value={season.id}>
										{season.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
								اسم الجولة *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								className="input-field w-full"
								placeholder="مثال: الجولة الأولى"
							/>
						</div>

						<div>
							<label htmlFor="round_number" className="block text-sm font-medium text-gray-700 mb-2">
								رقم الجولة *
							</label>
							<input
								type="number"
								id="round_number"
								name="round_number"
								value={formData.round_number}
								onChange={handleChange}
								required
								min="1"
								className="input-field w-full"
								placeholder="1"
							/>
						</div>

						<div>
							<label htmlFor="deadline_at" className="block text-sm font-medium text-gray-700 mb-2">
								موعد انتهاء التسجيل *
							</label>
							<input
								type="datetime-local"
								id="deadline_at"
								name="deadline_at"
								value={formData.deadline_at}
								onChange={handleChange}
								required
								className="input-field w-full"
							/>
						</div>

						<div>
							<label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
								حالة الجولة *
							</label>
							<select
								id="status"
								name="status"
								value={formData.status}
								onChange={handleChange}
								required
								className="input-field w-full"
							>
								<option value="open">مفتوح</option>
								<option value="locked">مقفل</option>
								<option value="finished">منتهي</option>
							</select>
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
								{loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث الجولة' : 'إضافة الجولة')}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
