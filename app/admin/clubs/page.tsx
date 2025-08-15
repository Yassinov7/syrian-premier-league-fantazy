'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, Club } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { AddClubModal } from '@/components/dashboard/AddClubModal'
import { EditClubModal } from '@/components/admin/EditClubModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Plus, Edit, Trash2, Shield, MapPin, Calendar, Image } from 'lucide-react'

export default function AdminClubsPage() {
	const { user, loading: authLoading } = useAuth()
	const [clubs, setClubs] = useState<Club[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingClub, setEditingClub] = useState<Club | null>(null)
	const [deletingClub, setDeletingClub] = useState<Club | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)

	useEffect(() => {
		if (user) {
			fetchClubs()
		}
	}, [user])

	const fetchClubs = async () => {
		try {
			setLoading(true)
			const { data, error } = await supabase
				.from('clubs')
				.select('*')
				.order('name')

			if (error) throw error
			setClubs(data || [])
		} catch (error) {
			console.error('Error fetching clubs:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteClub = async () => {
		if (!deletingClub) return

		try {
			setDeleteLoading(true)
			const { error } = await supabase
				.from('clubs')
				.delete()
				.eq('id', deletingClub.id)

			if (error) throw error

			await fetchClubs()
			setDeletingClub(null)
		} catch (error) {
			console.error('Error deleting club:', error)
			alert('فشل في حذف النادي')
		} finally {
			setDeleteLoading(false)
		}
	}

	const handleSuccess = () => {
		setShowAddModal(false)
		setEditingClub(null)
		fetchClubs()
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
						<h1 className="text-3xl font-bold text-gray-900">إدارة الأندية</h1>
						<p className="text-gray-600 mt-2">إضافة وتعديل وحذف أندية الدوري</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
						className="btn-primary flex items-center space-x-2 space-x-reverse"
					>
						<Plus className="h-4 w-4" />
						<span>إضافة نادي</span>
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Shield className="h-6 w-6 text-blue-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">إجمالي الأندية</p>
								<p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-green-100 rounded-lg">
								<MapPin className="h-6 w-6 text-green-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">المدن</p>
								<p className="text-2xl font-bold text-gray-900">
									{new Set(clubs.map(c => c.city)).size}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Calendar className="h-6 w-6 text-purple-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">أقدم نادي</p>
								<p className="text-2xl font-bold text-gray-900">
									{clubs.length > 0 ? Math.min(...clubs.map(c => c.founded_year)) : '-'}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Clubs Table */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-900">قائمة الأندية</h2>
					</div>

					{clubs.length === 0 ? (
						<div className="text-center py-12">
							<Shield className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد أندية</h3>
							<p className="mt-1 text-sm text-gray-500">ابدأ بإضافة نادي جديد</p>
							<div className="mt-6">
								<button
									onClick={() => setShowAddModal(true)}
									className="btn-primary"
								>
									<Plus className="h-4 w-4 ml-2" />
									إضافة نادي
								</button>
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											النادي
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											المدينة
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											سنة التأسيس
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											الشعار
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											الإجراءات
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{clubs.map((club) => (
										<tr key={club.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													{club.logo_url ? (
														<img
															className="h-8 w-8 rounded-full ml-3"
															src={club.logo_url}
															alt={club.name}
														/>
													) : (
														<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ml-3">
															<Shield className="h-4 w-4 text-gray-500" />
														</div>
													)}
													<div>
														<div className="text-sm font-medium text-gray-900">
															{club.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<MapPin className="h-4 w-4 text-gray-400 ml-1" />
													<span className="text-sm text-gray-900">{club.city}</span>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<Calendar className="h-4 w-4 text-gray-400 ml-1" />
													<span className="text-sm text-gray-900">{club.founded_year}</span>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{club.logo_url ? (
													<div className="flex items-center">
														<Image className="h-4 w-4 text-green-500 ml-1" />
														<span className="text-sm text-green-600">متوفر</span>
													</div>
												) : (
													<div className="flex items-center">
														<Image className="h-4 w-4 text-gray-400 ml-1" />
														<span className="text-sm text-gray-500">غير متوفر</span>
													</div>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												<div className="flex items-center space-x-2 space-x-reverse">
													<button
														onClick={() => setEditingClub(club)}
														className="text-indigo-600 hover:text-indigo-900 p-1"
														title="تعديل"
													>
														<Edit className="h-4 w-4" />
													</button>
													<button
														onClick={() => setDeletingClub(club)}
														className="text-red-600 hover:text-red-900 p-1"
														title="حذف"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* Add Club Modal */}
			{showAddModal && (
				<AddClubModal
					onClose={() => setShowAddModal(false)}
					onSuccess={handleSuccess}
				/>
			)}

			{/* Edit Club Modal */}
			{editingClub && (
				<EditClubModal
					club={editingClub}
					onClose={() => setEditingClub(null)}
					onSuccess={handleSuccess}
				/>
			)}

			{/* Delete Confirm Modal */}
			<DeleteConfirmModal
				isOpen={!!deletingClub}
				onClose={() => setDeletingClub(null)}
				onConfirm={handleDeleteClub}
				title="حذف النادي"
				message="هل أنت متأكد من حذف هذا النادي؟ سيتم حذف جميع البيانات المرتبطة به."
				itemName={deletingClub?.name || ''}
				loading={deleteLoading}
			/>
		</AppLayout>
	)
}


