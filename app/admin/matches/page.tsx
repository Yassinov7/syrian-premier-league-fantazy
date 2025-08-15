'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { Plus, Edit, Trash2, Calendar, Trophy, Clock, Lock, Unlock, ChevronDown, ChevronUp, Users, Target } from 'lucide-react'

interface Club {
	id: string
	name: string
	city: string
	founded_year: number
	logo_url?: string
}

interface Round {
	id: string
	season_id: string
	name: string
	round_number: number
	deadline_at: string
	status: 'open' | 'locked' | 'finished'
}

interface Season {
	id: string
	name: string
	start_date: string
	end_date: string
	is_active: boolean
}

interface Match {
	id: string
	home_club_id: string
	away_club_id: string
	home_score?: number
	away_score?: number
	match_date: string
	status: 'scheduled' | 'live' | 'finished'
	round_id?: string
	created_at: string
}

interface MatchWithDetails extends Match {
	home_club: Club
	away_club: Club
	round?: Round
}

export default function AdminMatchesPage() {
	const { user, loading: authLoading } = useAuth()
	const [matches, setMatches] = useState<MatchWithDetails[]>([])
	const [clubs, setClubs] = useState<Club[]>([])
	const [rounds, setRounds] = useState<Round[]>([])
	const [seasons, setSeasons] = useState<Season[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingMatch, setEditingMatch] = useState<Match | null>(null)
	const [deletingMatch, setDeletingMatch] = useState<Match | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [selectedRound, setSelectedRound] = useState<string>('all')
	const [selectedStatus, setSelectedStatus] = useState<string>('all')

	useEffect(() => {
		if (user) {
			fetchData()
		}
	}, [user])

	const fetchData = async () => {
		try {
			setLoading(true)
			const [matchesResponse, clubsResponse, roundsResponse, seasonsResponse] = await Promise.all([
				supabase
					.from('matches')
					.select(`
						*,
						home_club:clubs!home_club_id(*),
						away_club:clubs!away_club_id(*),
						round:rounds(*)
					`)
					.order('match_date', { ascending: false }),
				supabase.from('clubs').select('*').order('name'),
				supabase.from('rounds').select('*').order('round_number'),
				supabase.from('seasons').select('*').order('start_date', { ascending: false })
			])

			if (matchesResponse.error) throw matchesResponse.error
			if (clubsResponse.error) throw clubsResponse.error
			if (roundsResponse.error) throw roundsResponse.error
			if (seasonsResponse.error) throw seasonsResponse.error

			setMatches(matchesResponse.data || [])
			setClubs(clubsResponse.data || [])
			setRounds(roundsResponse.data || [])
			setSeasons(seasonsResponse.data || [])
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteMatch = async () => {
		if (!deletingMatch) return

		try {
			setDeleteLoading(true)
			const { error } = await supabase
				.from('matches')
				.delete()
				.eq('id', deletingMatch.id)

			if (error) throw error

			await fetchData()
			setDeletingMatch(null)
		} catch (error) {
			console.error('Error deleting match:', error)
			alert('فشل في حذف المباراة')
		} finally {
			setDeleteLoading(false)
		}
	}

	const handleSuccess = () => {
		setShowAddModal(false)
		setEditingMatch(null)
		fetchData()
	}

	const getMatchStatus = (match: Match) => {
		const now = new Date()
		const matchDate = new Date(match.match_date)

		if (match.status === 'finished') return { text: 'منتهية', color: 'bg-gray-100 text-gray-800' }
		if (match.status === 'live') return { text: 'مباشر', color: 'bg-red-100 text-red-800' }
		if (now > matchDate) return { text: 'متأخرة', color: 'bg-yellow-100 text-yellow-800' }
		return { text: 'مجدولة', color: 'bg-green-100 text-green-800' }
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ar-SA', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const filteredMatches = matches.filter(match => {
		const roundMatch = selectedRound === 'all' || match.round_id === selectedRound
		const statusMatch = selectedStatus === 'all' || match.status === selectedStatus
		return roundMatch && statusMatch
	})

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
						<h1 className="text-3xl font-bold text-gray-900">إدارة المباريات</h1>
						<p className="text-gray-600 mt-2">إضافة وإدارة مباريات الدوري</p>
					</div>
					<button
						onClick={() => setShowAddModal(true)}
						className="btn-primary flex items-center space-x-2 space-x-reverse"
					>
						<Plus className="h-4 w-4" />
						<span>إضافة مباراة</span>
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Target className="h-6 w-6 text-blue-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">إجمالي المباريات</p>
								<p className="text-2xl font-bold text-gray-900">{matches.length}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-green-100 rounded-lg">
								<Calendar className="h-6 w-6 text-green-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">مباريات مجدولة</p>
								<p className="text-2xl font-bold text-gray-900">
									{matches.filter(m => m.status === 'scheduled').length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-yellow-100 rounded-lg">
								<Clock className="h-6 w-6 text-yellow-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">مباريات مباشر</p>
								<p className="text-2xl font-bold text-gray-900">
									{matches.filter(m => m.status === 'live').length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Trophy className="h-6 w-6 text-purple-600" />
							</div>
							<div className="mr-4">
								<p className="text-sm font-medium text-gray-600">مباريات منتهية</p>
								<p className="text-2xl font-bold text-gray-900">
									{matches.filter(m => m.status === 'finished').length}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<label htmlFor="round-filter" className="block text-sm font-medium text-gray-700 mb-2">
								تصفية حسب الجولة
							</label>
							<select
								id="round-filter"
								value={selectedRound}
								onChange={(e) => setSelectedRound(e.target.value)}
								className="input-field w-full"
							>
								<option value="all">جميع الجولات</option>
								{rounds.map((round) => (
									<option key={round.id} value={round.id}>
										{round.name}
									</option>
								))}
							</select>
						</div>
						<div className="flex-1">
							<label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
								تصفية حسب الحالة
							</label>
							<select
								id="status-filter"
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
								className="input-field w-full"
							>
								<option value="all">جميع الحالات</option>
								<option value="scheduled">مجدولة</option>
								<option value="live">مباشر</option>
								<option value="finished">منتهية</option>
							</select>
						</div>
					</div>
				</div>

				{/* Matches Table */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-900">قائمة المباريات</h2>
					</div>

					{filteredMatches.length === 0 ? (
						<div className="text-center py-12">
							<Target className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مباريات</h3>
							<p className="mt-1 text-sm text-gray-500">ابدأ بإضافة مباراة جديدة</p>
							<div className="mt-6">
								<button
									onClick={() => setShowAddModal(true)}
									className="btn-primary"
								>
									<Plus className="h-4 w-4 ml-2" />
									إضافة مباراة
								</button>
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											المباراة
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											الجولة
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											التاريخ
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											النتيجة
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											الحالة
										</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
											الإجراءات
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredMatches.map((match) => (
										<tr key={match.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-3 space-x-reverse">
														<div className="text-sm font-medium text-gray-900">
															{match.home_club.name}
														</div>
														<div className="text-sm text-gray-500">vs</div>
														<div className="text-sm font-medium text-gray-900">
															{match.away_club.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-900">
													{match.round?.name || 'غير محدد'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm text-gray-900">
													{formatDate(match.match_date)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="text-sm font-medium text-gray-900">
													{match.home_score !== null && match.away_score !== null
														? `${match.home_score} - ${match.away_score}`
														: 'لم تُلعب بعد'
													}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMatchStatus(match).color}`}>
													{getMatchStatus(match).text}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												<div className="flex items-center space-x-2 space-x-reverse">
													<button
														onClick={() => {
															setEditingMatch(match)
															setShowAddModal(true)
														}}
														className="text-indigo-600 hover:text-indigo-900 p-1"
														title="تعديل"
													>
														<Edit className="h-4 w-4" />
													</button>
													<button
														onClick={() => setDeletingMatch(match)}
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

			{/* TODO: Add Match Modal */}
			{/* TODO: Add DeleteConfirmModal */}
		</AppLayout>
	)
}
