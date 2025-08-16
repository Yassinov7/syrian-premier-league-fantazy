'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { supabase, User, UserTeam, Player } from '@/lib/supabase'
import { User as UserIcon, Trophy, Users, Calendar, Edit, Save, X } from 'lucide-react'

interface TeamPlayer extends Player {
	is_captain: boolean
	is_vice_captain: boolean
}

export default function ProfilePage() {
	const { user, loading: authLoading } = useAuth()
	const [userProfile, setUserProfile] = useState<User | null>(null)
	const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
	const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([])
	const [loading, setLoading] = useState(true)
	const [editing, setEditing] = useState(false)
	const [editName, setEditName] = useState('')

	useEffect(() => {
		if (user) {
			fetchUserData()
		}
	}, [user])

	const fetchUserData = async () => {
		if (!user) return

		try {
			const [profileRes, teamRes] = await Promise.all([
				supabase.from('users').select('*').eq('id', user.id).single(),
				supabase.from('user_teams').select('*').eq('user_id', user.id).single()
			])

			if (profileRes.data) {
				setUserProfile(profileRes.data)
				setEditName(profileRes.data.full_name)
			}

			if (teamRes.data) {
				setUserTeam(teamRes.data)

				// Fetch team players
				const { data: players } = await supabase
					.from('user_team_players')
					.select(`
                        *,
                        players (*)
                    `)
					.eq('user_team_id', teamRes.data.id)

				if (players) {
					const formattedPlayers = players.map(p => ({
						...p.players,
						is_captain: p.is_captain,
						is_vice_captain: p.is_vice_captain
					}))
					setTeamPlayers(formattedPlayers)
				}
			}
		} catch (error) {
			console.error('Error fetching user data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSaveProfile = async () => {
		if (!userProfile || !editName.trim()) return

		try {
			const { error } = await supabase
				.from('users')
				.update({ full_name: editName.trim() })
				.eq('id', userProfile.id)

			if (!error) {
				setUserProfile({ ...userProfile, full_name: editName.trim() })
				setEditing(false)
			}
		} catch (error) {
			console.error('Error updating profile:', error)
		}
	}

	const handleCancelEdit = () => {
		setEditName(userProfile?.full_name || '')
		setEditing(false)
	}

	if (authLoading || loading) {
		return (
			<AppLayout userRole="user">
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
		<AppLayout userRole="user">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
					<p className="mt-2 text-gray-600">
						إدارة معلوماتك الشخصية وفرقك
					</p>
				</div>

				{/* Profile Section */}
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">المعلومات الشخصية</h2>
						{!editing ? (
							<button
								onClick={() => setEditing(true)}
								className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
							>
								<Edit className="h-4 w-4 mr-2" />
								تعديل
							</button>
						) : (
							<div className="flex space-x-2 space-x-reverse">
								<button
									onClick={handleSaveProfile}
									className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
								>
									<Save className="h-4 w-4 mr-2" />
									حفظ
								</button>
								<button
									onClick={handleCancelEdit}
									className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
								>
									<X className="h-4 w-4 mr-2" />
									إلغاء
								</button>
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
							<div className="flex items-center p-3 bg-gray-50 rounded-md">
								<UserIcon className="h-5 w-5 text-gray-400 mr-3" />
								<span className="text-gray-900">{userProfile?.email}</span>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
							{editing ? (
								<input
									type="text"
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							) : (
								<div className="flex items-center p-3 bg-gray-50 rounded-md">
									<UserIcon className="h-5 w-5 text-gray-400 mr-3" />
									<span className="text-gray-900">{userProfile?.full_name}</span>
								</div>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
							<div className="flex items-center p-3 bg-gray-50 rounded-md">
								<Trophy className="h-5 w-5 text-gray-400 mr-3" />
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${userProfile?.role === 'admin'
										? 'bg-purple-100 text-purple-800'
										: 'bg-blue-100 text-blue-800'
									}`}>
									{userProfile?.role === 'admin' ? 'مشرف' : 'مستخدم'}
								</span>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإنشاء</label>
							<div className="flex items-center p-3 bg-gray-50 rounded-md">
								<Calendar className="h-5 w-5 text-gray-400 mr-3" />
								<span className="text-gray-900">
									{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('ar-SA') : '-'}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Team Section */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-6">فريقي</h2>

					{userTeam ? (
						<div className="space-y-6">
							{/* Team Info */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center p-4 bg-blue-50 rounded-lg">
									<Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
									<p className="text-sm text-gray-600">اسم الفريق</p>
									<p className="text-lg font-bold text-blue-600">{userTeam.name}</p>
								</div>
								<div className="text-center p-4 bg-green-50 rounded-lg">
									<Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
									<p className="text-sm text-gray-600">إجمالي النقاط</p>
									<p className="text-lg font-bold text-green-600">{userTeam.total_points}</p>
								</div>
								<div className="text-center p-4 bg-purple-50 rounded-lg">
									<Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
									<p className="text-sm text-gray-600">عدد اللاعبين</p>
									<p className="text-lg font-bold text-purple-600">{teamPlayers.length}</p>
								</div>
							</div>

							{/* Team Players */}
							{teamPlayers.length > 0 ? (
								<div>
									<h3 className="text-lg font-medium text-gray-900 mb-4">لاعبي الفريق</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{teamPlayers.map((player) => (
											<div key={player.id} className="border border-gray-200 rounded-lg p-4">
												<div className="flex items-center justify-between mb-2">
													<h4 className="font-medium text-gray-900">{player.name}</h4>
													<div className="flex space-x-1 space-x-reverse">
														{player.is_captain && (
															<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
																C
															</span>
														)}
														{player.is_vice_captain && (
															<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
																VC
															</span>
														)}
													</div>
												</div>
												<p className="text-sm text-gray-500 mb-2">{player.position}</p>
												<p className="text-sm text-gray-600">النقاط: {player.total_points}</p>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="text-center py-8">
									<Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										لا يوجد لاعبون في الفريق
									</h3>
									<p className="text-gray-500">
										ابدأ ببناء فريقك من صفحة اختيار الفريق
									</p>
								</div>
							)}
						</div>
					) : (
						<div className="text-center py-8">
							<Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								لم يتم إنشاء فريق بعد
							</h3>
							<p className="text-gray-500">
								ابدأ بإنشاء فريقك من صفحة الفرق
							</p>
						</div>
					)}
				</div>
			</div>
		</AppLayout>
	)
}