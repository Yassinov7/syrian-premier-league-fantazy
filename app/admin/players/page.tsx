'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase, Player, Club } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { AddPlayerModal } from '@/components/dashboard/AddPlayerModal'
import { EditPlayerModal } from '@/components/admin/EditPlayerModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Plus, Edit, Trash2, User, Shield, DollarSign, Trophy } from 'lucide-react'

export default function AdminPlayersPage() {
	const { user, loading: authLoading } = useAuth()
	const [players, setPlayers] = useState<(Player & { clubs: { name: string } })[]>([])
	const [clubs, setClubs] = useState<Club[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
	const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)

	useEffect(() => {
		if (user) {
			fetchData()
		}
	}, [user])

	const fetchData = async () => {
		try {
			setLoading(true)
			const [playersResponse, clubsResponse] = await Promise.all([
				supabase.from('players').select('*, clubs(name)').order('name'),
				supabase.from('clubs').select('*').order('name')
			])

			if (playersResponse.error) throw playersResponse.error
			if (clubsResponse.error) throw clubsResponse.error

			setPlayers(playersResponse.data || [])
			setClubs(clubsResponse.data || [])
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDeletePlayer = async () => {
		if (!deletingPlayer) return

		try {
			setDeleteLoading(true)
			const { error } = await supabase
				.from('players')
				.delete()
				.eq('id', deletingPlayer.id)

			if (error) throw error

			await fetchData()
			setDeletingPlayer(null)
		} catch (error) {
			console.error('Error deleting player:', error)
			alert('فشل في حذف اللاعب')
		} finally {
			setDeleteLoading(false)
		}
	}

	const handleSuccess = () => {
		setShowAddModal(false)
		setEditingPlayer(null)
		fetchData()
	}

	const getPositionText = (position: string) => {
		const positions = {
			'GK': 'حارس مرمى',
			'DEF': 'مدافع',
			'MID': 'لاعب وسط',
			'FWD': 'مهاجم'
		}
		return positions[position as keyof typeof positions] || position
	}

	const getPositionColor = (position: string) => {
		const colors = {
			'GK': 'bg-yellow-100 text-yellow-800',
			'DEF': 'bg-blue-100 text-blue-800',
			'MID': 'bg-green-100 text-green-800',
			'FWD': 'bg-red-100 text-red-800'
		}
		return colors[position as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
						<h1 className="text-3xl font-bold text-gray-900">إدارة اللاعبين</h1>
						<p className="text-gray-600 mt-2">إضافة وتعديل وحذف لاعبين الدوري</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
						className="btn-primary flex items-center space-x-2 space-x-reverse"
					>
						<Plus className="h-4 w-4" />
						<span>إضافة لاعب</span>
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-blue-100 rounded-lg">
								<User className="h-6 w-6 text-blue-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">إجمالي اللاعبين</p>
								<p className="text-2xl font-bold text-gray-900">{players.length}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-green-100 rounded-lg">
								<Shield className="h-6 w-6 text-green-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">عدد الأندية</p>
								<p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-purple-100 rounded-lg">
								<DollarSign className="h-6 w-6 text-purple-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">متوسط السعر</p>
								<p className="text-2xl font-bold text-gray-900">
									{players.length > 0
										? Math.round(players.reduce((sum, p) => sum + p.price, 0) / players.length)
										: '-'
									}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-yellow-100 rounded-lg">
								<Trophy className="h-6 w-6 text-yellow-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">أعلى نقاط</p>
								<p className="text-2xl font-bold text-gray-900">
									{players.length > 0
										? Math.max(...players.map(p => p.total_points))
										: '-'
									}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Players Table */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-900">قائمة اللاعبين</h2>
					</div>

					{players.length === 0 ? (
						<div className="text-center py-12">
							<User className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد لاعبين</h3>
							<p className="mt-1 text-sm text-gray-500">ابدأ بإضافة لاعب جديد</p>
							<div className="mt-6">
								<button
									onClick={() => setShowAddModal(true)}
									className="btn-primary"
								>
									<Plus className="h-4 w-4 ml-2" />
									إضافة لاعب
								</button>
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											اللاعب
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											النادي
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											المركز
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											السعر
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											النقاط
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											الإجراءات
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{players.map((player) => (
										<tr key={player.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ml-3">
														<User className="h-4 w-4 text-gray-500" />
													</div>
													<div>
														<div className="text-sm font-medium text-gray-900">
															{player.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-900">
													{(player.clubs as any)?.name || 'غير محدد'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPositionColor(player.position)}`}>
													{getPositionText(player.position)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-900">{player.price}</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-900">{player.total_points}</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												<div className="flex items-center space-x-2 space-x-reverse">
													<button
														onClick={() => setEditingPlayer(player)}
														className="text-indigo-600 hover:text-indigo-900 p-1"
														title="تعديل"
													>
														<Edit className="h-4 w-4" />
													</button>
													<button
														onClick={() => setDeletingPlayer(player)}
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

			{/* Add Player Modal */}
			{showAddModal && (
				<AddPlayerModal
					clubs={clubs}
					onClose={() => setShowAddModal(false)}
					onSuccess={handleSuccess}
				/>
			)}

			{/* Edit Player Modal */}
			{editingPlayer && (
				<EditPlayerModal
					player={editingPlayer}
					clubs={clubs}
					onClose={() => setEditingPlayer(null)}
					onSuccess={handleSuccess}
				/>
			)}

			{/* Delete Confirm Modal */}
			<DeleteConfirmModal
				isOpen={!!deletingPlayer}
				onClose={() => setDeletingPlayer(null)}
				onConfirm={handleDeletePlayer}
				title="حذف اللاعب"
				message="هل أنت متأكد من حذف هذا اللاعب؟ سيتم حذف جميع البيانات المرتبطة به."
				itemName={deletingPlayer?.name || ''}
				loading={deleteLoading}
			/>
		</AppLayout>
	)
}

// Prevent static generation to avoid authentication issues during build
export const dynamic = 'force-dynamic';


